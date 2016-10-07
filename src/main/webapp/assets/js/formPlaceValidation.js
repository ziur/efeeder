
$(document).ready(function () {
    $("#place-form").validate({
        errorPlacement: function (error, element) {
            debugger;
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