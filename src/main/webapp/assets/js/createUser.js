$(document).ready(function () {
    $("#CreateUserForm").validate({

        errorPlacement: function(error, element) {
            var placement = $(element).data('error');
              if (placement) {
                $(placement).append(error)
              } else {
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
    $("#LoginCancel").click(function () {
        location.href = "/action/login";
    });
});