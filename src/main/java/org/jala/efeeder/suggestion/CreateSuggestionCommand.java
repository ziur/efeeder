package org.jala.efeeder.suggestion;

import java.util.List;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
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
public class CreateSuggestionCommand extends MockCommandUnit {

	private static final String DELETE_USER_SUGGESTION =
			"DELETE FROM votes WHERE id_food_meeting=? AND id_participant=(SELECT id FROM food_meeting_participants WHERE id_food_meeting = ? AND id_user = ?)";
	private static final String INSERT_OR_UPDATE_VOTE =
			"INSERT INTO votes(id_food_meeting, id_participant, id_suggestion) VALUES(?,"
                        + "(SELECT id FROM food_meeting_participants WHERE id_food_meeting=? AND id_user=?), "
                        + "(SELECT id FROM food_meeting_suggestions WHERE id_food_meeting=? AND id_place=?))"
                        + "ON DUPLICATE KEY UPDATE id_suggestion = ?";
	private static final String GET_ALL_PLACES =
			"SELECT id FROM places";
	private static final String SET_PLACE_SUGGESTION =
			"INSERT INTO food_meeting_suggestions(id_food_meeting, id_place) SELECT ?, ? FROM dual WHERE NOT EXISTS (SELECT * FROM food_meeting_suggestions WHERE id_food_meeting = ? AND id_place = ?)";
        private static final String UPDATE_SUGGESTION = 
                        "INSERT INTO food_meeting_suggestions (id_food_meeting, id_place) " +
                        " SELECT * FROM (SELECT ? AS id_food_meeting, ? AS id_place) AS tmp " +
                        " WHERE NOT EXISTS (" +
                        " SELECT * FROM food_meeting_suggestions WHERE id_food_meeting = ? AND id_place = ?) LIMIT 1";
        private static final String INSERT_PARTICIPANT = 
                        "INSERT INTO food_meeting_participants (id_food_meeting, id_user) "
                        + "SELECT * FROM (SELECT ? AS id_food_meeting, ? AS id_user) AS tmp "
                        + "WHERE NOT EXISTS ("
                        + "SELECT * FROM food_meeting_participants WHERE id_food_meeting = ? AND id_user = ?) LIMIT 1";
        
	// Returns null upon success, an error string upon failure
	// If idPlace is -1 deletes the user choice, if is -2 adds all of them
	public static String createSuggestion(int foodMeetingId, int userId, int placeId, Connection connection) throws Exception {
		int ownerId = getVoteFinisherUserId(foodMeetingId, connection);
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
					int place_id = resSet.getInt("id");
					stmi.setInt(1, foodMeetingId);
					stmi.setInt(2, place_id);
					stmi.setInt(3, foodMeetingId);
					stmi.setInt(4, place_id);
					stmi.executeUpdate();
				}
			}
			catch (Exception e) {
				return "Failed to insert all places: " + e.toString();
			}
		}
		else {
			
			stm = connection.prepareStatement(DELETE_USER_SUGGESTION);
			stm.setInt(1, foodMeetingId);
			stm.setInt(2, foodMeetingId);
                        stm.setInt(3, userId);
			try {
				stm.executeUpdate();
			} 
			catch (Exception e) {
				return "Failed to remove: " + e.toString();
			}	
			
			if (placeId >= 0)
			{
				stm = connection.prepareStatement(UPDATE_SUGGESTION);
				stm.setInt(1, foodMeetingId);
				stm.setInt(2, placeId);
                                stm.setInt(3, foodMeetingId);
				stm.setInt(4, placeId);
				try {
					stm.executeUpdate();
				}
				catch (Exception e) {
					return "Failed to insert suggestion: " + e.toString();
				}
                                stm = connection.prepareStatement(INSERT_PARTICIPANT);
                                stm.setInt(1, foodMeetingId);
                                stm.setInt(2, userId);
                                stm.setInt(3, foodMeetingId);
                                stm.setInt(4, userId);
                                try {
                                    stm.executeUpdate();
                                } catch (Exception e) {
                                    return "Failed to insert user: " + e.toString();
                                }
                                
                                stm = connection.prepareStatement(INSERT_OR_UPDATE_VOTE);
                                stm.setInt(1, foodMeetingId);
                                stm.setInt(2, foodMeetingId);
                                stm.setInt(3, userId);
                                stm.setInt(4, foodMeetingId);
                                stm.setInt(5, placeId);
                                stm.setInt(6, placeId);
                                try {
                                    stm.executeUpdate();
                                } catch (Exception e) {
                                    return "Failed to update vote: " + e.toString();
                                }
			}
		}
		
		return null;
	}
	
	@Override
	public Out execute() throws Exception {
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
