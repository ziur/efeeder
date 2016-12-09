var PlaceItem = function(idPlace) {

	this.idPlace = idPlace;
	this.btnActionShow = $("#btn-action-main");
	this.nodeListPlaceItem = $("#table-place-item");
	var form = $("#create-place-item-form");
	var self = this;
	
	this.btnActionAdd = $("#btn-action-add");
	this.btnActionCancel = $("#btn-action-cancel");
	this.nodeContainerFormCreate = $("#container-form-create");
	self = this;

	
	var eventHandlerBtnActionAdd = function(event) {
		$(form[0].reset());
		$('#modal1').openModal();
	}
	var eventClickRowItem = function(event) {
		var id = $(this).attr('id');
	
		$.ajax({
			url: '/action/placeItem',
			type: 'get',
			dataType: 'json',
			data: {'id': id},
			success: function(data) {
				
				updateDetailPlaceItem(data);
			},
			error: function() {
				/* Act on the event */
			}
		});
		
		
	}

	var updateDetailPlaceItem = function(data) {
		$("#d-place-item-name").val(data.name);
		$("#d-place-item-description").val(data.description);
		$("#d-place-item-price").val(data.price);
		$("#d-place-item-imageLink").attr('src', data.imageLink);
	}

	var initializeEventClick = function() {
		$(document).on('click', '.row-item', eventClickRowItem);

		self.btnActionShow.click(eventHandlerBtnActionAdd);
		self.btnActionAdd.click(function(event) {
			var formData = form.serialize();
			var commandUrl = form.attr("action");
			var createData = new FormData(form[0]);
			createData.append("id-place", self.idPlace);
			$.ajax({
				url: commandUrl,
				type: "post",
				data: createData,
				processData: false,
				contentType: false,
				cache: false,
				success: function(placeItem) {
					var newItem = ''+
					    ' <tr id="'+ placeItem.id +'" class="row-item">'+
			          	  '<td><img src="' + placeItem.imageLink + '" alt="" class="circle responsive-img valign table-image"></td>' +
			              '<td>' + placeItem.name + '</td>'  +
			              '<td>' + placeItem.description + '</td>'+
			              '<td>' + placeItem.price +'</td>'+
			          '</tr>';
	    		
	    		$("#modal1").closeModal();
	    		$(self.nodeListPlaceItem).prepend(newItem);	
	    		updateDetailPlaceItem(placeItem);

				},
				error: function (data) {
					
				}

			});
			event.preventDefault();
			return false;
		});
	};	

	return {
		init: function(){
			initializeEventClick();
		}

	};
}

$(document).ready(function() {
	var idPlace = $("#idPlace").val();
	var objectPlaceItem = new PlaceItem(idPlace);
	objectPlaceItem.init();
});

