$(function() {
	var settingMeeting = new SettingMeeting();
	settingMeeting.init();
});

var SettingMeeting = function() {
	
	var dateField = $('#date-field-id');
	var timeField = $('#time-field-id');
	var select = $('select');
	var meetingStateSlider = new MeetingStateSllider();
		
	var addFieldEvent = function() {
		dateField.pickadate({
			selectMonths: true,
			selectYears: 15,
			closeOnSelect: true,
			onSet: function(arg) {
				if ('select' in arg) {
					this.close();
				}
			}
		});

		timeField.pickatime({
			autoclose : false,
			twelvehour : false,
			autoclose : true,
			vibrate : true
		});

		select.material_select();
		
		meetingStateSlider.init();
	};
	

	var setValues = function() {
		var time = moment(dateField.val()).format("HH:mm");
		timeField.val(time);
		var value = moment(dateField.val()).format("D MMMM, YYYY");
		dateField.val(value);
	};				

	return {
		init : function() {
			addFieldEvent();
			setValues();
		},
	};

};

var MeetingStateSllider = function() {
	var slider = document.getElementById('noUiSlider');
	var eventDate= moment($("#edit-meeting").data("eventDate"), "YYYY-MM-DD HH:mm:ss");
	var createdDate = moment($("#edit-meeting").data("createdDate"), "YYYY-MM-DD HH:mm:ss");
	
	var step = eventDate.diff(createdDate,"hours") < 6 ? eventDate.diff(createdDate)*75/(100*6) : 60*60*1000;
	var firstHandlerPosition = eventDate.valueOf() - 5*step;
	var secondHandlerPosition = eventDate.valueOf() - 3*step;
	var thirdHandlerPosition = eventDate.valueOf() - step;
	
	var calendarSettings = {
		sameDay: '[Today] HH:mm',
		nextDay: '[Tomorrow] HH:mm',
		nextWeek: 'dddd HH:mm',
		lastDay: '[Yesterday] HH:mm',
		lastWeek: '[Last] dddd HH:mm',
		sameElse: 'MM/DD/YYYY  HH:mm'
	}
	
	var sliderSections= [
		{color: "#b3e5fc ", text: "Voting"},
		{color: "#29b6f6", text: "Orders"},
		{color: "#0277bd", text: "Payment"}
	]
	
	var init = function() {
		noUiSlider.create(slider, {
			start: [  firstHandlerPosition, secondHandlerPosition , thirdHandlerPosition],
			connect: [true, true, true, false],
			tooltips: [	{ to: formatToDate }, { to: formatToDate }, { to: formatToDate } ],
			range: {
				'min': [  createdDate.valueOf() ],
				'25%': [ get25Range(createdDate, eventDate), 15*60*1000 ],
				'max': [ eventDate.valueOf() ]
			},
			pips: {
				mode: 'range',
				density: 3,
				format: { to: formatToDate }
			},
		});
		
		slider.noUiSlider.on('update', function( values, handle ) {
			var now = moment().valueOf();
			var orderVotingHandle = 0;
			var orderPaymentHandle = 1;
			var paymentEmptyHandle = 2;

			var newStatus = $("#status").text();

			if(now <= values[orderVotingHandle]) {
				newStatus = "Voting";
			} else if(now <= values[orderPaymentHandle]) {
				newStatus = "Order";	
			} else if(now <= values[paymentEmptyHandle]) {
				newStatus = "Payment";	
			} else
			{
				newStatus = "Waiting to Eat!";
			}

			$("#status").text(newStatus);	
		});		
		
		$(".noUi-connect").each(function(index){
			$(this).css('background', sliderSections[index].color);

			var tooltip = $("<div class='noUi-tooltip'>" +			
					sliderSections[index].text +
				"</div>"
			)
			.css('background', "#c8d8d6")
			.css('bottom', '-900%')
			.css('padding', '1px');

			$(this).append(tooltip);
			$(this).css('color', '#9e9e9e');
		});
	}		
	
	function formatToDate(value) {
		return moment(value).calendar(null, calendarSettings);
	};
	
	function get25Range(createdDate, eventDate) {	
		var millisecondsOfDay = 60*60*1000;			

		var hoursBetween = eventDate.diff(createdDate, 'hours');

		if(hoursBetween <= 6) {
			var defaultValue = createdDate.valueOf() + (eventDate.valueOf() - createdDate.valueOf())*25/100
			return defaultValue - getMillisToRoundToQuarter(moment(defaultValue));
		}

		return eventDate.valueOf() - 6*millisecondsOfDay - getMillisToRoundToQuarter(eventDate);
	}

	function getMillisToRoundToQuarter(date) {
		var minutes = date.minute();
		var minutesToRoundToQuarter = 0;
		console.log(minutes);
		if(minutes < 15) {
			minutesToRoundToQuarter = minutes
		} else if (minutes < 30) {
			minutesToRoundToQuarter = minutes - 15;
		} else if (minutes < 45){
			minutesToRoundToQuarter = minutes - 30;
		} else {
			minutesToRoundToQuarter = minutes -45 ;
		}

		return minutesToRoundToQuarter*60*1000
	}
	
	return {
		init: function() {
			init();
		}
	}
}