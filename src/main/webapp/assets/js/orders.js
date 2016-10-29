$(document).ready(function () {
	var idUser = parseInt(Cookies.get("userId"));
	var idFoodMeeting = $('#id-food-meeting').val();
	var orderListContainer = $("#order-list");
	var myOrderContainer = $("#my-order-container");
	var orderList = new OrderList(idFoodMeeting, idUser, orderListContainer);

	$(function () {
		var communicationService = new CommunicationService();
		communicationService.onMessage(function (message) {
			$.each(message.events, function (index, item) {
				var eventType = Object.getOwnPropertyNames(item.event)[0];
				var event = item.event[eventType];

				switch (eventType) {
					case "org.jala.efeeder.servlets.websocket.avro.WelcomeEvent":
						console.log("Welcome to WebSockets");
						break;
					case "org.jala.efeeder.servlets.websocket.avro.CreateOrderEvent":
						orderList.updateOrders(event);
						break;
					case "org.jala.efeeder.servlets.websocket.avro.ChangeFoodMeetingStatusEvent":
						document.location.href = "/action/FoodMeeting";
						break;
				}
			});
		});

		communicationService.connect('ws://' + location.host + '/ws', idFoodMeeting);

		var myOrder = new MyOrder(myOrderContainer, idFoodMeeting, idUser, communicationService);
		myOrder.init();

		var paymentButton = new PaymentButton(idFoodMeeting, idUser, communicationService);
		paymentButton.init();
		
		$(window).on('beforeunload', function() {
			communicationService.disconnect();
		});
	});
});

var OrderList = function (idFoodMeeting, idUser, orderListContainer) {
	this.idFoodMeeting = idFoodMeeting;
	this.idUser = idUser;
	this.orderListContainer = orderListContainer;
	this.orders = [];
	this.orderTemplate;

	var self = this;

	$.get('/assets/templates/order.html', function (template) {
		orderTemplate = template;
		$.post('/action/getOrdersByFoodMeeting', {idFoodMeeting: idFoodMeeting}).done(function (orders) {
			_.each(orders, function (order) {
				addOrder(order);
			});
		});
	});

	var fixUserProperty = function (orderEvent) {
		var userProp = orderEvent.user['org.jala.efeeder.servlets.websocket.avro.UserOrder'];
		if (userProp === undefined) {
			userProp = orderEvent.user;
		}
		orderEvent.user = userProp;
	};

	var addOrder = function (newOrder) {
		fixUserProperty(newOrder);

		var $orderTemplate = $.templates(orderTemplate);
		var userOwner = newOrder.user;

		var data = {
			"idUser": newOrder.idUser,
			"details": newOrder.details,
			"cost": newOrder.cost,
			"userName": userOwner.name,
			"userLastName": userOwner.lastName
		};

		var $newOrder = $($orderTemplate.render(data));
		orderListContainer.append($newOrder);
		self.orders.push(newOrder);
	};

	var updateOrder = function (order, index) {
		var orderContainer = self.orderListContainer.children("#order-" + order.idUser);
		var orderDetailsHTML = orderContainer.children(".order-details");
		var orderCostHTML = orderContainer.children(".order-cost");
		var userOrderHTML = orderContainer.children(".user-order");

		orderDetailsHTML.text(order.details);
		orderCostHTML.text(order.cost);
		userOrderHTML.text(order.user.name + " " + order.user.lastName);
		self.orders[index] = order;
	};

	var addOrUpdateOrder = function (orderEvent) {
		fixUserProperty(orderEvent);

		if (orderEvent.idUser === self.idUser) {
			return;
		}

		var updateIndex = -1;

		_.each(self.orders, function (order, index) {
			if (order.idUser === orderEvent.idUser) {
				updateIndex = index;
				return false;
			}
		});

		if (updateIndex > -1) {
			updateOrder(orderEvent, updateIndex);
		} else {
			addOrder(orderEvent);
		}
	};

	return {
		updateOrders: function (orderEvent) {
			addOrUpdateOrder(orderEvent);
		}
	};
};

var MyOrder = function (myOrderContainer, idFoodMeeting, idUser, communicationService) {
	this.myOrderContainer = myOrderContainer;
	this.orderDetails = myOrderContainer.children('#my-order-details');
	this.orderDetailsInput = myOrderContainer.children('#my-order-details-input');
	this.orderCost = myOrderContainer.children('#my-order-cost');
	this.orderCostInput = myOrderContainer.children('#my-order-cost-input');
	this.btnEdit = myOrderContainer.children("#btn-edit-my-order");
	this.btnEditIcon = this.btnEdit.children('.material-icons:first');
	this.idFoodMeeting = idFoodMeeting;
	this.idUser = idUser;
	this.communicationService = communicationService;

	var self = this;

	function enableEditMode() {
		if (self.orderDetails.text() === '' || self.orderCost.text() === '') {
			self.btnEditIcon.text('done');
			self.orderDetails.hide();
			self.orderCost.hide();
			self.orderDetailsInput.show();
			self.orderCostInput.show();
		}
	}

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

		if (orderDetailsText !== orderDetailsLabel || orderCostText !== orderCostLabel) {
			self.orderDetails.text(orderDetailsText);
			self.orderCost.text(orderCostText);

			saveMyOrder();
		}
	}

	function saveMyOrder() {
		self.communicationService.sendMessage({
			user: self.idUser,
			room: self.idFoodMeeting,
			command: "CreateOrder",
			events: [
				{
					event: {
						CreateOrderEvent: {
							idFoodMeeting: parseInt(self.idFoodMeeting),
							idUser: self.idUser,
							details: self.orderDetails.text(),
							cost: parseFloat(self.orderCost.text()),
							user: null
						}
					}
				}
			]
		});
	}

	return {
		init: function () {
			enableEditMode();
			addEvents();
		}
	};
};

var PaymentButton = function (idFoodMeeting, idUser, communicationService) {
	this.idFoodMeeting = idFoodMeeting;
	this.idUser = idUser;
	this.communicationService = communicationService;
	this.btnPayment = $("#btn-payment");
	this.newStatus = "Payment";

	var self = this;

	function addEvents() {
		if (self.btnPayment === undefined) {
			return false;
		}

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
