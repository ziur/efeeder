package org.jala.efeeder.foodmeeting;

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
import org.jala.efeeder.servlets.CommandEndpoint;
import org.jala.efeeder.servlets.websocket.avro.ChangeFoodMeetingStatusEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageContext.Builder;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.util.constants.WebsocketsConstants;

/**
 *
 * @author amir_aranibar
 */
@Command
public class ChangeFoodMeetingStatusCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		MessageContext receivedMessage = parameters.getMessageContext();
		ChangeFoodMeetingStatusEvent receivedEvent = MessageContextUtils.getEvent(receivedMessage, ChangeFoodMeetingStatusEvent.class);

		changeFoodMeetingStatus(receivedEvent, parameters.getUser().getId(), parameters.getConnection());

		List<MessageEvent> events = new ArrayList<>();
		events.add(MessageEvent.newBuilder()
				.setEvent(
						ChangeFoodMeetingStatusEvent.newBuilder()
						.setIdFoodMeeting(receivedEvent.getIdFoodMeeting())
						.setIdUser(receivedEvent.getIdUser())
						.setNewStatus(receivedEvent.getNewStatus())
						.build()
				)
				.build()
		);
		
		Builder messageBuilder = MessageContext.newBuilder()				
				.setUser(receivedMessage.getUser())
				.setEvents(events);

		String homeRoomId = WebsocketsConstants.homeRoom;		
		CommandEndpoint.sendMessage(messageBuilder.setRoom(homeRoomId).build());

		return OutBuilder.response(messageBuilder.setRoom(homeRoomId).setRoom(receivedMessage.getRoom()).build());
	}

	private void changeFoodMeetingStatus(ChangeFoodMeetingStatusEvent event, int idUser, Connection connection) throws SQLException {
		FoodMeetingManager foodMeetingManager = new FoodMeetingManager(connection);
		foodMeetingManager.setStatusById(event.getIdFoodMeeting(), idUser, FoodMeetingStatus.valueOf(event.getNewStatus()));
	}
}
