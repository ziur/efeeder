$(document).ready(function () {
	var idUser = parseInt(Cookies.get("userId"));
	var idFoodMeeting = $('#id-food-meeting').val();
	var orderListContainer = $("#order-list");
	var myOrderContainer = $("#my-order-container");
	var foodMeetingInfo = new FoodMeetingInfo($("#food-meeting-info"));
	foodMeetingInfo.init();
	var toastMessage = new ToastMessage();
	
	var orderList = new OrderList(idFoodMeeting, idUser, orderListContainer, toastMessage);
	var myOrder = new MyOrder(myOrderContainer, idFoodMeeting, idUser, toastMessage);
	myOrder.init();

	$(function () {
		var communicationService = new CommunicationService();
		communicationService.onMessage(function (message) {
			$.each(message.events, function (index, item) {
				var eventType = Object.getOwnPropertyNames(item.event)[0];
				var event = item.event[eventType];

				switch (eventType) {
					case "org.jala.efeeder.servlets.websocket.avro.ErrorEvent":
						myOrder.setErrorMessage(event);
					break;
					case "org.jala.efeeder.servlets.websocket.avro.WelcomeEvent":
						console.log("Welcome to WebSockets");
						break;
					case "org.jala.efeeder.servlets.websocket.avro.CreateOrderEvent":
						orderList.updateOrders(event);
						break;
					case "org.jala.efeeder.servlets.websocket.avro.RemoveOrderEvent":
						orderList.removeOrderFromList(event);
						break;
					case "org.jala.efeeder.servlets.websocket.avro.ChangeFoodMeetingStatusEvent":
						document.location.href = "/action/FoodMeeting";
						break;
				}
			});
		});

		communicationService.connect('ws://' + location.host + '/ws', idFoodMeeting);
		
		orderList.setCommunicationService(communicationService);

		myOrder.setCommunicationService(communicationService);

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
	var communicationService;

	var self = this;

	$.get('/assets/templates/order.html', function (template) {
		orderTemplate = template;
		$.post('/action/getOrdersByFoodMeeting', {idFoodMeeting: idFoodMeeting}).done(function (orders) {
			_.each(orders, function (order) {
				var isSameUser = false;

				if (order.idUser === self.idUser) {
					isSameUser = true;
				}

				addOrder(order, false, isSameUser);
			});
		});
	});

	var fixUserProperty = function (orderEvent) {
		var userProp = orderEvent.user['org.jala.efeeder.servlets.websocket.avro.UserOrder'];
		var placeItemProp = orderEvent.placeItem['org.jala.efeeder.servlets.websocket.avro.PlaceItemOrder'];
		if (userProp === undefined) {
			userProp = orderEvent.user;
		}
		if (placeItemProp === undefined) {
			placeItemProp = orderEvent.placeItem;
		}
		orderEvent.user = userProp;
		orderEvent.placeItem = placeItemProp;
	};

	var addOrder = function (newOrder, showToast, isSameUser) {
		fixUserProperty(newOrder);

		var $orderTemplate = $.templates(orderTemplate);
		var userOwner = newOrder.user;

		var data = {
			"idUser": newOrder.idUser,
			"idPlaceItem": newOrder.placeItem.id,
			"itemName": decodeURIComponent(newOrder.placeItem.name),
			"quantity": newOrder.quantity,
			"details": newOrder.details,
			"cost": newOrder.cost,
			"userName": userOwner.name,
			"userLastName": userOwner.lastName,
			"isSameUser": !isSameUser
		};

		var $newOrder = $($orderTemplate.render(data));

		var removeBtn = $newOrder.children('.btn-edit');

		if (isSameUser){
			self.orders.unshift(newOrder);
			
			removeBtn.click(function () {
				removeMyOrder(newOrder.idUser, newOrder.placeItem.id);
			});
			
			orderListContainer.prepend($newOrder);
		}
		else{
			self.orders.push(newOrder);
			removeBtn.attr("hidden", "true");
			orderListContainer.append($newOrder);
		}
		
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
		var isSameUser = false;

		if (orderEvent.idUser === self.idUser) {
			isSameUser = true;
		}

		var updateIndex = -1;

		if (updateIndex > -1) {
			updateOrder(orderEvent, updateIndex);
		} else {
			addOrder(orderEvent, true, isSameUser);
		}
	};
	
	var removeOrderFromList = function (orderEvent) {
		var componentToRemove = $("#order-"+orderEvent.idUser+"-"+orderEvent.idPlaceItem);
		componentToRemove.remove();
	};
	
	var removeMyOrder = function(idUser, idPlaceItem) {
		communicationService.sendMessage({
			user: self.idUser,
			room: self.idFoodMeeting,
			command: "RemoveOrder",
			events: [
				{
					event: {
						RemoveOrderEvent: {
							idFoodMeeting: parseInt(self.idFoodMeeting),
							idUser: idUser,
							idPlaceItem: idPlaceItem
						}
					}
				}
			]
		});
	}
	
	var setCommunicationService = function(newCommunicationService) {
		communicationService = newCommunicationService;
	}

	return {
		updateOrders: function (orderEvent) {
			addOrUpdateOrder(orderEvent);
		},
		setCommunicationService: setCommunicationService,
		removeOrderFromList: removeOrderFromList
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
