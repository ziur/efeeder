package org.jala.efeeder.order;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.jala.efeeder.api.command.AbstractCommandUnit;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.MessageContextUtils;
import org.jala.efeeder.places.PlaceItem;
import org.jala.efeeder.places.PlaceItemManager;
import org.jala.efeeder.servlets.websocket.avro.CreateOrderEvent;
import org.jala.efeeder.servlets.websocket.avro.ErrorEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.servlets.websocket.avro.PlaceItemOrder;
import org.jala.efeeder.servlets.websocket.avro.UserOrder;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;
import org.jala.efeeder.util.EfeederErrorMessage;
import org.jala.efeeder.util.InUtils;

/**
 * Created by alejandro on 09-09-16. pescalera 10/02/2017: This class contains
 * its attributes (coming from the jsp) in parameters.messageContext.
 * 
 */
@Command
public class CreateOrderCommand extends AbstractCommandUnit {

	public static String KEY_QUANTITY = "my-order-quantity";
	public static String KEY_COST = "my-order-cost-input";

	/*
	 * Performs a check of values quantity and cost to be greater than zero. To
	 * retrieve the values coming from jsp, it's required to retrieve
	 * parameters.getMessageContext() where the values are stored.
	 */
	@Override
	public boolean checkParameters() {
		String errorMessage = null;
		if (parameters == null) {
			return false;
		}
		CreateOrderEvent createOrderEvent = MessageContextUtils.getEvent(parameters.getMessageContext(),
				CreateOrderEvent.class);
		Integer quantity = createOrderEvent.getQuantity();
		if (quantity <= 0) {
			errorMessage = "There is no quantity specified for the current order";
			errors.put("CREATE_ORDER-1", errorMessage);
		}
		Double cost = createOrderEvent.getCost();
		if (cost <= 0) {
			errorMessage = "The cost of the new item cannot be 0 or negative";
			errors.put("CREATE_ORDER-2", errorMessage);
		}
		if (errorMessage != null) {
			return false;
		}
		return true;
	}

	@Override
	public boolean initialize(){
		if (!super.initialize()) {
			return false;
		}
		inUtils = new InUtils(parameters);
		try{
			foodMeetingId = Integer.valueOf(parameters.getParameter("idFoodMeeting"));
		}catch(NumberFormatException ex){
			if (parameters.getMessageContext()!=null) {
				foodMeetingId = MessageContextUtils.getEvent(parameters.getMessageContext(),
						CreateOrderEvent.class).getIdFoodMeeting();
			}
		}finally{
			//do nothing
		}
		
		return true;
	}

	@Override
	public Out execute() throws Exception {
		Out out = saveOrder(parameters);
		return out;
	}

	private Out saveOrder(In parameters) {

		CreateOrderEvent createOrderEvent = MessageContextUtils.getEvent(parameters.getMessageContext(),
				CreateOrderEvent.class);

		int idFoodMeeting = createOrderEvent.getIdFoodMeeting();
		int idUser = createOrderEvent.getIdUser();
		int idPlaceItem = createOrderEvent.getIdPlaceItem();
		int quantity = createOrderEvent.getQuantity();
		String details = createOrderEvent.getDetails();
		double cost = createOrderEvent.getCost();
		Connection connection = parameters.getConnection();

		try {
			OrderManager orderManager = new OrderManager(connection);

			orderManager.insertOrder(idFoodMeeting, idUser, idPlaceItem, quantity, details, cost);

			UserOrder userOrder = getUserOrder(connection, idUser);
			PlaceItemOrder placeItemOrder = getPlaceItemOrder(connection, idPlaceItem);

			return buildResponse(idFoodMeeting, idUser, idPlaceItem, quantity, details, cost, userOrder,
					placeItemOrder);
		} catch (SQLException e) {

			return buildErrorResponse(idFoodMeeting, idUser,
					EfeederErrorMessage.getEfeederMessage(e.getMessage(), this));
		}
	}

	private UserOrder getUserOrder(Connection connection, int idUser) throws SQLException {
		UserManager userManager = new UserManager(connection);
		User user = userManager.getUserById(idUser);

		return new UserOrder(user.getName(), user.getLastName(), user.getEmail());
	}

	private PlaceItemOrder getPlaceItemOrder(Connection connection, int idPlaceItem) throws SQLException {
		PlaceItemManager placeItemManager = new PlaceItemManager(connection);
		PlaceItem placeItem = placeItemManager.getPlaceItemById(idPlaceItem);

		return new PlaceItemOrder(placeItem.getId(), placeItem.getName());
	}

	private Out buildResponse(int idFoodMeeting, int idUser, int idPlaceItem, int quantity, String details, double cost,
			UserOrder userOrder, PlaceItemOrder placeItemOrder) {
		List<MessageEvent> events = new ArrayList<>();

		events.add(MessageEvent.newBuilder()
				.setEvent(
						CreateOrderEvent.newBuilder()
								.setIdFoodMeeting(idFoodMeeting)
								.setIdUser(idUser)
								.setIdPlaceItem(idPlaceItem)
								.setQuantity(quantity)
								.setDetails(details)
								.setCost(cost)
								.setUser(userOrder)
								.setPlaceItem(placeItemOrder)
								.build())
				.build());

		MessageContext messageContext = MessageContext.newBuilder()
				.setRoom(Integer.toString(idFoodMeeting))
				.setUser(idUser)
				.setEvents(events)
				.build();

		return OutBuilder.response(messageContext);
	}

	public Out buildErrorResponse(int idFoodMeeting, int idUser, String errorMessage) {
		List<MessageEvent> events = new ArrayList<>();

		events.add(MessageEvent.newBuilder()
				.setEvent(
						ErrorEvent.newBuilder()
								.setErrorMessage(errorMessage)
								.setIdUser(idUser)
								.build())
				.build());

		MessageContext messageContext = MessageContext.newBuilder()
				.setRoom(Integer.toString(idFoodMeeting))
				.setUser(idUser)
				.setEvents(events)
				.build();

		return OutBuilder.response(messageContext);
	}

}
