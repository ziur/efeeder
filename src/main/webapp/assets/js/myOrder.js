var MyOrder = function (myOrderContainer, idFoodMeeting, idUser, communicationService, toastMessage) {
	this.myOrderContainer = myOrderContainer;
	this.userOrder = myOrderContainer.children('#my-user-order');
	this.orderDetails = myOrderContainer.children('#my-order-details');
	this.orderDetailsInput = $('#my-order-text');
	this.orderName = myOrderContainer.children('#my-order-name');
	this.orderQuantity = myOrderContainer.children('#my-order-quantity');
	//this.orderCost = myOrderContainer.children('#my-order-cost');
	this.orderCostInput = myOrderContainer.children('#my-order-cost-input');
	//this.btnEdit = myOrderContainer.children("#btn-edit-my-order");
	this.btnMenu = $("#btn-edit-my-order");
	this.btnAdd = $("#btn-add-my-order");
	this.btnEditIcon = this.btnMenu.children('.material-icons:first');
	this.idFoodMeeting = idFoodMeeting;
	this.idPlaceItem = $("#id-place-item");
	this.idUser = idUser;
	this.communicationService = communicationService;
	this.toastMessage = toastMessage;
	
	this.menuModal = $("#search-menu-modal");

	var self = this;

	function enableEditMode() {
		if (self.orderDetails.text() === '' || self.orderCost.text() === '') {
			self.btnEditIcon.text('menu');
			self.btnAdd.hide();
			self.orderDetails.hide();
			//self.orderCost.hide();
			self.orderDetailsInput.show();
			self.orderCostInput.show();
		}
	}

	function addEvents() {
		/*self.btnEdit.click(function () {
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
		*/
		
		self.btnAdd.click(function () {
			saveMyOrder();
		});
		
		self.btnMenu.click(function () {
			self.menuModal.openModal();
			var modal = new ModalSearchMenu(self.menuModal, self.orderName, self.orderQuantity,
					self.orderCostInput, self.btnEditIcon, self.btnAdd, self.idPlaceItem);
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

	function initChronometer() {
		/*$(".countdown").attr("data-date", $('#order_time').val());
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
		});*/
	};
	
	return {
		init: function () {
			initChronometer();
			enableEditMode();
			addEvents();
		}
	};
};