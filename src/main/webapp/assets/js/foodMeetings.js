$(function() {	
	var communicationService = new CommunicationService();	
	initComponents(communicationService);
		
	$(window).on('beforeunload', function() {
		communicationService.disconnect();
	});
});

var initComponents = function(communicationService){
	var homeRoomId = "homeRoom";
	var $newMeetingPlaceholder = $("#new-meeting-placeholder");
	var $newMeeting = $("#new-meeting");
	var foodMeetingsContainer = $('.food-meetings');
	
	var foodMeetingsList = new FoodMeetingsList(foodMeetingsContainer, $newMeetingPlaceholder);
	foodMeetingsList.init();

	var modal = new ModalSearchImage($("#image-card-id"), $("#image-link-id"),
		$('.image-link'), $('.image-links'), $("#image-card-id"));
	modal.init();
	
	communicationService.connect('ws://' + location.host + '/ws', homeRoomId);	
	communicationService.onMessage(function(event) {
		$.each(event.events, function(index, item) {
			var eventType = Object.getOwnPropertyNames(item.event)[0];

			var eventMessage = item.event[eventType];

			switch (eventType) {
				case "org.jala.efeeder.servlets.websocket.avro.WelcomeEvent":
					console.log('WebSockets connected by FoodMeetings.');
					break;

				case "org.jala.efeeder.servlets.websocket.avro.CreateFoodMeetingEvent":
					foodMeetingsList.addMeeting(eventMessage, true);

					var $toastContent = $('<span><a href="#' + eventMessage.id + '" class="white-text">' + eventMessage.name + ' meeting was created successfully!</a></span>');
					Materialize.toast($toastContent, 5000);
					break;
				case "org.jala.efeeder.servlets.websocket.avro.ChangeFoodMeetingStatusEvent":
					foodMeetingsList.notifyMeetingStatusChanged(eventMessage);
					break;
			}
		});
	});
			
	var newFoodMeeting = new NewFoodMeeting(foodMeetingsContainer, homeRoomId, communicationService, $newMeetingPlaceholder, $newMeeting);
	newFoodMeeting.init();
}

var FoodMeetingsList = function(foodMeetingsContainer, newMeetingPlaceholder) {
	this.newMeetingPlaceholder = newMeetingPlaceholder;
	this.foodMeetingsContainer = foodMeetingsContainer;
	this.meetings = [];

	var self = this;

	var foodMeetingTmpl;

	$.get('/assets/templates/foodMeeting.html', function(template) {
		foodMeetingTmpl = template;
		$.get('/action/getAllMeetings', function(meetings) {
			_.each(meetings, function(meeting) {
				insertMeeting(meeting, false);
			})
		});
	});

	var insertMeeting = function(newMeeting, isWebSoccket) {
		var $foodMeetingTmpl = $.templates(foodMeetingTmpl);
		var imageHeight = 188;
		var firstImageHeight = 500;
		var userOwner = newMeeting.userOwner["org.jala.efeeder.servlets.websocket.avro.UserOwner"] || newMeeting.userOwner;

		self.meetings.push(newMeeting);
		var isNewMeetingFirst = _.sortBy(self.meetings, "eventDate")[0].id === newMeeting.id;		
		var isMeetingOwner = userOwner.id === parseInt(Cookies.get("userId"));

		var data = {
			"id": newMeeting.id,
			"name": newMeeting.name,
			"imageLink": newMeeting.imageLink,
			"status": newMeeting.status,
			"date": newMeeting.eventDate,
			"quickViewDate": moment(newMeeting.eventDate).calendar(),
			"detailedViewDate": moment(newMeeting.eventDate).format('MMMM Do YYYY, h:mm a'),
			"width": newMeeting.width,
			"styles": isNewMeetingFirst ? "is-first col s12 l9" : "col s6 l3",
			"imgHeight": isNewMeetingFirst ? firstImageHeight : imageHeight,			
			"imgRedirectTo": getImagRedirectTo(newMeeting.id, newMeeting.status),
			"settingButtonStyles": isMeetingOwner ? "" : "hide",
			"userOwner": userOwner.name + ' ' + userOwner.lastName,
		};

		var $newFoodMeeting = $($foodMeetingTmpl.render(data));
		$newFoodMeeting.imagesLoaded().always(function() {
			if (isNewMeetingFirst) {
				$(".is-first").addClass('s6 l3');
				$(".is-first").find('img').css('height', imageHeight + 'px');
				$(".is-first").removeClass('is-first s12 l9');
			}
			foodMeetingsContainer.isotope('insert', $newFoodMeeting);
			$("#preloader").hide();
		});
	}
	
	var notifyMeetingStatusChanged = function(message) {
		var newStatus = message.newStatus;
		var idFoodMeeting = message.idFoodMeeting;
		
		var meetingName = _.find(self.meetings, {id: idFoodMeeting}).name;
		
		$("#" + idFoodMeeting + " .img-redirect-to").prop("href", getImagRedirectTo(idFoodMeeting, newStatus));
		$("#" + idFoodMeeting + " .status").text(newStatus);		
		var $toastContent = $('<span><a href="#' + idFoodMeeting + '" class="white-text">' + meetingName
				+ ' is now in ' + newStatus + ' mode!'+'</a></span>');
		Materialize.toast($toastContent, 5000);
	}

	var getImagRedirectTo = function(id, status) {
		var page = "suggestions";
		switch (status) {
			case 'Voting':
				page = "suggestions";
				break;
			case 'Order':
				page = "order";
				break;
			case 'Payment':
				page = "details";
				break;	
			case 'Buying':
				page = "details";
				break;	
			case 'Finish':
				page = "details";
				break;
		}
		return '/action/' + page + '?id_food_meeting=' + id;
	}

	var addEvent = function() {
		self.foodMeetingsContainer.isotope({
			itemSelector: '.grid-item',
			layoutMode: 'packery',
			getSortData: {
				date: function(itemElem) {
					return $(itemElem).data("date");
				}
			},
			sortBy: 'date',
		});

		self.foodMeetingsContainer.isotope('insert', self.newMeetingPlaceholder);
	};

	return {
		init: function() {
			addEvent();
		},
		addMeeting: insertMeeting,
		notifyMeetingStatusChanged: notifyMeetingStatusChanged
	};
};

var NewFoodMeeting = function(foodMeetingsContainer, homeRoomId, communicationService, newMeetingPlaceholder, newMeeting) {
	this.foodMeetingsContainer = foodMeetingsContainer;
	this.homeRoomId = homeRoomId;
	this.communicationService = communicationService;
	this.newMeetingPlaceholder = newMeetingPlaceholder;
	this.newMeeting = newMeeting;

	var dateField = $('#new-date-field-id');
	var timeField = $('#new-time-field-id');
	var addMeetingForm = $("#add-meeting-form-id");
	var addMeetingImage = $("#new-image-card-id");
	var cancelMeetingBtn = $("#cancelCreateMeeting");

	var defaultImage = "http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg";
	var defaultDate = moment(new Date()).format("D MMMM, YYYY");
	var defaultTime = moment(new Date().getTime() + (3 * 60 * 60 * 1000)).format("HH:mm");

	self = this;

	var addFieldEvent = function() {
		dateField.pickadate({
			selectMonths: true,
			selectYears: 15,
			closeOnSelect: true,
			formatSubmit: 'd mmmm,yyyy',
			clear: '',
			onSet: function(arg) {
				if ('select' in arg) {
					this.close();
				}
			}
		});

		timeField.pickatime({
			twelvehour: false,
			autoclose: true,
			vibrate: true
		});
	};

	var initDateTime = function() {
		$('#new-date-field-id').val(defaultDate);
		$('#new-time-field-id').val(defaultTime);

	};
	var addNewMeetingValidate = function() {
		$.validator.setDefaults({
			errorClass: 'invalid',
			validClass: "valid",
			errorPlacement: function(error, element) {
				$(element)
					.closest("form")
					.find("label[for='" + element.attr("id") + "']")
					.attr('data-error', error.text());
			},
			submitHandler: function(form) {
				console.log('form ok');
			}
		});

		addMeetingForm.validate({
			rules: {
				meeting_name: "required"
			}
		});


	};

	var addClickEvents = function() {
		addMeetingForm.submit(function(event) {
			event.preventDefault();

			if (addMeetingForm.valid())
			{
				var $form = $(this),
					meeting_name = $form.find("input[name='meeting_name']").val(),
					date = $form.find("input[name='date']").val(),
					time = $form.find("input[name='time']").val(),
					url = $form.attr("action");

				var imageLink = $("#new-image-card-id").attr("src");

				self.communicationService.sendMessage(
					{
						user: parseInt(Cookies.get("userId")),
						room: self.homeRoomId,
						command: "CreateFoodMeeting",
						events: [
							{
								event: {
									CreateFoodMeetingEvent: {
										id: 0,
										name: meeting_name,
										eventDate: moment(date + " " + time, "DD MMMM, YYYY hh:mm").valueOf(),
										status: "",
										imageLink: imageLink,
										width: 0,
										userOwner: {
											id: 0,
											name: "",
											lastName: ""
										}
									}
								}
							}
						]
					});
					
				resetNewMeetingForm();
			}
		});

		cancelMeetingBtn.click(function(event) {
			resetNewMeetingForm();
		});

		addMeetingImage.click(function() {
			organizeModalImages();
		});

		$("#new-meeting-hello-meessage").click(function() {
			self.foodMeetingsContainer.isotope('remove', self.newMeetingPlaceholder);
			self.foodMeetingsContainer.isotope('insert', self.newMeeting);
		});

	};

	var resetNewMeetingForm = function() {
		$("#add-meeting-form-id").trigger("reset");
		$("#new-image-card-id").attr("src", defaultImage);
		initDateTime();

		self.foodMeetingsContainer.isotope('remove', self.newMeeting);
		self.foodMeetingsContainer.isotope('insert', self.newMeetingPlaceholder);
	};

	var onModalHide = function() {
		var imageLink = $("#image-link-id").val();
		$("#new-image-card-id").attr("src", imageLink);
		foodMeetingsContainer.isotope('layout');
	};

	var organizeModalImages = function() {
		$('.image-links').imagesLoaded().done(function() {
			$('.image-links').masonry({
				itemSelector: '.grid-item',
				columnWidth: 50
			});
		});
	};

	var initImageModal = function() {
		$('.modal-trigger').leanModal();
	};
	return {
		init: function() {
			addFieldEvent();
			addNewMeetingValidate();
			addClickEvents();
			initImageModal();
			initDateTime();
		},
		reset: resetNewMeetingForm
	};
};

