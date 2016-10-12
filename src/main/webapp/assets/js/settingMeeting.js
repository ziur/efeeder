$(function() {
	var settingMeeting = new SettingMeeting();
	settingMeeting.init();
});

var SettingMeeting = function() {
	
	var dateField = $('#date-field-id');
	var timeField = $('#time-field-id');
	var select = $('select');

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
