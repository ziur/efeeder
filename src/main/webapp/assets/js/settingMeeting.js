$(function(){
	console.log("Hello from meeting!");
	console.log($("#edit-meeting").data("eventDate"));
	console.log($("#edit-meeting").data("createdDate"));
	
	var eventDay= moment($("#edit-meeting").data("eventDate"), "YYYY-MM-DD HH:mm:ss");
	console.log(eventDay);

	console.log(eventDay);	
	var createdDate = moment($("#edit-meeting").data("createdDate"), "YYYY-MM-DD HH:mm:ss");
	//var step = (eventDay.valueOf() - now.valueOf())/4;
	var step = 60*60*1000;
	var firstHandlerPosition = eventDay.valueOf() - 5*step;
	var secondHandlerPosition = eventDay.valueOf() - 3*step;
	var thirdHandlerPosition = eventDay.valueOf() - step;
	

	var handlesSlider = document.getElementById('noUiSlider');

noUiSlider.create(handlesSlider, {
	start: [  firstHandlerPosition, secondHandlerPosition , thirdHandlerPosition],
	connect: [true, true, true, false],
	tooltips: [
		{
			to: function(value) {
				return moment(value).calendar(null, calendarSettings);
			}
		},
		{
			to: function(value) {
				return moment(value).calendar(null, calendarSettings);
		
			}
		},
		{
			to: function(value) {
				return moment(value).calendar(null, calendarSettings);
			}
		}
	],
	range: {
		'min': [  createdDate.valueOf() ],
		'25%': [ get25Range(createdDate, eventDay), 15*60*1000 ],
		//'95%': [ get99Range(eventDay)],
		'max': [ eventDay.valueOf() ]
	},
	pips: {
		mode: 'range',
		density: 3,
		format: {
			to: function(value) {
				return moment(value).calendar(null, calendarSettings);
			}
		}
	}
});

var sliderSections= [
	{color: "#87bee6", text: "Voting"},
	{color: "#74d41f", text: ".... Orders"},
	{color: "#e07b5c", text: ".... Payment"}
]
$(".noUi-connect").each(function(index){
	$(this).css('background', sliderSections[index].color);
	$(this).text(sliderSections[index].text);
	$(this).css('color', "white");
});
var formatter = function(value) {
		return moment(value).calendar();
	};
		 
});

var get25Range = function(createdDate, eventDay) {	
	
	var millisecondsOfDay = 60*60*1000;			
	
	var hoursBetween = eventDay.diff(createdDate, 'hours');
	
	if(hoursBetween <= 6) {
		var defaultValue = createdDate.valueOf() + (eventDay.valueOf() - createdDate.valueOf())*25/100
		return defaultValue - getMillisToRoundToQuarter(moment(defaultValue));
	}
	
	//return now.valueOf() + (eventDay.valueOf()-now.valueOf())/2;
	return eventDay.valueOf() - 6*millisecondsOfDay - getMillisToRoundToQuarter(eventDay);
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


var calendarSettings = {
    sameDay: '[Today] HH:mm',
    nextDay: '[Tomorrow] HH:mm',
    nextWeek: 'dddd HH:mm',
    lastDay: '[Yesterday] HH:mm',
    lastWeek: '[Last] dddd HH:mm',
    sameElse: 'MM/DD/YYYY  HH:mm'
}