$(function() {
	var foodMeetingsContainer = $('.food-meetings');
	var foodMeetingsList = new FoodMeetingsList(foodMeetingsContainer, '/action/GetAllMeetingsByUser');
	foodMeetingsList.init();
});

var FoodMeetingsList = function(foodMeetingsContainer, action) {
	this.foodMeetingsContainer = foodMeetingsContainer;
	this.meetings = [];

	var self = this;
	var foodMeetingTmpl;

	$.get('/assets/templates/foodMeetingHistory.html', function(template) {
		foodMeetingTmpl = template;
		$.get(action, function(meetings) {
			_.each(meetings, function(meeting) {
				insertMeeting(meeting);
			})
		});
	});

	var insertMeeting = function(newMeeting) {
		var $foodMeetingTmpl = $.templates(foodMeetingTmpl);
		self.meetings.push(newMeeting);
		var statusStyle = getStatusStyle(newMeeting.status, newMeeting.id);

		var data = {
			"id" : newMeeting.id,
			"name" : newMeeting.name,
			"imageLink" : newMeeting.imageLink,
			"status" : newMeeting.status,
			"date" : newMeeting.eventDate,
			"quickViewDate" : moment(newMeeting.eventDate).calendar(),
			"backgroundColor" : statusStyle.backgroundColor,
			"icon" : statusStyle.icon,
			"link" : statusStyle.action,
			"goToPage" : statusStyle.page
		};

		var $newFoodMeeting = $($foodMeetingTmpl.render(data));
		$newFoodMeeting.imagesLoaded().always(function() {
			foodMeetingsContainer.isotope('insert', $newFoodMeeting);
		});

	};

	var getStatusStyle = function(status, id) {
		var statusStyle = {};
		switch (status) {
		case 'Voting':
			statusStyle = {
				backgroundColor : "blue",
				icon : "query_builder",
				page : "suggestions"
			};
			break;
		case 'Order':
			statusStyle = {
				backgroundColor : "blue",
				icon : "query_builder",
				page : "order"
			};
			break;
		case 'Payment':
			statusStyle = {
				backgroundColor : "red",
				icon : "payment",
				page : "payment"
			};
			break;
		case 'Buying':
			statusStyle = {
				backgroundColor : "red",
				icon : "payment",
				page : "details"
			};
			break;
		case 'Finish':
			statusStyle = {
				backgroundColor : "teal lighten-2",
				icon : "done",
				page : "details"
			};
			break;
		}
		statusStyle.action = '/action/' + statusStyle.page
				+ '?id_food_meeting=' + id;
		return statusStyle;
	};

	var addEvent = function() {
		self.foodMeetingsContainer.isotope();
	};

	return {
		init : function() {
			addEvent();
		},
	};
};