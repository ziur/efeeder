var ModalSearchMenu = function(modalContainer, orderName, orderQuantity, orderCost, btnEditIcon, btnAdd, idPlaceItem) {
	this.orderName = orderName;
	this.orderCost = orderCost;
	this.orderQuantity = orderQuantity;
	this.modalContainer = modalContainer;
	this.btnEditIcon = btnEditIcon;
	this.btnAdd = btnAdd;
	this.idPlaceItem =idPlaceItem;
	this.imageList = $('.image-link');

	var self = this;
	
	var id;
	var name;
	var price;

	var addEventChange = function() {
	
	};

	var onModalHide = function() {
		self.idPlaceItem.val(id);
		self.orderName.val(name);
		self.orderQuantity.val(1);
		self.orderCost.val(price);
		self.btnEditIcon.text('mode_edit');
		self.btnAdd.show();
	};

	var addEventClick = function() {
		self.imageList.click(function() {
			id = $(this).data("id");
			name = $(this).data("name");
			price = $(this).data("price");
			self.modalContainer.closeModal({dismissible: true, complete: onModalHide});
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