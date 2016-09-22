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