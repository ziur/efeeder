var ModalSearchMenu = function(modalContainer, orderName, orderQuantity, orderCost, btnEditIcon, btnAdd, idPlaceItem, messageOrder, idPlace) {
	this.orderName = orderName;
	this.orderCost = orderCost;
	this.orderQuantity = orderQuantity;
	this.modalContainer = modalContainer;
	this.btnEditIcon = btnEditIcon;
	this.btnAdd = btnAdd;
	this.addNewItemBtn  = $("#add_new_item_button");
	this.idPlaceItem =idPlaceItem;
	this.imageList = $('.image-link');
	this.messageOrder = messageOrder;
	this.idPlace = idPlace;

	var self = this;

	var form = $("#create-place-item-form");

	var id;
	var name;
	var price;

	var addEventChange = function() {
	
	};

	var onModalHide = function() {
		self.messageOrder.removeClass("red-text");
		self.messageOrder.addClass('grey-text');
		self.messageOrder.text("Please select your orders.");

		self.idPlaceItem.val(id);
		self.orderName.val(name);
		self.orderCost.val(price);
		self.btnEditIcon.text('search');
		self.btnAdd.show();
	};

	var addEventClick = function() {
		self.imageList.click(function() {
			id = $(this).data("id");
			name = $(this).data("name");
			price = $(this).data("price");
			self.modalContainer.closeModal({dismissible: true, complete: onModalHide});
		});

		self.addNewItemBtn.click(function(event) {
			event.preventDefault();

			var formData = form.serialize();

			var commandUrl = form.attr( "action" );

			var createData = new FormData(form[0]);
			createData.append("id-place", idPlace);
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
				error: function(xhr,textStatus,text){
					//TODO Define how the error message will be displayed.
					//alert("The item cannot be added because the price is not correct");
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
			addEventClick();
			organizeModalImages();
		}
	};
};