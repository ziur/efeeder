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
	var logMessageContainer = $("#log-message-container"); 

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
					showLogs(data);
				},
				error: function(data){
					showLogs(data.responseJSON);
				}
			});
		}
	};
	
	var showLogs = function(message) {
		textArea.val(message);
		textArea.trigger('autoresize');
		logMessageContainer.attr("hidden", false);
	}

	return {
		init: function(){
			addEventClick();
		},
	};
};