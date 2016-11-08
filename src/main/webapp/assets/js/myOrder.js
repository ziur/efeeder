var MyOrder = function (myOrderContainer, idFoodMeeting, idUser, toastMessage, idPlace) {
	this.myOrderContainer = myOrderContainer;
	this.userOrder = myOrderContainer.children('#my-user-order');
	this.orderDetails = myOrderContainer.children('#my-order-details');
	this.orderDetailsInput = $('#my-order-text');
	this.orderName = myOrderContainer.children('#my-order-name');
	this.orderQuantity = myOrderContainer.children('#my-order-quantity');
	this.orderCostInput = myOrderContainer.children('#my-order-cost-input');
	this.btnMenu = $("#btn-edit-my-order");
	this.btnAdd = $("#btn-add-my-order");
	this.btnEditIcon = this.btnMenu.children('.material-icons:first');
	this.idFoodMeeting = idFoodMeeting;
	this.idPlaceItem = $("#id-place-item");
	this.idUser = idUser;
	this.toastMessage = toastMessage;
	this.idPlace = idPlace;
	this.messageOrder = $("#message-order");

	var communicationService;

	this.menuModal = $("#search-menu-modal");

	var self = this;

	function enableEditMode() {
		if (self.orderDetails.text() === '' || self.orderCost.text() === '') {
			self.btnEditIcon.text('menu');
			self.btnAdd.hide();
			self.orderDetails.hide();
			self.orderDetailsInput.show();
			self.orderCostInput.show();
		}
	}

	function addEvents() {

		self.btnAdd.click(function () {
			saveMyOrder();
		});
		
		self.btnMenu.click(function () {
			self.menuModal.openModal();
			var modal = new ModalSearchMenu(self.menuModal, self.orderName, self.orderQuantity,
					self.orderCostInput, self.btnEditIcon, self.btnAdd, self.idPlaceItem, self.messageOrder,
					self.idPlace);
			modal.init();
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
		communicationService.sendMessage({
			user: self.idUser,
			room: self.idFoodMeeting,
			command: "CreateOrder",
			events: [
				{
					event: {
						CreateOrderEvent: {
							idFoodMeeting: parseInt(self.idFoodMeeting),
							idUser: self.idUser,
							idPlaceItem: parseInt(self.idPlaceItem.val()),
							quantity: parseInt(self.orderQuantity.val()),
							details: self.orderDetailsInput.val(),
							cost: parseFloat(self.orderCostInput.val()),
							user: null,
							placeItem: null
						}
					}
				}
			]
		});
	}

	function setCommunicationService(newCommunicationService) {
		communicationService = newCommunicationService;
	}

	function setErrorMessage(orderEvent) {
		if (orderEvent.idUser === self.idUser) {
			self.messageOrder.removeClass('grey-text');
			self.messageOrder.addClass("red-text");
			self.messageOrder.text(orderEvent.errorMessage);
		}
	};
	
	return {
		init: function () {
			enableEditMode();
			addEvents();
		},
		setCommunicationService: setCommunicationService,
		setErrorMessage: setErrorMessage
	};
};