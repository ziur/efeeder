$(function() {
	var settingMeeting = new SettingMeeting();
	settingMeeting.init();
});

var SettingMeeting = function() {
	
	var dateField = $('#date-field-id');
	var timeField = $('#time-field-id');
	var select = $('select');
	var editMeetingForm = $("#edit-meeting");
	
	var meetingStateSlider = new MeetingStateSllider();
		
	var addFieldEvent = function() {
		dateField.pickadate({
			selectMonths: true,
			selectYears: 15,
			closeOnSelect: true,
			formatSubmit: 'd mmmm,yyyy',
			clear:'',
			onSet: function(arg) {
				if ('select' in arg) {
					this.close();
				}
			}
		});

		timeField.pickatime({
			twelvehour : false,
			autoclose : true,
			vibrate : true,
			formatSubmit:'"HH:mm'
		});

		select.material_select();		
		meetingStateSlider.init();
	};
	

	var setValues = function() {
		dateField.pickadate('picker').set('select', dateField.val(), { format: 'yyyy-mm-dd' });
	};

	var settingMeetingValidate = function() {
		$.validator.setDefaults({
			errorClass: 'invalid',
			validClass: "valid",
			errorPlacement: function(error, element) {
				$(element)
					.closest("form")
					.find("label[for='" + element.attr("id") + "']")
					.attr('data-error', error.text());
			}
		});

		editMeetingForm.validate({
			rules: {
				meeting_name: "required",
				image_link: "required"
			}
		});
	};
	return {
		init : function() {
			addFieldEvent();
			setValues();
			settingMeetingValidate();
		}
	};

};

var MeetingStateSllider = function() {
	var slider = document.getElementById('noUiSlider');
	var eventDate= moment($("#edit-meeting").data("eventDate"), "YYYY-MM-DD HH:mm:ss");
	var createdDate = moment($("#edit-meeting").data("createdDate"), "YYYY-MM-DD HH:mm:ss");
	
	var votingDate = moment($("#edit-meeting").data("votingDate"), "YYYY-MM-DD HH:mm:ss");
	var orderDate = moment($("#edit-meeting").data("orderDate"), "YYYY-MM-DD HH:mm:ss");
	var paymentDate = moment($("#edit-meeting").data("paymentDate"), "YYYY-MM-DD HH:mm:ss");
	
	var firstHandlerPosition = votingDate.valueOf();
	var secondHandlerPosition = orderDate.valueOf();
	var thirdHandlerPosition = paymentDate.valueOf();
	
	var fifteenMinutesStep =  15*60*1000;
	var maxMediumDevicesWidth = 992;
	var isSmallScreen = $(window).width() <= maxMediumDevicesWidth;
	var calendarSettings = isSmallScreen ? 
	{
		sameDay: '[Tdy] HH:mm',
		nextDay: '[Tmr] HH:mm',
		nextWeek: 'ddd HH:mm',
		lastDay: '[YTD] HH:mm',
		lastWeek: '[Last] ddd HH:mm',
		sameElse: 'MM/DD  HH:mm'
	} :
	{
		sameDay: '[Today] HH:mm',
		nextDay: '[Tommorrow] HH:mm',
		nextWeek: 'dddd HH:mm',
		lastDay: '[Yesterday] HH:mm',
		lastWeek: '[Last] dddd HH:mm',
		sameElse: 'MM/DD/YYYY  HH:mm'
	}
	
	var sliderSections= [
		{color: "#b3e5fc ", text: "Voting"},
		{color: "#29b6f6", text: "Order"},
		{color: "#0277bd", text: "Payment"},
		{text: "Buying"},
		{text: "Finish"}
	]
	
	var init = function() {
		noUiSlider.create(slider, {
			start: [  firstHandlerPosition, secondHandlerPosition , thirdHandlerPosition],
			connect: [true, true, true, false],
			tooltips: [	{ to: formatToDate }, { to: formatToDate }, { to: formatToDate } ],
			range: {
				'min': [  createdDate.valueOf() ],
				'25%': [ get25Range(createdDate, eventDate), fifteenMinutesStep ],
				'max': [ eventDate.valueOf() ]
			},
			pips: {
				mode: 'range',
				density: 3,
				format: { to: formatToDate }
			},
		});
		
		slider.noUiSlider.on('update', function(values) {
			var orderVotingHandle = 0;
			var orderPaymentHandle = 1;
			var paymentEmptyHandle = 2;
			
			$("#voting-date").val(Math.round(values[orderVotingHandle]));
			$("#order-date").val(Math.round(values[orderPaymentHandle]));
			$("#payment-date").val(Math.round(values[paymentEmptyHandle]));						
		});		
		
		addConnectorTooltips();		
		modifyStyling();					
	}		
	
	function addConnectorTooltips() {
		$(".noUi-connect").each(function(index){
			$(this).css('background', sliderSections[index].color);

			var connectorTooltip = $("<div class='noUi-tooltip connector-tooltip'>" + sliderSections[index].text + "</div>")
				.css('background', "#c8d8d6")
				.css('bottom', '-800%')
				.css('padding', '1px')
				.css("font-size", "small");
		
			$(this).append(connectorTooltip );
		});
	}
	
	function modifyStyling() {
		$(".noUi-value").css("white-space", "nowrap")
		
		if(isSmallScreen) {
			$(".noUi-value").css("font-size", "small");
			$(".noUi-tooltip").css("font-size", "small");
			$(".noUi-tooltip.connector-tooltip").css("font-size", "x-small");
		}
	}
	
	function formatToDate(value) {
		return moment(value).calendar(null, calendarSettings);
	}
	
	function get25Range(createdDate, eventDate) {
		var millisecondsOfAnHour = 60*60*1000;		
		var result;

		var hoursBetween = eventDate.diff(createdDate, 'hours');

		if(hoursBetween <= 6) {
			result = createdDate.valueOf() + (eventDate.valueOf() - createdDate.valueOf())* 25/100
		} else {
			result = eventDate.valueOf() - 6 * millisecondsOfAnHour;
		}

		return result - getMillisToRoundToQuarter(result);
	}

	function getMillisToRoundToQuarter(date) {
		var minutes = moment(date).minute();
		var minutesToRoundToQuarter = 0;
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
