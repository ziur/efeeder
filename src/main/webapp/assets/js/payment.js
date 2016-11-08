$(document).ready(function () {
    var idUser = parseInt(Cookies.get("userId"));
    var idFoodMeeting = $('#food-meeting-id').val();
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
                        var itemDescription = eventMessage.itemDescription;
                        var itemPrice = eventMessage.itemPrice;

                        var $toastContent = $('<span><a href="#' + itemId + '" class="white-text">' + itemDescription + ' item was created successfully!</a></span>');

                        var totalItemsPrice = $("#total_items_price_id");

                        var buttonStyle = "style='display:" + inputState + "'"
                        var button = "<td><a class='btn-floating btn-small waves-effect waves-light red delete-item' " + buttonStyle + "><i class='material-icons'>delete</i></a></td>";

                        $("#items_id tr:last").after("<tr id='" + itemId + "'><td>" + itemDescription + "</td><td>" + itemPrice + "</td>" + button + "</tr>");

                        $(".ipt-item").val("");
                        var numAux = parseFloat(totalItemsPrice.text()) + itemPrice;
                        totalItemsPrice.text(numAux.toFixed(2));
                        paymentItem.updatePartial(numAux);

                        Materialize.toast($toastContent, 5000);
                        break;
                    case "org.jala.efeeder.servlets.websocket.avro.DeleteExtraItemPayment":
                        var item_id = eventMessage.tableIndex;
                        var stringId = "#" + item_id;
                        var indexRowOnTable = $(stringId).index() + 1;
                        var itemPrice = $(stringId).children("td")[1].textContent;
                        document.getElementById('items_id').deleteRow(indexRowOnTable);
                        paymentItem.updateTotal(itemPrice);
                        Materialize.toast("Item delete!", 2000);
                        break;
                    case "org.jala.efeeder.servlets.websocket.avro.ChangeFoodMeetingStatusEvent":
                        document.location.href = "/action/details?id_food_meeting=" + idFoodMeeting;
                        break;
                }
            });
        });

        communicationService.connect('ws://' + location.host + '/ws', addExternalItemId);
        var detailsButton = new DetailsButton(idFoodMeeting, idUser, communicationService);
        detailsButton.init();
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
        totalItemsPrice.text(numAux.toFixed(2));
        updatePartial(numAux);
    };

    var updatePartial = function (totalItems) {
        var myOrderContainer = $("#my-order-container");
        var ordersSize = myOrderContainer.children().size();
        var totalItemsVal = parseFloat(totalItems);
        var newPartial = totalItemsVal > 0 ? totalItemsVal / ordersSize : 0;
        newPartial = newPartial.toFixed(2);
        myOrderContainer.children().each(function (index, item) {
            var userIdSelected = $(item).children('#user-id');
            var userIdSelectedVal = userIdSelected.val();
            var lnkCheck = $('#lnk-check' + userIdSelectedVal).children('.material-icons:first');
            var payment = $('#ipt-payment' + userIdSelectedVal);
            var orderCost = $('#ipt-cost' + userIdSelectedVal);
            var extraPay = $('#ipt-extra-pay' + userIdSelectedVal);
            var total = $('#ipt-total' + userIdSelectedVal);
            var shortage = $('#ipt-shortage' + userIdSelectedVal);
            updatePaymentView(userIdSelected, newPartial, orderCost, payment, shortage, total, extraPay, lnkCheck);
        });
    };
    function updatePaymentView(userId, newPartial, cost, payment, shortage, total, extraPay, lnkCheck) {
        var paymentVal = payment.val();
        if (paymentVal) {
            var costVal = parseFloat(cost.val());
            var totalVal = costVal + parseFloat(newPartial);
            total.val(totalVal.toFixed(2));
            extraPay.val(newPartial);
            var shortageVal = parseFloat(paymentVal) - parseFloat(total.val());
            shortageVal = shortageVal.toFixed(2);
            shortage.val(shortageVal);
            if (shortageVal > 0) {
                lnkCheck.text('done');
                shortage.css("color", "green");
            } else {
                lnkCheck.text('crop_square');
                shortage.css("color", "red");
            }
        }
    }

    return {
        init: function () {
            addEventClick();
        },
        updateTotal: function (num) {
            updatePayDeletedOnTotal(num);
        },
        updateClick: function () {
            updateClickDeleteItem();
        },
        updatePartial: function (num) {
            updatePartial(num);
        }
    };
};

var MyPayment = function (myOrderContainer, idFoodMeeting, idUser) {
    this.btnEdit = myOrderContainer.children().children(".btn-edit-my-order");
    this.lnkSave = myOrderContainer.children().children(".lnk-save");
    this.inputs = $('.ipt-number');
    this.btnEditIcon = this.btnEdit.children('.material-icons:first');
    this.txtTotalItems = $('#total_items_price_id');

    var self = this;
    function addEvents() {
        self.inputs.each(function (index, item) {
            var input = $(item).val();
            if (input) {
                var inputVal = parseFloat(input);
                $(item).val(inputVal.toFixed(2));
            }
        });

        self.lnkSave.each(function (index, item) {
            $(item).click(function () {
                var userIdSelected = $(item).parent().children('#user-id');
                var userIdSelectedVal = userIdSelected.val();
                var lnkCheck = $('#lnk-check' + userIdSelectedVal).children('.material-icons:first');
                var payment = $('#ipt-payment' + userIdSelectedVal);
                var orderCost = $('#ipt-cost' + userIdSelectedVal);
                var total = $('#ipt-total' + userIdSelectedVal);
                var shortage = $('#ipt-shortage' + userIdSelectedVal);
                var orderDetails = $('#spn-details' + userIdSelectedVal);
                savePayment(payment, userIdSelected, orderDetails, orderCost);
                updatePaymentView(userIdSelected, orderCost, payment, shortage, total, lnkCheck);
                return false;
            });
        });
    }
    function updatePaymentView(userId, cost, payment, shortage, total, lnkCheck) {
        var paymentVal = payment.val();
        if (paymentVal) {
            var shortageVal = paymentVal - total.val();
            shortage.val(shortageVal.toFixed(2));
            if (shortageVal >= 0) {
                lnkCheck.text('done');
                shortage.css("color", "green");
            } else {
                lnkCheck.text('crop_square');
                shortage.css("color", "red");
            }
        }
    }
    function savePayment(payment, userIdSelected, details, cost) {
        var paymentVal = payment.val();
        $.post('/action/AddPayment', {id_food_meeting: idFoodMeeting, id_user: userIdSelected.val(), details: details.text(), cost: cost.val(), payment: paymentVal}).done(function (response) {
            Materialize.toast(response.name + " " + response.lastName + "'s payment was updated", 3000);
        });
    }

    return {
        init: function () {
            addEvents();
        }
    };
}

var DetailsButton = function (idFoodMeeting, idUser, communicationService) {
    this.idFoodMeeting = idFoodMeeting;
    this.idUser = idUser;
    this.communicationService = communicationService;
    this.btnPayment = $("#btn-details");
    this.newStatus = "Finish";

    var self = this;

    function addEvents() {
        self.btnPayment.click(function () {
            changeFoodMeetingStatus();
        });
    }

    function changeFoodMeetingStatus() {
        self.communicationService.sendMessage({
            user: self.idUser,
            room: self.idFoodMeeting,
            command: "ChangeFoodMeetingStatus",
            events: [
                {
                    event: {
                        ChangeFoodMeetingStatusEvent: {
                            idFoodMeeting: parseInt(self.idFoodMeeting),
                            idUser: self.idUser,
                            newStatus: self.newStatus,
                            redirectTo: null
                        }
                    }
                }
            ]
        });
    }

    return {
        init: function () {
            addEvents();
        }
    };
};
