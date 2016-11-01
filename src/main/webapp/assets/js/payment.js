/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function () {
    var idUser = parseInt(Cookies.get("userId"));
    var idFoodMeeting = $('#food-meeting-id').val();
    var myOrderContainer = $("#my-order-container");
    $(function () {
        var myOrder = new MyPayment(myOrderContainer, idFoodMeeting, idUser);
        myOrder.init();

    });


    $("#formAddItemId").submit(function (event) {
        var createUserData = new FormData($("#formAddItemId")[0]);
        createUserData.append("id_food_meeting", $("#input-food-meeting-id").val());
        $.ajax({
            url: "addPaymentItem",
            type: "post",
            data: createUserData,
            processData: false,
            contentType: false,
            cache: false,
            success: function (data) {
                var button = "<td><a class='btn-floating btn-small waves-effect waves-light red delete-item'><i class='material-icons'>delete</i></a></td>";
                $("#items_id tr:last").after("<tr id='" + data.id + "'><td>" + data.name + "</td><td>" + data.description + "</td><td>" + data.price + "</td>" + button + "</tr>");
                updatePay(parseFloat(data.price));
                $(".delete-item").click(function () {
                    var d = this.parentNode.parentNode.rowIndex;
                    var aa = this;
                    document.getElementById('items_id').deleteRow(d);
                    deletePayItem(this.parentNode.parentNode.id);
                    updatePayDeleted(this.parentNode.parentNode);
                });
            },
            error: function (data) {
                errorMessage(data.responseJSON.message);
            }
        });
        event.preventDefault();
    });

    var totalItemsPrice = $("#total_items_price_id");

    var updatePay = function (num) {
        $(".validate").val("");
        var numAux = parseFloat(totalItemsPrice.text()) + num;
        totalItemsPrice.text(numAux);
    };

    var updatePartial = function (totalItems) {
        var myOrderContainer = $("#my-order-container");
        var ordersSize = myOrderContainer.children().size();
        var totalItemsVal = parseFloat(totalItems);
        var newPartial = totalItemsVal > 0 ? totalItemsVal / ordersSize : 0;

        myOrderContainer.children().each(function (index, order) {
            var partial = $(order).children('.partial-by-order');
            var cost = parseFloat($(order).children('.my-order-cost').text());
            var btnEditIcon = $(order).children('a').children('.material-icons:first')
            var payment = $(order).children('#my-order-cost-input');
            var paymentVal = parseFloat($(order).children('#my-order-cost-input').val());
            var labelPayment = $(order).children('.label-payment');

            var totalToPay = newPartial + cost;
            $(partial).text("+ " + newPartial + " = " + totalToPay);
            if (paymentVal >= totalToPay) {
                btnEditIcon.text('done');
                labelPayment.show();
                payment.hide();
            } else {
                btnEditIcon.text('crop_square');
                labelPayment.hide();
                payment.show();
            }
        });
    };

    $(".delete-item").click(
            function () {
                var d = this.parentNode.parentNode.rowIndex;
                var aa = this;
                document.getElementById('items_id').deleteRow(d);
                deletePayItem(this.parentNode.parentNode.id);
                updatePayDeleted(this.parentNode.parentNode);
            });

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
        updatePartial(numAux);
    };
});


var MyPayment = function (myOrderContainer, idFoodMeeting, idUser) {
    this.btnEdit = myOrderContainer.children().children(".btn-edit-my-order");
    this.btnEditIcon = this.btnEdit.children('.material-icons:first');
    this.txtTotalItems = $('#total_items_price_id');

    var self = this;
    function addEvents() {
        self.btnEdit.each(function (index, item) {
            $(item).click(function () {
                var btnEditIcon = $(item).children('.material-icons:first');
                var userIdSelected = $(item).parent().children('#user-id');
                var payment = $(item).parent().children('#my-order-cost-input');
                var labelPayment = $(item).parent().children('.label-payment');
                var orderCost = $(item).parent().children('.my-order-cost');
                var orderDetails = $(item).parent().children('.my-order-details');
                if (btnEditIcon.text() === 'crop_square') {
                    btnEditIcon.text('done');
                    labelPayment.show();
                    payment.hide();
                    updateMyPaymentFields(payment, labelPayment, userIdSelected, orderDetails, orderCost);
                } else {
                    btnEditIcon.text('crop_square');
                    labelPayment.hide();
                    payment.show();

                }
            });
        });
    }
    function updateMyPaymentFields(payment, labelPayment, userIdSelected, details, cost) {
        var paymentVal = payment.val();
        labelPayment.text(paymentVal);
        $.post('/action/AddPayment', {id_food_meeting: idFoodMeeting, id_user: userIdSelected.val(), details: details.text(), cost: cost.text(), payment: paymentVal}).done(function (response) {
            console.log(response);
        });
    }
    return {
        init: function () {
            addEvents();
        }
    };
}
