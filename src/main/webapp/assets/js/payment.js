/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function () {
    var idUser = parseInt(Cookies.get("userId"));
    var idFoodMeeting = $('#id-food-meeting').val();
    var myOrderContainer = $("#my-order-container");
    $(function () {
        var myOrder = new MyPayment(myOrderContainer, idFoodMeeting, idUser);
        myOrder.init();

    });
});


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
