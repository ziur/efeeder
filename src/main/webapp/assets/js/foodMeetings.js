$(document).ready(function () {

    $('.datepicker').pickadate({
        selectMonths: true,
        selectYears: 15
    });

    $('#time').pickatime({
        autoclose: false,
        twelvehour: false,
        autoclose: true,
        vibrate: true
    });

    $(".meeting-img").click(function () {
        window.location.href = '/action/suggestions?id_food_meeting=' +
        $(this).data("meetingId");
    });

    var foodMeetings = $('.food-meetings');

    foodMeetings.imagesLoaded()
        .done(function(){
            foodMeetings.masonry({
                itemSelector: '.grid-item',
                columnWidth: 50
            });
        });

    $(".quick-view-date").each(function(){                           
        $(this).text(moment($(this).closest(".meeting").data("date"), "YYYY-MM-DD hh:mm:ss.s").calendar());
    });

    $(".detailed-view-date").each(function(){  
        $(this).text("Eat time : " + moment($(this).closest(".meeting").data("date"), "YYYY-MM-DD hh:mm:ss.s").format('MMMM Do YYYY, h:mm a'));
    });

    $("#addMeeting").validate({

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
            meeting_name: "required",
            date: "required",
            time: "required",
        },

        messages: {
            meeting_name: "Please enter your meeting name",
            date: "Please enter a date",
            time: "Please enter a time",
        }
    });
    
    $("#addMeeting").submit(function (event) {

        event.preventDefault();

        if($("#addMeeting").valid())
        {
            var $form = $( this ),
            meeting_name = $form.find( "input[name='meeting_name']" ).val(),
            date = $form.find( "input[name='date']" ).val(),
            time = $form.find( "input[name='time']" ).val(),
            url = $form.attr( "action" );

            // Send the data using post
            var posting = $.post( url, { meeting_name: meeting_name,  eventdate:moment(date+" "+time,"DD MMMM, YYYY hh:mm").format("DD/MM/YYYY HH:mm:ss")} );

            // Put the results in a div
            posting.done(function( data ) {
                location.reload(); 
           });
        }
    });

});
