$(function () {

	var createMeetingRoomId = "createMeetingRoomId";
	var $newMeetingPlaceholder = $("#new-meeting-placeholder");
	var $newMeeting = $("#new-meeting");

	var foodMeetings = $('.food-meetings');

	var foodMeetingsList = new FoodMeetingsList(foodMeetings, $newMeetingPlaceholder);
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

	var newFoodMeeting = new NewFoodMeeting(foodMeetings, createMeetingRoomId, communicationService, $newMeetingPlaceholder, $newMeeting);

	newFoodMeeting.init();
});



var FoodMeetingsList = function(foodMeetings, newMeetingPlaceholder){
	this.newMeetingPlaceholder = newMeetingPlaceholder;
	this.foodMeetings = foodMeetings;

	self = this;

	var foodMeetingTmpl;

	$.get('/assets/templates/foodMeeting.html', function(template) {
		foodMeetingTmpl = template;        
		$.get('/action/getAllMeetings', function(meetings){
			_.each(meetings, function(meeting){
				insertMeeting(meeting);
			})
		});
	});

	var insertMeeting = function(meeting) {
		var $foodMeetingTmpl = $.templates(foodMeetingTmpl);

		var data = { 
			"id": meeting.id, 
			"name" : meeting.name, 
			"imageLink": meeting.imageLink, 
			"status": meeting.status, 
			"date": meeting.eventDate, 
			"quickViewDate": moment(meeting.eventDate).calendar(),
			"detailedViewDate": moment(meeting.eventDate).format('MMMM Do YYYY, h:mm a'),
			"width": meeting.width,
			"statusColor": meeting.status === 'Finish' ? 'new badge blue' : 'new badge',
			"imgRedirectTo": getImagRedirectTo(meeting.id, meeting.status)
		};

		var $newFoodMeeting = $($foodMeetingTmpl.render(data));
		$newFoodMeeting.imagesLoaded().always(function(){
			foodMeetings.isotope('insert', $newFoodMeeting);
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
		self.foodMeetings.isotope({
			itemSelector: '.grid-item',
			layoutMode: 'fitRows',
			sortAscending: true,
			getSortData: {
				date: function(itemElem) {
					return $(itemElem).data("date");
				}
			},
			sortBy : 'date',
		});

		self.foodMeetings.isotope('insert', self.newMeetingPlaceholder);
	};

	return {
		init: function() {
			addEvent();
		},

		addMeeting: insertMeeting
	};
};

var NewFoodMeeting = function(foodMeetings, createMeetingRoomId, communicationService, newMeetingPlaceholder, newMeeting){
	this.foodMeetings = foodMeetings;
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
			self.foodMeetings.isotope('remove', self.newMeetingPlaceholder);
			self.foodMeetings.isotope('insert', self.newMeeting);  
		});
		
	};

	var resetNewMeetingForm = function () {
		$("#add-meeting-form-id").trigger("reset");
		$("#new-image-card-id").attr("src", defaultImage);

		self.foodMeetings.isotope('remove', self.newMeeting);
		self.foodMeetings.isotope('insert', self.newMeetingPlaceholder); 
	};

	var onModalHide = function() {
		var imageLink = $("#image-link-id").val();
		$("#new-image-card-id").attr("src", imageLink);
		foodMeetings.isotope('layout');
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