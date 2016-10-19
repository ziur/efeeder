$(function() {
	var settingMeeting = new SettingMeeting();
	settingMeeting.init();
});

var SettingMeeting = function() {
	
	var dateField = $('#date-field-id');
	var timeField = $('#time-field-id');
	var select = $('select');
	var editMeetingForm = $("#edit-meeting");

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
			vibrate : true
		});

		select.material_select();
	};
	

	var setValues = function() {
		var time = moment(dateField.val()).format("HH:mm");
		timeField.val(time);
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
