$(document).ready(function () {
    var idUser = parseInt(Cookies.get("userId"));
    var idFoodMeeting = $('#id-food-meeting').val();
    var myOrderContainer = $("#my-order-container");
    $(function () {
        var myOrder = new MyPayment(myOrderContainer, idFoodMeeting, idUser);
        myOrder.init();

        var addExternalItemId = "addItem";
        var communicationService = new CommunicationService();
        var inputState = $("#input-state-id").val();

        var paymentItem = new PaymentItem();
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

                        var totalItemsPrice = $("#total_items_price_id");

                        var buttonStyle = "style='display:" + inputState + "'"
                        var button = "<td><a class='btn-floating btn-small waves-effect waves-light red delete-item' " + buttonStyle + "><i class='material-icons'>delete</i></a></td>";

                        $("#items_id tr:last").after("<tr id='" + itemId + "'><td>" + itemName + "</td><td>" + "la descripcion" + "</td><td>" + itemPrice + "</td>" + button + "</tr>");

                        $(".validate").val("");
                        var numAux = parseFloat(totalItemsPrice.text()) + itemPrice;
                        totalItemsPrice.text(numAux);

                        Materialize.toast($toastContent, 5000);
                        break;
                    case "org.jala.efeeder.servlets.websocket.avro.DeleteExtraItemPayment":
                        var item_id = eventMessage.tableIndex;
                        var stringId = "#" + item_id;
                        var indexRowOnTable = $(stringId).index() + 1;
                        var itemPrice = $(stringId).children("td")[2].textContent;
                        document.getElementById('items_id').deleteRow(indexRowOnTable);
                        paymentItem.updateTotal(itemPrice);
                        Materialize.toast("Item delete!", 2000);
                        break;
                }
            });
        });

        communicationService.connect('ws://' + location.host + '/ws', addExternalItemId);

    });
});

var PaymentItem = function () {
    var table = $("#items_id");
    var foodMeetingId = $("#input-food-meeting-id");
    var deleteItemButton = $('.delete-item');
    var formAddItem = $('#formAddItemId');
    var totalItemsPrice = $("#total_items_price_id");
    var selft = this;

    var messageUser = $("#message-user");

    var addEventClick = function () {
        formAddItem.submit(function (event) {
            createItem(event, true);
        });

        table.on('click', 'a.delete-item', function () {
            deletePayItem(this.parentNode.parentNode.id);
        });
    };

    var createItem = function (event, isNew) {
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
                console.log("was sended and success");
            },
            error: function (data) {
                errorMessage(data.responseJSON.message);
            }
        });
        event.preventDefault();
    };

    var updateClickDeleteItem = function () {
        deleteItemButton.click(function () {
            deletePayItem(this.parentNode.parentNode.id);
        });
    };

    var deletePayItem = function (index) {
        var index_value = {"index_key": "index"};
        var item_id = {"index_key": "index"};
        $.ajax({
            url: '/action/deletePaymentItem?index=' + index,
            success: function (result) {
                console.log('You delete ' + result);
            }
        });
    };

    var updatePayDeletedOnTotal = function (num) {
        var numAux = parseFloat(totalItemsPrice.text()) - parseFloat(num);
        totalItemsPrice.text(numAux);
    };

    return {
        init: function () {
            addEventClick();
        },
        updateTotal: function (num) {
            updatePayDeletedOnTotal(num);
        },
        updateClick: function () {
            updateClickDeleteItem();
        }
    };
};

var MyPayment = function (myOrderContainer, idFoodMeeting, idUser) {
    this.btnEdit = myOrderContainer.children().children(".btn-edit-my-order");
    this.btnEditIcon = this.btnEdit.children('.material-icons:first');

    var self = this;
    function addEvents() {
        self.btnEdit.each(function (index, item) {
            $(item).click(function () {
                var btnEditIcon = $(item).children('.material-icons:first');
                var label = $(item).parent().children('.my-order-cost');
                var input = $(item).parent().children('#my-order-cost-input');
                var orderCost = $(item).parent().children('.my-order-cost');
                var orderDetails = $(item).parent().children('.my-order-details');
                if (btnEditIcon.text() === 'crop_square') {
                    btnEditIcon.text('done');
                    label.show();
                    input.hide();
                    updateMyPaymentFields(input, label);
                } else {
                    btnEditIcon.text('crop_square');
                    label.hide();
                    input.show();

                }
            });
        });
    }
    function updateMyPaymentFields(input, label) {
        label.text(input.val());
        $.post('/action/AddPayment', {id_food_meeting: idFoodMeeting, id_user: idUser}).done(function (response) {
            console.log(response);
        });
    }
    return {
        init: function () {
            addEvents();
        }
    };


}
