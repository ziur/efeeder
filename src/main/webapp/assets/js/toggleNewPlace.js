$(document).ready( function () {
   $(".add-new-place").click( function () {
       $(".place-toggle-container").hide();
        if ( $(".form-place-container").is(":visible") ) {
            $(".form-place-container").hide();
        } else {
            $(".form-place-container").show();
        }
        return false;
   });
   $(".submit-place-button").click( function () {
       $(".form-place-container").hide();
       $(".place-toggle-container").show();
   });
});
