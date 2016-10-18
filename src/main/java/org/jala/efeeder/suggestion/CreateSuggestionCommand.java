package org.jala.efeeder.suggestion;

import java.util.List;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;

import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.CreateSuggestionEvent;

import static org.jala.efeeder.suggestion.GetSuggestionsCommand.getUserSuggestionsAsString;
import static org.jala.efeeder.suggestion.GetSuggestionsCommand.getPlacesSuggestionsAsString;
import static org.jala.efeeder.suggestion.GetSuggestionsCommand.getVoteFinisherUserId;

/**
 *
 * @author 0x3
 */
@Command
public class CreateSuggestionCommand implements CommandUnit {

	private static final String DELETE_USER_SUGGESTION =
			"DELETE FROM food_meeting_user WHERE id_food_meeting=? AND id_user=?";
	private static final String INSERT_USER_SUGGESTION =
			"INSERT INTO food_meeting_user(id_food_meeting, id_user, id_place) VALUES(?, ?, ?)";
	private static final String GET_ALL_PLACES =
			"SELECT id FROM places";
	private static final String SET_PLACE_SUGGESTION =
			"INSERT INTO food_meeting_user(id_food_meeting, id_user, id_place) SELECT ?, NULL, ? FROM dual WHERE NOT EXISTS (SELECT * FROM food_meeting_user WHERE id_food_meeting = ? AND id_place = ?)";

	// Returns null upon success, an error string upon failure
	// If idPlace is -1 deletes the user choice, if is -2 adds all of them
	public static String createSuggestion(int feastId, int userId, int placeId, Connection connection) throws Exception {
		int ownerId = getVoteFinisherUserId(feastId, connection);
		if (ownerId <= 0)
		{
			return "Voting already closed.";
		}
		
		boolean allPlaces = placeId == -2;
		PreparedStatement stm;
		
		if (allPlaces){
			stm = connection.prepareStatement(GET_ALL_PLACES);
			ResultSet resSet = stm.executeQuery();
			try {
				PreparedStatement stmi = connection.prepareStatement(SET_PLACE_SUGGESTION);
				while(resSet.next()) {
					int id = resSet.getInt("id");
					stmi.setInt(1, feastId);
					stmi.setInt(2, id);
					stmi.setInt(3, feastId);
					stmi.setInt(4, id);
					stmi.executeUpdate();
				}
			}
			catch (Exception e) {
				return "Failed to insert all places: " + e.toString();
			}
		}
		else {
			
			stm = connection.prepareStatement(DELETE_USER_SUGGESTION);
			stm.setInt(1, feastId);
			stm.setInt(2, userId);
			try {
				stm.executeUpdate();
			} 
			catch (Exception e) {
				return "Failed to remove: " + e.toString();
			}	
			
			if (placeId >= 0)
			{
				stm = connection.prepareStatement(INSERT_USER_SUGGESTION);
				stm.setInt(1, feastId);
				stm.setInt(2, userId);			
				stm.setInt(3, placeId);
				try {
					stm.executeUpdate();
				}
				catch (Exception e) {
					return "Failed to set: " + e.toString();
				}
			}
		}
		
		return null;
	}
	
	@Override
	public Out execute(In parameters) throws Exception {
		String error = null;		
		int idUser = parameters.getUser().getId();
		Connection connection = parameters.getConnection();
		MessageContext context = parameters.getMessageContext();
		List<MessageEvent> messages = context.getEvents();
		CreateSuggestionEvent createSuggestionEvent = null;
		
		try
		{
			createSuggestionEvent = (CreateSuggestionEvent)messages.get(0).getEvent();
		}
		catch (Exception e)
		{
			error = "Not a CreateSuggestionEvent: " + e.toString();
		}
		
		int feastId = -1;
		int placeId = -1;		
		if (createSuggestionEvent != null)
		{
			feastId = createSuggestionEvent.getFeastId();
			placeId = createSuggestionEvent.getPlaceId();
		}
		if (error == null)
		{
			error = createSuggestion(feastId, idUser, placeId, connection);
		}
		
		if (error != null)
		{
			return OutBuilder.response("text/plain", error);
		}
		
		String roomId = context.getRoom();
		String users = getUserSuggestionsAsString(feastId, connection);
		String places = getPlacesSuggestionsAsString(feastId, connection);	
		
		List<MessageEvent> events = new ArrayList<>();
		events.add(MessageEvent.newBuilder().setEvent(
				CreateSuggestionEvent.newBuilder().
						setFeastId(0).
						setPlaceId(0).
						setUsers(users).
						setPlaces(places).
				build()).build());

		MessageContext messageContext = MessageContext.newBuilder().setUser(0).
				setRoom(roomId).setEvents(events).build();
				
		return OutBuilder.response(messageContext);
	}
}
