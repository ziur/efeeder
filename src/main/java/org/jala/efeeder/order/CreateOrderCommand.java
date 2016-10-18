package org.jala.efeeder.order;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.MessageContextUtils;
import org.jala.efeeder.servlets.websocket.avro.CreateOrderEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.servlets.websocket.avro.UserOrder;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class CreateOrderCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		Out out = saveOrder(parameters);
		return out;
	}

	private Out saveOrder(In parameters) throws SQLException {
		CreateOrderEvent createOrderEvent = MessageContextUtils.getEvent(parameters.getMessageContext(), CreateOrderEvent.class);

		int idFoodMeeting = createOrderEvent.getIdFoodMeeting();
		int idUser = createOrderEvent.getIdUser();
		String details = createOrderEvent.getDetails();
		double cost = createOrderEvent.getCost();
		Connection connection = parameters.getConnection();

		OrderManager orderManager = new OrderManager(connection);
		Order myOrder = orderManager.getMyOrder(idUser, idFoodMeeting);
		if (myOrder == null) {
			orderManager.insertOrder(idFoodMeeting, idUser, details, cost);
		} else {
			orderManager.updateOrder(idFoodMeeting, idUser, details, cost);
		}
		UserOrder userOrder = getUserOrder(connection, idUser);

		return buildResponse(idFoodMeeting, idUser, details, cost, userOrder);
	}

	private UserOrder getUserOrder(Connection connection, int idUser) throws SQLException {
		UserManager userManager = new UserManager(connection);
		User user = userManager.getUserById(idUser);

		return new UserOrder(user.getName(), user.getLastName(), user.getEmail());
	}

	private Out buildResponse(int idFoodMeeting, int idUser, String details, double cost, UserOrder userOrder) {
		List<MessageEvent> events = new ArrayList<>();

		events.add(MessageEvent.newBuilder()
				.setEvent(
						CreateOrderEvent.newBuilder()
						.setIdFoodMeeting(idFoodMeeting)
						.setIdUser(idUser)
						.setDetails(details)
						.setCost(cost)
						.setUser(userOrder)
						.build()
				)
				.build()
		);

		MessageContext messageContext = MessageContext.newBuilder()
				.setRoom(Integer.toString(idFoodMeeting))
				.setUser(idUser)
				.setEvents(events)
				.build();

		return OutBuilder.response(messageContext);
	}
}
