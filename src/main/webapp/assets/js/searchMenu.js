var ModalSearchMenu = function(modalContainer, orderName, orderQuantity, orderCost, btnEditIcon, btnAdd, idPlaceItem, messageOrder, idPlace) {
	this.orderName = orderName;
	this.orderCost = orderCost;
	this.orderQuantity = orderQuantity;
	this.modalContainer = modalContainer;
	this.placeItemContainer = $("#container-place-item");
	this.btnEditIcon = btnEditIcon;
	this.btnAdd = btnAdd;
	this.addNewItemBtn  = $("#add_new_item_button");
	this.idPlaceItem =idPlaceItem;
	this.imageList = $('.image-link');
	this.messageOrder = messageOrder;
	this.idPlace = idPlace;
	this.placeItemTemplate;

	var self = this;

	var form = $("#create-place-item-form");

	var id;
	var name;
	var price;
	
	
	$.get('/assets/templates/placeItem.html', function (template) {
		placeItemTemplate = template;
		$.post('/action/GetItemsByPlace', {idPlace: self.idPlace}).done(function (placeItems) {
			_.each(placeItems, function (placeItem) {
				var $placeItemTemplate = $.templates(placeItemTemplate);
				
				var data = {
					"imageLink": placeItem.imageLink,
					"id": placeItem.id,
					"name": placeItem.name,
					"price": placeItem.price
				};

				var $newPlaceItem = $($placeItemTemplate.render(data));
				
				self.placeItemContainer.append($newPlaceItem);
				
				//organizeModalImages();
				var imageBtn = $newPlaceItem.children('.image-link');
				
				imageBtn.click(function () {
					id = $(this).data("id");
					name = $(this).data("name");
					price = $(this).data("price");
					self.modalContainer.closeModal({dismissible: true, complete: onModalHide});
				});
				
				
			});
			
		});
	});
	

	
	var onModalHide = function() {
		self.messageOrder.removeClass("red-text");
		self.messageOrder.addClass('grey-text');
		self.messageOrder.text("Please add your orders.");

		self.idPlaceItem.val(id);
		self.orderName.val(name);
		self.orderQuantity.val(1);
		self.orderCost.val(price);
		self.btnEditIcon.text('mode_edit');
		self.btnAdd.show();
	};

	var addEventClick = function() {

		self.addNewItemBtn.click(function(event) {
			event.preventDefault();

			var formData = form.serialize();

			var commandUrl = form.attr( "action" );

			var createData = new FormData(form[0]);
			createData.append("id_place", idPlace);
			$.ajax({
				url : commandUrl,
				type : "post",
				data : createData,
				processData: false,
				contentType: false,
				cache : false,
				success : function(data) {
					id = data.id;
					name = data.name;
					price = data.price;

					self.modalContainer.closeModal({dismissible: true, complete: onModalHide});
				},
				error: function(data){
				}
			});
		});
	};

	var organizeModalImages = function() {
		$('.image-links').imagesLoaded().done(function() {
			$('.image-links').masonry({
				itemSelector: '.grid-item',
				columnWidth: 50
			});
		});
	};

	return {
		init: function() {
			//loadPlaceItem();
			//addEventClick();
			//organizeModalImages();
		}
	};
};