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
		var page = $(this).data("meetingStatus") === "Voting" ? "suggestions" : "suggestions";
		window.location.href = '/action/'+page+'?id_food_meeting=' +
		$(this).data("meetingId");
	});

	$('.food-meetings').imagesLoaded()
		.done(function(){
			reorganizeCards();
		});

	$(".quick-view-date").each(function(){
		$(this).text(moment($(this).closest(".grid-item").data("date"), "YYYY-MM-DD hh:mm:ss.s").calendar());
	});

	$(".detailed-view-date").each(function(){  
		$(this).text("Eat time : " + moment($(this).closest(".grid-item").data("date"), "YYYY-MM-DD hh:mm:ss.s").format('MMMM Do YYYY, h:mm a'));
	});

	$("#add-meeting-form-id").validate({
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

	$("#add-meeting-form-id").submit(function (event) {

		event.preventDefault();
		
		if($("#add-meeting-form-id").valid())
		{
		
			var $form = $( this ),
			meeting_name = $form.find( "input[name='meeting_name']" ).val(),
			date = $form.find( "input[name='date']" ).val(),
			time = $form.find( "input[name='time']" ).val(),
			url = $form.attr( "action" );

			var imageLink = $("#new-image-card-id").attr("src");

			// Send the data using post
			var posting = $.post( url, { meeting_name: meeting_name, image_link: imageLink,  eventdate:moment(date+" "+time,"DD MMMM, YYYY hh:mm").format("DD/MM/YYYY HH:mm:ss")} );

			// Put the results in a div
			posting.done(function( data ) {
				location.reload(); 
			});
		}
	});

	$("#AddNewMeeting").click(function (event) {
		$("#new-meeting-card-id").show();
		reorganizeCards();
	});

	$("#cancelCreateMeeting").click(function (event) {
		location.reload(); 
	});
	
	var onModalHide = function() {
		var imageLink = $("#image-link-id").val();
		$("#new-image-card-id").attr("src", imageLink);
		reorganizeCards();
	};

	$("#new-image-card-id").click(function () {
		$('#search-image-modal-id').openModal({
			complete : onModalHide
		});

		$('#search-image-modal-id').load('searchImage', function(data) {
			initSearchImages();
		});
	});
});

function reorganizeCards() {
	$('.food-meetings').masonry({
		itemSelector: '.grid-item',
		columnWidth: 50
	});
}
