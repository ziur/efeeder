$(document).ready(function () {
	var createUser = new  CreateUser($("#create-user-form"), $("#cancel-button"));

	createUser.init();
});

var CreateUser = function(form,  cancelButton) {
	this.form = form;
	this.cancelButton = cancelButton;
	var selft = this;

	var addEventClick= function () {
		selft.cancelButton.click(function () {
			location.href = "/action/login";
		})
		
		selft.form.submit(function (event) {
			createUser(event);
		})
	};
	
	var createUser = function(event) {
		event.preventDefault();

		if(selft.form.valid()) {

			var secretString = $('#hidden-field').val();

			var name = selft.form.find( "input[name='name']" ).val();
			var lastName = selft.form.find( "input[name='last_name']" ).val();
			var email = selft.form.find( "input[name='email']" ).val();
			var username = selft.form.find( "input[name='username']" ).val();
			var password = selft.form.find( "input[name='password']" ).val();

			var encrypted = hex_md5(password+secretString);

			var url = selft.form.attr( "action" );

			// Send the data using post
			var posting = $.post( url, { name: name, last_name: lastName, email: email, username: username, password: encrypted} );

			// Put the results in a div
			posting.done(function( data ) {
				location.href = "/action/login"; 
			});
		}
	};

	var addValidateRules = function() {
		selft.form.validate({

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



