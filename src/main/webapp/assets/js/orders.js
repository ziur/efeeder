$(document).ready(function () {
    let btnEdit = $("#btn-edit-my-order").children('.material-icons:first');
    let orderDetails = $('#my-order-details');
    let orderDetailsInput = $('#my-order-details-input');
    let orderCost = $('#my-order-cost');
    let orderCostInput = $('#my-order-cost-input');

    $("#btn-edit-my-order").click(function () {
        if (btnEdit.text() === 'mode_edit') {
            btnEdit.text('done');
            orderDetails.hide();
            orderCost.hide();
            orderDetailsInput.show();
            orderCostInput.show();
        } else {
            btnEdit.text('mode_edit');
            orderDetailsInput.hide();
            orderCostInput.hide();
            orderDetails.show();
            orderCost.show();
            
            updateMyOrderFields();
        }
    });

    if ($("#my-order-details").text() === '') {
        btnEdit.text('done');
        orderDetails.hide();
        orderCost.hide();
        orderDetailsInput.show();
        orderCostInput.show();
    }
    
    function updateMyOrderFields() {
        let orderDetailsText = orderDetailsInput.children('#my-order-text').val();
        let orderDetailsLabel = orderDetails.text();
        
        let orderCostText = orderCostInput.val();
        let orderCostLabel = orderCost.text();
        
        if (orderDetailsText != orderDetailsLabel ||
                orderCostText != orderCostLabel) {
            orderDetails.text(orderDetailsText);
            orderCost.text(orderCostText);
            setMyOrder();
        }
    }
    
    function setMyOrder() {
        $.ajax({
            type: "POST",
            url: "/action/AddOrder",
            data: {
                id_food_meeting: $('#id-food-meeting').val(),
                details: orderDetails.text(),
                cost: orderCost.text()
            }
        }).done(function() {
            console.log('DONE');
        }).fail(function() {
            console.log('FAILED');
        });
    }
});

$(function() {
	var communicationService = new CommunicationService();
	communicationService.onMessage(function(message) {
		$.each(message.events, function(index, item) {
			var eventType = Object.getOwnPropertyNames(item.event)[0];

			var eventMessage = item.event[eventType];

			switch (eventType) {
				case "org.jala.efeeder.servlets.websocket.avro.CreateOrderEvent":
					console.log('WebSockets order created successfully.');
					break;
			}
		});
	});

	communicationService.connect('ws://' + location.host + '/ws', $('#id-food-meeting').val());
});

var Order = function(communicationService) {
	this.communicationService = communicationService;

	var self = this;

	return {
		init: function() {
		},
		reset: function() {

		}
	};
}
