package org.jala.efeeder.order;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.EventCommand;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.MessageContextUtils;
import org.jala.efeeder.places.PlaceItem;
import org.jala.efeeder.places.PlaceItemManager;
import org.jala.efeeder.servlets.websocket.avro.CreateOrderEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.servlets.websocket.avro.PlaceItemOrder;
import org.jala.efeeder.servlets.websocket.avro.RemoveOrderEvent;
import org.jala.efeeder.servlets.websocket.avro.UserOrder;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class RemoveOrderCommand extends EventCommand {

	private RemoveOrderEvent removeOrderEvent;

	
	@Override
	public boolean initialize(){
		super.initialize();
		this.removeOrderEvent = MessageContextUtils.getEvent(parameters.getMessageContext(), RemoveOrderEvent.class);
		this.idFoodMeeting = removeOrderEvent.getIdFoodMeeting();
		if (removeOrderEvent.getIdFoodMeeting() <= 0 || removeOrderEvent.getIdPlaceItem() <= 0) {
			this.errorManager.addErrorString("The order to be removed does not exist");
			return false;
		}
		return true;
	}
	@Override
	public boolean checkParameters() {
		return true;
	}
	@Override
	public Out execute() throws SQLException {
		Out out = removeOrder();
		return out;
	}

	private Out removeOrder() throws SQLException {
		//removeOrderEvent already set in initialize()
		//RemoveOrderEvent removeOrderEvent = MessageContextUtils.getEvent(parameters.getMessageContext(), RemoveOrderEvent.class);

		int idFoodMeeting = removeOrderEvent.getIdFoodMeeting();
		int idUser = removeOrderEvent.getIdUser();
		int idPlaceItem = removeOrderEvent.getIdPlaceItem();
		
		Connection connection = parameters.getConnection();

		OrderManager orderManager = new OrderManager(connection);
		orderManager.deleteOrder(idFoodMeeting, idUser, idPlaceItem);

		return buildResponse(idFoodMeeting, idUser,idPlaceItem);
	}

	private Out buildResponse(int idFoodMeeting, int idUser,int idPlaceItem) {
		List<MessageEvent> events = new ArrayList<>();

		events.add(MessageEvent.newBuilder()
				.setEvent(
						RemoveOrderEvent.newBuilder()
						.setIdFoodMeeting(idFoodMeeting)
						.setIdUser(idUser)
						.setIdPlaceItem(idPlaceItem)
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
