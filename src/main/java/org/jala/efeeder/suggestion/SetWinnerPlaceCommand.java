/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.suggestion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import static org.jala.efeeder.api.utils.JsonConverter.objectToJSON;
import org.jala.efeeder.foodmeeting.FoodMeetingManager;
import org.jala.efeeder.foodmeeting.FoodMeetingStatus;
import org.jala.efeeder.servlets.CommandEndpoint;
import org.jala.efeeder.servlets.websocket.avro.ChangeFoodMeetingStatusEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageContext.Builder;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import static org.jala.efeeder.suggestion.GetSuggestionsCommand.getWinnerPlaceId;
import org.jala.efeeder.util.constants.WebsocketsConstants;

/**
 *
 * @author 0x3
 */
@Command
public class SetWinnerPlaceCommand implements CommandUnit {
	private static final String SET_WINNER_PLACE =
			"UPDATE food_meeting SET id_place=? WHERE id=? AND id_user=?";
	@Override
	public Out execute(In parameters) throws Exception {
		int feastId = 0;
		try {
			int idUser = parameters.getUser().getId();
			feastId = Integer.parseInt(parameters.getParameter("feastId"));
			Connection connection = parameters.getConnection();
			int placeId = getWinnerPlaceId(feastId, connection);
			PreparedStatement stm = connection.prepareStatement(SET_WINNER_PLACE);
			stm.setInt(1, placeId);
			stm.setInt(2, feastId);
			stm.setInt(3, idUser);
			stm.executeUpdate();
			
			FoodMeetingManager meetingManager = new FoodMeetingManager(connection);
			meetingManager.setStatusById(feastId, idUser, FoodMeetingStatus.Order);
		}
		catch (NumberFormatException | SQLException e) {
			return OutBuilder.response("application/json", objectToJSON(e.toString()));
		}

		try {
			String roomId = WebsocketsConstants.voteRoomPrefix + Integer.toString(feastId);
			String homeRoomId = WebsocketsConstants.homeRoom;
			List<MessageEvent> events = new ArrayList<>();
			events.add(MessageEvent.newBuilder().setEvent(
					ChangeFoodMeetingStatusEvent.newBuilder()
						.setIdFoodMeeting(feastId)
						.setIdUser(parameters.getUser().getId())
						.setNewStatus(FoodMeetingStatus.Order.name())
						.build())
					.build());

			Builder messageBuilder = MessageContext.newBuilder().setUser(0).setEvents(events);
			CommandEndpoint.sendMessage(messageBuilder.setRoom(roomId).build());
			CommandEndpoint.sendMessage(messageBuilder.setRoom(homeRoomId).build());
		}
		catch (Exception e) {
			return OutBuilder.response("application/json", objectToJSON(e.toString()));
		}
		
		return OutBuilder.response("application/json", "{\"Success\":true}");
	}
}