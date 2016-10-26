$(function() {
	$.uploadPreview({
		input_field: "#file-upload",
		preview_box: "#file-preview",
		label_field: "#file-label"
	});

	var importPlace = new ImportPlace();
	importPlace.init();
});

var ImportPlace = function() {
	var form = $("#import-form");
	var importButton = $("#import-button");
	var textArea = $("#textarea-log");
	var fileText = $("#file-text"); 

	var addEventClick= function () {
		importButton.click(function (event) {
			importPlace(event);
			});
	};

	var importPlace = function(event) {
		event.preventDefault();

		if(form.valid()) {
			var formData = form.serialize();

			var commandUrl = form.attr( "action" );

			var importData = new FormData(form[0]);
			$.ajax({
				url : commandUrl,
				type : "post",
				data : importData,
				processData: false,
				contentType: false,
				cache : false,
				success : function(data) {
					textArea.val(data);
					textArea.trigger('autoresize');
					
				},
				error: function(data){
					textArea.val(data.responseJSON);
					textArea.trigger('autoresize');
				}
			});
		}
	};

	return {
		init: function(){
			addEventClick();
		},
	};
};