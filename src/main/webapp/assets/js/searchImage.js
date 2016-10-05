var s, ModalSearchImage = {
	settings: {
		cardImage: null,
		fieldImage: null,
		imageList: null,
		imageComponent: null,
		imageCard: null
	},

	init: function(cardImage, fieldImage, imageList, imageComponent, imageCard){
		s = this.settings;
		s.cardImage = cardImage;
		s.fieldImage = fieldImage;
		s.imageList = imageList;
		s.imageComponent = imageComponent;
		s.imageCard = imageCard;
		this.organizeImages();
		this.addEventClick();
		this.addEventChange();
		s.fieldImage.focus();
	},
	
	addEventChange: function(){
		s.fieldImage.change(function(event) {
			ModalSearchImage.setCardMainImage($(this).val());
		});
	},

	addEventClick: function() {
		s.imageList.click(function() {
			ModalSearchImage.setCardMainImage($(this).data("imageLink"));
			ModalSearchImage.setFieldMainImage($(this).data("imageLink"));
			s.fieldImage.focus();
		});
	},
	
	setCardMainImage: function(value) {
		s.cardImage.attr("src", value);
	},
	
	setFieldMainImage: function(value) {
		s.fieldImage.val(value);
	},
	
	organizeImages: function() {
		s.imageComponent.imagesLoaded().done(function() {
			s.imageComponent.masonry({
				itemSelector : '.grid-item',
				columnWidth : 50
			});
		});
	}
};