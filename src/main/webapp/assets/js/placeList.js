$(function() {
	var placeList = new PlaceList();
	placeList.init();
});

var PlaceList = function() {
	this.modalTrigger = $("#btn-action-main");
	this.btnActionAdd = $("#btn-action-add");
	this.btnActionCancel = $("#btn-action-cancel");
	this.nodeListPlace = $("#list-place-body");
	var form = $("#place-form");
	var tags = [];


	self = this;
	
	var eventHandlerBtnActionAdd = function(event) {
		$(form[0].reset());
		$('#modal1').openModal();
	}
	var updateDetailPlace = function(data) {
		$("#d-place-name").val(data.name);
		$("#d-place-description").val(data.description);
		$("#d-place-phone").val(data.phone);
		$("#d-place-address").val(data.direction);
		$("#d-place-image-link").attr('src', data.imageLink);
	}

	var eventClickRowItem = function(event) {
		var id = $(this).attr('id');
		console.log("click");
		$.ajax({
			url: '/action/place',
			type: 'get',
			dataType: 'json',
			data: {'id': id},
			success: function(data) {
				console.log(data);
				updateDetailPlace(data);
			},
			error: function() {
				/* Act on the event */
			}
		});
		
		
	}

	
	var addEventDropdownDinamically = function(id="") {
		$('#'+id).dropdown({
	      inDuration: 300,
	      outDuration: 225,
	      constrain_width: false, // Does not change width of dropdown to that of the activator
	      hover: true, // Activate on hover
	      gutter: 0, // Spacing from edge
	      belowOrigin: false, // Displays dropdown below the button
	      alignment: 'left' // Displays dropdown with edge aligned to the left of button
    	});
	}
	var addEventClick = function() {
		self.modalTrigger.click(eventHandlerBtnActionAdd); 
		$(document).on('click', '.row-item', eventClickRowItem);
		
		$(document).on('click', '.row-item', eventClickRowItem);

		self.btnActionAdd.click(function(event) {
			var formData = form.serialize();
			var commandUrl = form.attr("action");
			var createData = new FormData(form[0]);
			createData.append('tags', tags.join(":"));
			$.ajax({
				url: "/action/createPlace",
				type: "post",
				data: createData,
				processData: false,
				contentType: false,
				cache: false,
				success: function(place) {
					console.log(place)	;
	    			$("#modal1").closeModal();
	    			var templateRow = '<tr>'+
			          	  '<td><img src="/assets/img/food.svg" alt="" class="circle responsive-img valign table-image"></td>'+
			              '<td>'+place.name+'</td>'+
			              '<td>'+place.description+'</td>'+
			              '<td>'+place.phone+'</td>'+
			              '<td>'+
			              	'<a id="btn-dropdown-'+place.id+'" class="dropdown-button secondary-content" data-beloworigin="true" href="#"" data-activates="dropdown-'+place.id+'"><i class="material-icons">more_vert</i></a>'+
			              	  '<ul id="dropdown-'+place.id+'" class="dropdown-content">'+
							    '<li><a href="/action/placeProfile?id='+place.id+'">List Items</a></li>'+
							  '</ul>'+
			              '</td>'+
			          '</tr>';
			        self.nodeListPlace.prepend(templateRow);  
			        addEventDropdownDinamically('btn-dropdown-'+place.id);
			        updateDetailPlace(place);
	    		},
				error: function (data) {
					
				}

			});
			event.preventDefault();
			return false;
		});


	};

	var addEventTag = function() {
		$('.chips-placeholder').material_chip({
		placeholder: 'Enter a tag',
		secondaryPlaceholder: '+Tag'
	    });
	    
	    $('.chips').on('chip.add', function(e, chip) {
		tags.push(chip.tag);
	    });
	}

	return {
		init: function(){
			addEventClick();
			addEventTag();
		},
	};
};