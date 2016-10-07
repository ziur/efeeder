$(function() {
	var defaultImage = "http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg";
	var createMeetingRoomId = "createMeetingRoomId";

	var foodMeetings = $('.food-meetings');
	foodMeetings.isotope({
		itemSelector: '.grid-item',
		layoutMode: 'fitRows',
		sortAscending: true,
		getSortData: {
			date: function(itemElem) {
				return $(itemElem).data("date");
			}
		},
		sortBy: 'date',
	});

	var foodMeetingTmpl;
	$.get('/assets/templates/foodMeeting.html', function(template) {
		foodMeetingTmpl = template;
		$.get('/action/getAllMeetings', function(meetings) {
			_.each(meetings, function(meeting) {
				addMeeting(meeting);
			})
		});
	});

	$('.datepicker').pickadate({
		selectMonths: true,
		selectYears: 15
	});

	$('#time').pickatime({
		autoclose: false,
		twelvehour: false,
		autoclose: true,
		vibrate: true
	});

	$("#add-meeting-form-id").validate({
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
		rules: {
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

	$("#add-meeting-form-id").submit(function(event) {

		event.preventDefault();

		if ($("#add-meeting-form-id").valid())
		{
			var $form = $(this),
					meeting_name = $form.find("input[name='meeting_name']").val(),
					date = $form.find("input[name='date']").val(),
					time = $form.find("input[name='time']").val(),
					url = $form.attr("action");

			var imageLink = $("#new-image-card-id").attr("src");

			communicationService.sendMessage(
					{
						user: 1,
						room: createMeetingRoomId,
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
										width: 0
									}
								}
							}
						]
					});
		}
	});

	$("#AddNewMeeting").click(function(event) {
		$("#new-meeting-card-id").show();
		foodMeetings.isotope('layout');
	});

	$("#cancelCreateMeeting").click(function(event) {
		resetNewMeetingForm();
		foodMeetings.isotope('layout');
	});

	$("#new-image-card-id").click(function() {
		$('#search-image-modal-id').openModal();

		$('#search-image-modal-id').load('searchImage', function(data) {
			var modal = new ModalSearchImage($("#image-card-id"), $("#image-link-id"), $('.image-link'), $('.image-links'), $("#image-card-id"));
			modal.init();
		});
	});

	var communicationService = new CommunicationService();
	communicationService.onMessage(function(event) {
		$.each(event.events, function(index, item) {
			var eventType = Object.getOwnPropertyNames(item.event)[0];
			var eventMessage = item.event[eventType];
			switch (eventType) {
				case "org.jala.efeeder.servlets.websocket.avro.WelcomeEvent":
					console.log('WebSockets connected by FoodMeetings.');
					break;
				case "org.jala.efeeder.servlets.websocket.avro.CreateFoodMeetingEvent":
					addMeeting(eventMessage);
					resetNewMeetingForm();

					var $toastContent = $('<span><a href="#' + eventMessage.id + '" class="white-text">' + eventMessage.name + ' meeting was created successfully!</a></span>');
					Materialize.toast($toastContent, 2000)
					break;
			}
		});
	});

	communicationService.connect('ws://' + location.host + '/ws', createMeetingRoomId);

	function addMeeting(meeting) {
		console.log(foodMeetingTmpl);
		var $foodMeetingTmpl = $.templates(foodMeetingTmpl);
		var data = {
			"id": meeting.id,
			"name": meeting.name,
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
		$newFoodMeeting.imagesLoaded()
				.always(function() {
					foodMeetings.isotope('insert', $newFoodMeeting);
					$("#preloader").hide();
				});
	}

	function getImagRedirectTo(id, status) {
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

	function resetNewMeetingForm() {
		$("#add-meeting-form-id").trigger("reset");
		$("#new-image-card-id").attr("src", defaultImage);
		$("#new-meeting-card-id").hide();
	}
});
