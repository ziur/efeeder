function initSearchImages() {
	$("#image-link-id").change(function(event) {
		var imageLink = $("#image-link-id").val();
		$("#image-card-id").attr("src", imageLink);
	});

	$(".image-link").click(function() {

		$("#image-card-id").attr("src", $(this).data("imageLink"));
		$("#image-link-id").val($(this).data("imageLink"));

	});

	var imagesLinks = $('.image-links');

	imagesLinks.imagesLoaded().done(function() {
		imagesLinks.masonry({
			itemSelector : '.grid-item',
			columnWidth : 50
		});
	});
}