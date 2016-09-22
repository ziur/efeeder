$(document).ready(function () {

    $("#addMeeting").submit(function (event) {

        event.preventDefault();

        var $form = $( this ),
        meeting_name = $form.find( "input[name='meeting_name']" ).val(),
        date = $form.find( "input[name='date']" ).val(),
        time = $form.find( "input[name='time']" ).val(),
        url = $form.attr( "action" );

        // {date=[1 September, 2016], meeting_name=[ffff], time=[14:10]}

        // Send the data using post
        var posting = $.post( url, { meeting_name: meeting_name,  eventdate:moment(date+" "+time,"DD MMMM, YYYY hh:mm").format("DD/MM/YYYY HH:mm:ss")} );

        // Put the results in a div
        posting.done(function( data ) {
            location.reload(); 
        });
    });

    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });

    $('#timepicker').pickatime({
        autoclose: false,
        twelvehour: false
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
});

        
        
        
        
      

