
$(document).ready(function () {
    $("#place-form").validate({
        errorPlacement: function (error, element) {
             var placement = $(element).data('error');
             if (placement) {
                  $(placement).append(error);
             } else {
                 $(error).addClass("red-text");
                 $(element).addClass("invalid ");
                 error.insertAfter(element);
             }
        },
        errorElement: "div",
        rules: {
            name: "required"
        },
        messages: {
            name: "Place name is required"
        }
    });
});