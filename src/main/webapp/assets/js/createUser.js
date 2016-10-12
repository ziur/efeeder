$(document).ready(function () {
	$.uploadPreview({
		input_field: "#image-upload",
		preview_box: "#image-preview",
		label_field: "#image-label"
	});

	var createUser = new  CreateUser($("#create-user-form"), $("#cancel-button"), $('#create-button'));       
        
	createUser.init();
});

var CreateUser = function(form,  cancelButton, createButton) {
	this.form = form;	
	this.cancelButton = cancelButton;
        this.createButton = createButton;
	var selft = this;
	
	var messageUser = $("#message-user");

	var addEventClick= function () {
		selft.cancelButton.click(function () {
			location.href = "/action/login";
		});
                
                selft.createButton.click(function (event) {
			createUser2(event);
		});
                
	};
        
        var createUser2 = function(event) {
		event.preventDefault();

		if(selft.form.valid()) {
                        var formData = selft.form.serialize();
                    
			var url1 = selft.form.attr( "action" );
		
                         var vcfData = new FormData(selft.form[0]); 
                          $.ajax({
                                url : url1,
                                type : "post",
                                data : vcfData,
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



