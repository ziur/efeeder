$(function () {
    var addExternalItemId = "addItem";
    var communicationService = new CommunicationService();
    var inputState = $("#input-state-id").val();
    
    var paymentItem = new  PaymentItem();
	paymentItem.init();

    communicationService.onMessage(function (event) {
        $.each(event.events, function (index, item) {
            var eventType = Object.getOwnPropertyNames(item.event)[0];

            var eventMessage = item.event[eventType];

            switch (eventType) {
                case "org.jala.efeeder.servlets.websocket.avro.WelcomeEvent":
                    console.log('WebSockets connected by FoodMeetings.');
                    break;

                case "org.jala.efeeder.servlets.websocket.avro.CreateExtraItemPayment":
                    var itemId = eventMessage.itemId;
                    var itemName = eventMessage.itemName;
                    var itemPrice = eventMessage.itemPrice;

                    var $toastContent = $('<span><a href="#' + itemId + '" class="white-text">' + itemName + ' item was created successfully!</a></span>');
                    console.log("el evento : " + $toastContent);
                    Materialize.toast($toastContent, 5000);
                    var totalItemsPrice = $("#total_items_price_id");
                    
                    var buttonStyle = "style='display:" + inputState + "'"
                    var button = "<td><a class='btn-floating btn-small waves-effect waves-light red delete-item' "+ buttonStyle +"><i class='material-icons'>delete</i></a></td>";
//                    if(inputState.localeCompare(""))
                    $("#items_id tr:last").after("<tr id='" + itemId + "'><td>" + itemName + "</td><td>" + "la descripcion" + "</td><td>" + itemPrice + "</td>" + button + "</tr>");

                    $(".validate").val("");
                    var numAux = parseFloat(totalItemsPrice.text()) + itemPrice;
                    totalItemsPrice.text(numAux);
                    break;
            }
        });
    });

    communicationService.connect('ws://' + location.host + '/ws', addExternalItemId);
    console.log("el id esss del roon : " + addExternalItemId);
});

var PaymentItem = function() {
	var table = $("#create-user-form");
	var foodMeetingId = $("#input-food-meeting-id");
	var deleteItemButton = $('.delete-item');
	var formAddItem = $('#formAddItemId');
    var totalItemsPrice = $("#total_items_price_id");
	var selft = this;

	var messageUser = $("#message-user");

	var addEventClick= function () {
			formAddItem.submit(function (event) {
                createItem(event, true);
            }); 
            
            deleteItemButton.click(function () {
                var d = this.parentNode.parentNode.rowIndex;
                var aa = this;
                document.getElementById('items_id').deleteRow(d);
                deletePayItem(this.parentNode.parentNode.id);
                updatePayDeleted(this.parentNode.parentNode);
            });
	};
    
    var createItem = function(event, isNew) {
        var createUserData = new FormData($(formAddItem)[0]);
        createUserData.append("id_food_meeting", foodMeetingId.val());
        $.ajax({
            url: "addPaymentItem",
            type: "post",
            data: createUserData,
            processData: false,
            contentType: false,
            cache: false,
            success: function (data) {
                Materialize.toast(data + ' sended.', 2000);
            },
            error: function (data) {
                errorMessage(data.responseJSON.message);
            }
        });
        event.preventDefault();
    };
    
    var functionDeleteRow = function () {
        var d = this.parentNode.parentNode.rowIndex;
        var aa = this;
        document.getElementById('items_id').deleteRow(d);
        deletePayItem(this.parentNode.parentNode.id);
        updatePayDeleted(this.parentNode.parentNode);
    };

    var deletePayItem = function (index) {
        var index_value = {"index_key": "index"};
        $.ajax({
            url: '/action/deletePaymentItem?index=' + index,
            success: function (result) {
                Materialize.toast('You delete' + result, 2000);
            }
        });
    };

    var updatePayDeleted = function (numWrapper) {
        var num = numWrapper.children[2].textContent;
        var numAux = parseFloat(totalItemsPrice.text()) - parseFloat(num);
        totalItemsPrice.text(numAux);
    };
    
    return {
		init: function(){
			addEventClick();
		},
	};
};