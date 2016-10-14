$(document).ready(function () {
	$.uploadPreview({
		input_field: "#image-upload",
		preview_box: "#image-preview",
		label_field: "#image-label"
	});

	var createUser = new  User();

	createUser.init();
});

var User = function() {
	var form = $("#create-user-form");
	var cancelButton = $("#cancel-button");
	var createButton = $('#create-button');
	var updateButton = $('#update-button');
	var isNewUser = $("#new-user-hiden").val();
	var selft = this;

	var messageUser = $("#message-user");

	var addEventClick= function () {
		cancelButton.click(function () {
			location.href = "/action/login";
		});
		
		if(isNewUser) {
			createButton.click(function (event) {
				createUser(event, true);
			});
		}
		else{
			updateButton.click(function (event) {
				createUser(event, false);
			});
		}

	};

	var createUser = function(event, isNew) {
		event.preventDefault();

		if(form.valid()) {
			var formData = form.serialize();

			var commandUrl = form.attr( "action" );

			var createUserData = new FormData(form[0]);
			createUserData.append("isNEw", isNew);
			$.ajax({
				url : commandUrl,
				type : "post",
				data : createUserData,
				processData: false,
				contentType: false,
				cache : false,
				success : function(data) {
					location.href = "/action/login";
				},
				error: function(data){
					errorMessage(data.responseJSON.message);
				}
			});
		}
	};

	var errorMessage = function(message) {
		messageUser.removeClass('grey-text');
		messageUser.addClass("red-text");
		messageUser.text(message);
	};

	var addValidateRules = function() {
		form.validate({

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
				name: "required",
				last_name: "required",
				email : {
					required: true,
					email: true
				},
				username : {
					required: true,
					minlength : 2
				},
				password : {
					required: true,
					minlength : 5
				},
				confirm_password : {
					required: true,
					minlength : 5,
					equalTo : "#password"
				}
			},

			messages: {
				name: "Please enter your first name",
				last_name: "Please enter your last name",
				email: {
					required: "Please provide a Email"
				},
				username: {
					required: "Please provide a User Name",
					minlength: "Your username must consist of at least 2 characters"
				},
				password: {
					required: "Please provide a password",
					minlength: "Your password must be at least 5 characters long"
				},
				confirm_password: {
					required: "Please provide a password",
					minlength: "Your password must be at least 5 characters long",
					equalTo: "Please enter the same password as above"
				},
			}
		});
	};

	return {
		init: function(){
			addValidateRules();
			addEventClick();
		},
	};
};