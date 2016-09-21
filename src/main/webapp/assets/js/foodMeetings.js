$('.food-meetings').masonry({
    itemSelector: '.grid-item',
    columnWidth: 200
});

$(".meeting-date").each(function(value){                           
    $(this).text(moment($(this).data("date"), "YYYY-MM-DD").calendar());
});