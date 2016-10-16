$(document).ready(function () {
	var idFoodMeeting = $('#id-food-meeting').val();
	var myOrderContainer = $("#my-order-container");

	function updateMyOrderFields() {
		var orderDetailsText = orderDetailsInput.children('#my-order-text').val();
		var orderDetailsLabel = orderDetails.text();

		var orderCostText = orderCostInput.val();
		var orderCostLabel = orderCost.text();

		if (orderDetailsText !== orderDetailsLabel ||
						orderCostText !== orderCostLabel) {
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
				id_food_meeting: idFoodMeeting,
				details: orderDetails.text(),
				cost: orderCost.text()
			}
		}).done(function () {
			console.log('DONE');
		}).fail(function () {
			console.log('FAILED');
		});
	}

	$(function () {
		var idFoodMeeting = $('#id-food-meeting').val();
		var orderListContainer = $("#order-list");
		var orderList = new OrderList(orderListContainer, idFoodMeeting);

		var communicationService = new CommunicationService();
		communicationService.onMessage(function (message) {
			messageContext = message['org.jala.efeeder.servlets.websocket.avro.MessageContext'];
			$.each(messageContext.events, function (index, item) {
				var eventType = Object.getOwnPropertyNames(item.event)[0];

				var eventMessage = item.event[eventType];

				switch (eventType) {
					case "org.jala.efeeder.servlets.websocket.avro.WelcomeEvent":
						console.log("Welcome to WebSockets");
						break;
					case "org.jala.efeeder.servlets.websocket.avro.CreateOrderEvent":
						console.log('WebSockets order created successfully.');
						break;
				}
			});
		});

		communicationService.connect('ws://' + location.host + '/ws', idFoodMeeting);
		var myOrder = new Order(myOrderContainer, idFoodMeeting, communicationService);
		myOrder.init();
	});
});

var OrderList = function (orderListContainer, idFoodMeeting) {
	this.orderListContainer = orderListContainer;
	this.idFoodMeeting = idFoodMeeting;
	this.orders = [];
	this.orderTemplate;

	var self = this;

	$.get('/assets/templates/order.html', function (template) {
		orderTemplate = template;
		$.post('/action/getOrdersByFoodMeeting', {idFoodMeeting: idFoodMeeting}).done(function (orders) {
			_.each(orders, function (order) {
				insertOrder(order, false);
			});
		});
	});

	var insertOrder = function (newOrder) {
		var $orderTemplate = $.templates(orderTemplate);
		var userOwner = newOrder.user;
		self.orders.push(newOrder);

		var data = {
			"idUser": newOrder.idUser,
			"details": newOrder.details,
			"cost": newOrder.cost,
			"userName": userOwner.name,
			"userLastName": userOwner.lastName,
			"userEmail": userOwner.email
		};

		var $newOrder = $($orderTemplate.render(data));
		orderListContainer.append($newOrder);
	};

	return {
		init: function () {}
	};
};

var Order = function (myOrderContainer, idFoodMeeting, communicationService) {
	this.myOrderContainer = myOrderContainer;
	this.orderDetails = myOrderContainer.children('#my-order-details');
	this.orderDetailsInput = myOrderContainer.children('#my-order-details-input');
	this.orderCost = myOrderContainer.children('#my-order-cost');
	this.orderCostInput = myOrderContainer.children('#my-order-cost-input');
	this.btnEdit = myOrderContainer.children("#btn-edit-my-order");
	this.btnEditIcon = this.btnEdit.children('.material-icons:first');
	this.idFoodMeeting = idFoodMeeting;
	this.communicationService = communicationService;

	var self = this;

	function addEvents() {

		self.btnEdit.click(function () {
			if (self.btnEditIcon.text() === 'mode_edit') {
				self.btnEditIcon.text('done');
				self.orderDetails.hide();
				self.orderCost.hide();
				self.orderDetailsInput.show();
				self.orderCostInput.show();
			} else {
				self.btnEditIcon.text('mode_edit');
				self.orderDetailsInput.hide();
				self.orderCostInput.hide();
				self.orderDetails.show();
				self.orderCost.show();

				updateMyOrderFields();
			}
		});
	}

	function updateMyOrderFields() {
		var orderDetailsText = self.orderDetailsInput.children('#my-order-text').val();
		var orderDetailsLabel = self.orderDetails.text();

		var orderCostText = self.orderCostInput.val();
		var orderCostLabel = self.orderCost.text();

		if (orderDetailsText !== orderDetailsLabel ||
						orderCostText !== orderCostLabel) {
			self.orderDetails.text(orderDetailsText);
			self.orderCost.text(orderCostText);
			//setMyOrder();
			saveMyOrder();
		}
	}

	function saveMyOrder() {
		self.communicationService.sendMessage({
			user: parseInt(Cookies.get("userId")),
			room: self.idFoodMeeting,
			command: "CreateOrder",
			events: [
				{
					event: {
						CreateOrderEvent: {
							idFoodMeeting: parseInt(self.idFoodMeeting),
							idUser: parseInt(Cookies.get("userId")),
							details: "test details.",
							cost: 22,
							userOwner: {
								name: "asd",
								lastName: "dsa",
								email: "asd.asd"
							}
						}
					}
				}
			]
		});
	}

	return {
		init: function () {
			addEvents();
		},
		reset: function () {

		}
	};
};
