var foodMeetings = $('.food-meetings');

foodMeetings.imagesLoaded()
    .done(function(){
        foodMeetings.masonry({
            itemSelector: '.grid-item',
            columnWidth: 50
        });
    });

$(".quick-view-date").each(function(){                           
    $(this).text(moment($(this).closest(".meeting").data("date"), "YYYY-MM-DD").calendar());
});

$(".detailed-view-date").each(function(){                           
    $(this).text("Eat time : " + moment($(this).closest(".meeting").data("date"), "YYYY-MM-DD").format('MMMM Do YYYY, h:mm:ss a'));
});