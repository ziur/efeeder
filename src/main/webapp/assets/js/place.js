$(document).ready( function () {
    var tags = [];
    $("#search").keyup(function (event) {
	var term = $(this).val();
	$.post("/action/searchplace",
	{
	    term: term.toLowerCase(),
	    page: 1
	},
       function (data, status) {
	    var tmpl = $.templates("#placeTmpl");
	    $('#places').empty();
	    $.each(data, function (i, place) {
	    var placeHTML = tmpl.render(place);
		$(placeHTML).appendTo('#places');
	    });
	});
    });

    $("#place-form-sumit-button").click( function (event) {
	var formData = {
	    'name': $('input[id = id-place]').val(),
	    'description': $('input[id = id-desc]').val(),
	    'phone': $('input[id = id-telf]').val(),
	    'address': $('input[id = id-address]').val(),
	    'image_link': $('input[id = id-img]').val(),
	    'tags': tags.join(":")
	};
	$.ajax({
	    cache: false,
	    type: 'POST',
	    url: "/action/createplace",
	    data: formData
	}).done( function (place) {
	    $("#custom-card-level").css("display", "none", "transform", "translateY(0px)");
	    $("#collid").first().remove();
	    var newPlace = ''+
			'<ul id="collid" class="collection">'+
			'<li id="'+place.id+'" class="collection-item avatar">'+
			    '<img src="/assets/img/food.svg" alt="" class="circle">'+
			    '<span class="title">'+place.name+'</span>'+
			    '<p class="description">'+place.description+'</p>'+
			    '<p class="description"> <span class="phone">Tel.:</span>'+place.phone+'</p>'+
			'</li>'+
			'</ul>';
	    $("#places").prepend(newPlace);
	});
	$("form").trigger("reset");
    });
    
    $(document).on('click', 'li', function () {
	ef_votingView.addSuggestion(g_feastId, parseInt($(this).attr("id")));
    });
    
    $('.chips-placeholder').material_chip({
	placeholder: 'Enter a tag',
	secondaryPlaceholder: '+Tag'
    });
    
    $('.chips').on('chip.add', function(e, chip) {
	tags.push(chip.tag);
    });
});
