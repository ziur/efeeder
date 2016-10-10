var ModalSearchImage = function(cardImage, fieldImage, imageList, imageComponent, imageCard) {
	this.cardImage = cardImage;
	this.fieldImage = fieldImage;
	this.imageList = imageList;
	this.imageComponent = imageComponent;
	this.imageCard = imageCard;

	var self = this;

	var addEventChange = function() {
		self.fieldImage.change(function(event) {
			ModalSearchImage.setCardMainImage($(this).val());
		});
	};

	var onModalHide = function() {
		var imageLink = $("#image-link-id").val();
		$("#new-image-card-id").attr("src", imageLink);
	};

	var addEventClick = function() {
		self.imageList.click(function() {
			setCardMainImage($(this).data("imageLink"));
			setFieldMainImage($(this).data("imageLink"));
			$('#search-image-modal-id').closeModal({dismissible: true, complete: onModalHide});
		});

	};

	var setCardMainImage = function(value) {
		self.cardImage.attr("src", value);
	};

	var setFieldMainImage = function(value) {
		self.fieldImage.val(value);
	};

	var organizeImages = function() {
		self.imageComponent.imagesLoaded().done(function() {
			self.imageComponent.masonry({
				itemSelector: '.grid-item',
				columnWidth: 50
			});
		});
	};

	return {
		init: function() {
			organizeImages();
			addEventClick();
			addEventChange();
			self.fieldImage.focus();
		}
	};
};