$(document).ready(function () {
	var idUser = parseInt(Cookies.get("userId"));
	var idFoodMeeting = $('#id-food-meeting').val();
	var orderListContainer = $("#order-list");
	var myOrderContainer = $("#my-order-container");
	var foodMeetingInfo = new FoodMeetingInfo($("#food-meeting-info"));
	foodMeetingInfo.init();
	var toastMessage = new ToastMessage();
	var orderList = new OrderList(idFoodMeeting, idUser, orderListContainer, toastMessage);

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
						document.location.href = "/action/payment?id_food_meeting=" + idFoodMeeting;
						break;
				}
			});
		});

		communicationService.connect('ws://' + location.host + '/ws', idFoodMeeting);

		var myOrder = new MyOrder(myOrderContainer, idFoodMeeting, idUser, communicationService, toastMessage);
		myOrder.init();

		var paymentButton = new PaymentButton(idFoodMeeting, idUser, communicationService);
		paymentButton.init();
		
		$(window).on('beforeunload', function() {
			communicationService.disconnect();
		});
	});
});

var OrderList = function (idFoodMeeting, idUser, orderListContainer, toastMessage) {
	this.idFoodMeeting = idFoodMeeting;
	this.idUser = idUser;
	this.orderListContainer = orderListContainer;
	this.orders = [];
	this.orderTemplate;
	this.toastMessage = toastMessage;

	var self = this;

	$.get('/assets/templates/order.html', function (template) {
		orderTemplate = template;
		$.post('/action/getOrdersByFoodMeeting', {idFoodMeeting: idFoodMeeting}).done(function (orders) {
			_.each(orders, function (order) {
				addOrder(order, false);
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

	var addOrder = function (newOrder, showToast) {
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
		if (showToast) {
			self.toastMessage.showMessage(self.toastMessage.OrderStates.NEW, userOwner.name + " " + userOwner.lastName);
		}
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
		self.toastMessage.showMessage(self.toastMessage.OrderStates.UPDATE, order.user.name + " " + order.user.lastName);
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
			addOrder(orderEvent, true);
		}
	};

	return {
		updateOrders: function (orderEvent) {
			addOrUpdateOrder(orderEvent);
		}
	};
};

var MyOrder = function (myOrderContainer, idFoodMeeting, idUser, communicationService, toastMessage) {
	this.myOrderContainer = myOrderContainer;
	this.userOrder = myOrderContainer.children('#my-user-order');
	this.orderDetails = myOrderContainer.children('#my-order-details');
	this.orderDetailsInput = myOrderContainer.children('#my-order-details-input');
	this.orderCost = myOrderContainer.children('#my-order-cost');
	this.orderCostInput = myOrderContainer.children('#my-order-cost-input');
	this.btnEdit = myOrderContainer.children("#btn-edit-my-order");
	this.btnEditIcon = this.btnEdit.children('.material-icons:first');
	this.idFoodMeeting = idFoodMeeting;
	this.idUser = idUser;
	this.communicationService = communicationService;
	this.toastMessage = toastMessage;

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
			self.toastMessage.showMessage(self.toastMessage.OrderStates.UPDATE_MY_ORDER, self.userOrder.text());
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

	function initChronometer() {
		$(".countdown").attr("data-date", $('#order_time').val());
		$('.countdown').countdown({
			refresh: 1000,
			offset: 0,
			onEnd: function() {
				return;
			},
			render: function(date) {
				if (date.days !== 0) {
					this.el.innerHTML = date.days + " DAYS";
				} else {
					this.el.innerHTML = this.leadingZeros(date.hours) + ":" +
						this.leadingZeros(date.min) + "." +
						this.leadingZeros(date.sec);
					if(date.min <= 30 && date.hours === 0){
					$(".countdown").css('color', 'red');
				}
				}
			}
		});
	};
	
	return {
		init: function () {
			initChronometer();
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

var FoodMeetingInfo = function (foodMeetingInfoContainer) {
	this.eventDate = foodMeetingInfoContainer.find("#food-meeting-date");

	var self = this;

	function fixEventDate() {
		self.eventDate.text(moment(self.eventDate.text()).calendar());
	}

	return {
		init: function () {
			fixEventDate();
		}
	};
};

var ToastMessage = function () {
	this.OrderStates = {
		NEW: 0,
		UPDATE: 1,
		UPDATE_MY_ORDER: 2
	};
	this.duration = 5000;

	var self = this;

	function showMessage(orderStates, userName) {
		var toastContent;
		switch (orderStates) {
			case self.OrderStates.NEW:
				toastContent = $('<span>' + userName + ' has added an order!</span>');
				break;
			case self.OrderStates.UPDATE:
				toastContent = $('<span>' + userName + ' has updated an order!</span>');
				break;
			case self.OrderStates.UPDATE_MY_ORDER:
				toastContent = $('<span>My order has been updated successfully!</span>');
				break;
			default:
				return false;
		}
		Materialize.toast(toastContent, self.duration);
	}

	return {
		showMessage: function (orderStates, userName) {
			showMessage(orderStates, userName);
		},
		OrderStates: self.OrderStates
	};
};
