$(document).ready(function() {

    $('.collapsible').collapsible({
        accordion: false
    });

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

    $(".meeting-img").click(function() {
        var page = "suggestions";
        var meetingStatus = $(this).data("meetingStatus");

        switch (meetingStatus) {
            case 'Voting':
                page = "suggestions";
                break;
            case 'Order':
                page = "order";
                break;
            case 'Finish':
                page = "finish";
                break;
        }
        window.location.href = '/action/' + page + '?id_food_meeting=' +
                $(this).data("meeting-id");
    });

    var foodMeetings = $('.food-meetings');

    foodMeetings.imagesLoaded()
            .done(function() {
                foodMeetings.masonry({
                    itemSelector: '.grid-item',
                    columnWidth: 50
                });
            });

    $(".quick-view-date").each(function() {
        $(this).text(moment($(this).closest(".meeting").data("date"), "YYYY-MM-DD hh:mm:ss.s").calendar());
    });

    $(".detailed-view-date").each(function() {
        $(this).text("Eat time : " + moment($(this).closest(".meeting").data("date"), "YYYY-MM-DD hh:mm:ss.s").format('MMMM Do YYYY, h:mm a'));
    });

    $("#add-meeting").validate({
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
        rules: {
            meeting_name: "required",
            time: "required",
            date: {
                required: true,
                date: true
            }
        },
        messages: {
            meeting_name: "Please enter your meeting name",
            date: "Please enter a date",
            time: "Please enter a time",
        }
    });

    $("#add-meeting").submit(function(event) {

        event.preventDefault();

        if ($("#add-meeting").valid())
        {

            var $form = $(this),
                    meeting_name = $form.find("input[name='meeting_name']").val(),
                    date = $form.find("input[name='date']").val(),
                    time = $form.find("input[name='time']").val(),
                    url = $form.attr("action");

            var imageLink = $("#ImageLinkId").val();

            // Send the data using post
            var posting = $.post(url, {meeting_name: meeting_name, image_link: imageLink, eventdate: moment(date + " " + time, "DD MMMM, YYYY hh:mm").format("DD/MM/YYYY HH:mm:ss")});

            // Put the results in a div
            posting.done(function(data) {
                location.reload();
            });
        }
    });

    $("#ImageLinkId").change(function(event) {

        var imageLink = $("#ImageLinkId").val();

        $("#image-card").attr("src", imageLink);
    });

    $("#add-new-meeting").click(function(event) {

        $("#new-meeting-card").show();
        foodMeetings.masonry({
            itemSelector: '.grid-item',
            columnWidth: 50
        });
    });

    $("#cancel_create_meeting").click(function(event) {
        location.reload();
    });

});
