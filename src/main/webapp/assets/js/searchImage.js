var ModalSearchImage = {

	init: function(cardImage, fieldImage, imageList, imageComponent, imageCard){
		this.cardImage = cardImage;
		this.fieldImage = fieldImage;
		this.imageList = imageList;
		this.imageComponent = imageComponent;
		this.imageCard = imageCard;

		this.organizeImages();
		this.addEventClick();
		this.addEventChange();
		this.fieldImage.focus();
	},
	
	addEventChange: function(){
		this.fieldImage.change(function(event) {
			ModalSearchImage.setCardMainImage($(this).val());
		});
	},

	addEventClick: function() {
		this.imageList.click(function() {
			ModalSearchImage.setCardMainImage($(this).data("imageLink"));
			ModalSearchImage.setFieldMainImage($(this).data("imageLink"));
			ModalSearchImage.fieldImage.focus();
		});
	},
	
	setCardMainImage: function(value) {
		this.cardImage.attr("src", value);
	},
	
	setFieldMainImage: function(value) {
		this.fieldImage.val(value);
	},
	
	organizeImages: function() {
		this.imageComponent.imagesLoaded().done(function() {
			ModalSearchImage.imageComponent.masonry({
				itemSelector : '.grid-item',
				columnWidth : 50
			});
		});
	}
};