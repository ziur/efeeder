$(function () {

	var createMeetingRoomId = "createMeetingRoomId";
	var $newMeetingPlaceholder = $("#new-meeting-placeholder");
	var $newMeeting = $("#new-meeting");

	var foodMeetingsContainer = $('.food-meetings');

	var foodMeetingsList = new FoodMeetingsList(foodMeetingsContainer, $newMeetingPlaceholder);
	foodMeetingsList.init();

	var communicationService = new CommunicationService();

	communicationService.onMessage(function (event) {
		$.each(event.events, function(index, item) {
			var eventType = Object.getOwnPropertyNames(item.event)[0];

			var eventMessage = item.event[eventType];

			switch (eventType) {
			case "org.jala.efeeder.servlets.websocket.avro.WelcomeEvent":
				console.log('WebSockets connected by FoodMeetings.');
				break;

			case "org.jala.efeeder.servlets.websocket.avro.CreateFoodMeetingEvent":				
				
				foodMeetingsList.addMeeting(eventMessage);
				newFoodMeeting.reset();

				var $toastContent = $('<span><a href="#'+eventMessage.id+'" class="white-text">' + eventMessage.name + ' meeting was created successfully!</a></span>');
				Materialize.toast($toastContent, 5000);
				break;
			}
		});
	});

	communicationService.connect('ws://' + location.host + '/ws', createMeetingRoomId);

	var newFoodMeeting = new NewFoodMeeting(foodMeetingsContainer, createMeetingRoomId, communicationService, $newMeetingPlaceholder, $newMeeting);

	newFoodMeeting.init();
});

var FoodMeetingsList = function(foodMeetingsContainer, newMeetingPlaceholder){
	this.newMeetingPlaceholder = newMeetingPlaceholder;
	this.foodMeetingsContainer = foodMeetingsContainer;
	this.meetings = [];

	var self = this;

	var foodMeetingTmpl;

	$.get('/assets/templates/foodMeeting.html', function(template) {
		foodMeetingTmpl = template;        
		$.get('/action/getAllMeetings', function(meetings){
			self.meetings = meetings;
			_.each(meetings, function(meeting){
				insertMeeting(meeting);
			})
		});
	});

	var insertMeeting = function(newMeeting) {
		var $foodMeetingTmpl = $.templates(foodMeetingTmpl);		
		var imageHeight = 188;
		var firstImageHeight = 500;

		var isNewMeetingFirst = _.every(self.meetings, function(meeting){
			return newMeeting.eventDate <= meeting.eventDate;
		});

		var data = { 
			"id": newMeeting.id, 
			"name" : newMeeting.name, 
			"imageLink": newMeeting.imageLink, 
			"status": newMeeting.status, 
			"date": newMeeting.eventDate, 
			"quickViewDate": moment(newMeeting.eventDate).calendar(),
			"detailedViewDate": moment(newMeeting.eventDate).format('MMMM Do YYYY, h:mm a'),
			"width": newMeeting.width,
			"styles": isNewMeetingFirst ? "is-first col s12 l9" : "col s6 l3",
			"imgHeight": isNewMeetingFirst ? firstImageHeight : imageHeight,
			"statusStyles": newMeeting.status === 'Finish' ? 'new badge blue' : 'new badge',
			"imgRedirectTo": getImagRedirectTo(newMeeting.id, newMeeting.status)
		};
		
		self.meetings.push(newMeeting);
		var $newFoodMeeting = $($foodMeetingTmpl.render(data));
		$newFoodMeeting.imagesLoaded().always(function(){			
			if(isNewMeetingFirst) {
				$(".is-first").addClass('s6 l3');
				$(".is-first").find('img').css('height', imageHeight + 'px');
				$(".is-first").removeClass('is-first s12 l9');				
			}			
			foodMeetingsContainer.isotope('insert', $newFoodMeeting);			
			$("#preloader").hide();	
		});
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
			case 'Finish':
				page = "finish";
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
			sortBy : 'date',
		});

		self.foodMeetingsContainer.isotope('insert', self.newMeetingPlaceholder);
	};

	return {
		init: function() {
			addEvent();
		},

		addMeeting: insertMeeting
	};
};

var NewFoodMeeting = function(foodMeetingsContainer, createMeetingRoomId, communicationService, newMeetingPlaceholder, newMeeting){
	this.foodMeetingsContainer = foodMeetingsContainer;
	this.createMeetingRoomId = createMeetingRoomId;
	this.communicationService = communicationService;
	this.newMeetingPlaceholder = newMeetingPlaceholder;
	this.newMeeting = newMeeting;

	var dateField = $('#new-date-field-id');
	var timeField = $('#new-time-field-id');
	var addMeetingForm = $("#add-meeting-form-id");
	var addMeetingImage = $("#new-image-card-id");
	var cancelMeetingBtn = $("#cancelCreateMeeting");

	var defaultImage = "http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg";

	self = this;

	var addFieldEvent = function(){
		dateField.pickadate({
			selectMonths: true,
			selectYears: 15
		});

		timeField.pickatime({
			autoclose: false,
			twelvehour: false,
			autoclose: true,
			vibrate: true
		});
	};

	var addNewMeetingValidate = function() {
		addMeetingForm.validate({
			errorPlacement: function(error, element) {
				var placement = $(element).data('error');
				if (placement) {
					$(placement).append(error)
				} else {
					$(error).addClass("red-text");
					$(element).addClass("invalid ");
					error.insertAfter(element);
				}
			},

			errorElement: "div",
			rules : {
				meeting_name: "required",
				time: "required",
				date: {
					required: true,
					date: true
				}
			},

			messages: {
				meeting_name: "Please enter your meeting name",
				date: "Please enter a date",
				time: "Please enter a time",
			}
		});
	};

	var addClickEvents = function() {
		addMeetingForm.submit(function (event) {
			event.preventDefault();

			if(addMeetingForm.valid())
			{
				var $form = $( this ),
				meeting_name = $form.find( "input[name='meeting_name']" ).val(),
				date = $form.find( "input[name='date']" ).val(),
				time = $form.find( "input[name='time']" ).val(),
				url = $form.attr( "action" );

				var imageLink = $("#new-image-card-id").attr("src");

				self.communicationService.sendMessage(
				{
					user:1, 
					room: self.createMeetingRoomId, 
					command: "CreateFoodMeeting", 
					events:[
						{
							event:{
								CreateFoodMeetingEvent: {
									id:0,
									name: meeting_name,
									eventDate: moment(date+" "+time,"DD MMMM, YYYY hh:mm").valueOf(),
									status: "",
									imageLink: imageLink,
									width:0
								}
							}
						}
					]
				});
			}
		});

		cancelMeetingBtn.click(function (event) {
			resetNewMeetingForm();
		});

		addMeetingImage.click(function () {
			$('#search-image-modal-id').openModal({
				complete : onModalHide
			});
		
			$('#search-image-modal-id').load('searchImage', function(data) {
				var modal = new ModalSearchImage($("#image-card-id"), $("#image-link-id"),
					$('.image-link'), $('.image-links'), $("#image-card-id"));
				modal.init();
			});
		});
		
		$("#new-meeting-hello-meessage").click(function(){
			self.foodMeetingsContainer.isotope('remove', self.newMeetingPlaceholder);
			self.foodMeetingsContainer.isotope('insert', self.newMeeting);  
		});
		
	};

	var resetNewMeetingForm = function () {
		$("#add-meeting-form-id").trigger("reset");
		$("#new-image-card-id").attr("src", defaultImage);

		self.foodMeetingsContainer.isotope('remove', self.newMeeting);
		self.foodMeetingsContainer.isotope('insert', self.newMeetingPlaceholder); 
	};

	var onModalHide = function() {
		var imageLink = $("#image-link-id").val();
		$("#new-image-card-id").attr("src", imageLink);
		foodMeetingsContainer.isotope('layout');
	};

	return {
		init: function() {
			addFieldEvent()
			addNewMeetingValidate();
			addClickEvents();
		},

		reset: resetNewMeetingForm,
	};
};