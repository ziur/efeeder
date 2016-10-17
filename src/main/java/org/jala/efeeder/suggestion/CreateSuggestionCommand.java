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
import static org.jala.efeeder.suggestion.GetSuggestionsCommand.getSuggestionsAsString;

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
	public static String createSuggestion(int idFoodMeeting, int idUser, int idPlace, Connection connection) throws Exception {
		boolean allPlaces = idPlace == -2;
		PreparedStatement stm;
		
		if (allPlaces){
			stm = connection.prepareStatement(GET_ALL_PLACES);
			ResultSet resSet = stm.executeQuery();
			try {
				PreparedStatement stmi = connection.prepareStatement(SET_PLACE_SUGGESTION);
				while(resSet.next()) {
					int id = resSet.getInt("id");
					stmi.setInt(1, idFoodMeeting);
					stmi.setInt(2, id);
					stmi.setInt(3, idFoodMeeting);
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
			stm.setInt(1, idFoodMeeting);
			stm.setInt(2, idUser);
			try {
				stm.executeUpdate();
			} 
			catch (Exception e) {
				return "Failed to remove: " + e.toString();
			}	
			
			if (idPlace >= 0)
			{
				stm = connection.prepareStatement(INSERT_USER_SUGGESTION);
				stm.setInt(1, idFoodMeeting);
				stm.setInt(2, idUser);			
				stm.setInt(3, idPlace);
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
	
	private static int getPlaceId(String placeId)
	{
		int result;
		try {
			if ("all".equals(placeId))
			{
				result = -2;
			}
			else
			{
				result = Integer.parseInt(placeId);
				if (result < 0) result = -1;
			}
		}
		catch (NumberFormatException e) {
			result = -1;
		}
		return result;
	}
	
	@Override
	public Out execute(In parameters) throws Exception {
		String error = null;		
		int idFoodMeeting = -1;
		int idPlace = -1;
		int idUser = parameters.getUser().getId();
		Connection connection = parameters.getConnection();
		
		MessageContext context = parameters.getMessageContext();
		
		// Deprecated AJAX mode
		if (context == null)
		{
			try {
				idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
			}
			catch (NumberFormatException e) {
				idFoodMeeting = -1;
				error = e.toString();
			}  

   			idPlace = getPlaceId(parameters.getParameter("id_place"));

			if (error == null)
			{
				error = createSuggestion(idFoodMeeting, idUser, idPlace, connection);
			}
			
			if (error != null)
			{
				return OutBuilder.response("text/plain", error);
			}
					
			return OutBuilder.response("application/json", getSuggestionsAsString(parameters));
		}
		
		// Web sockets mode
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
		
		if (createSuggestionEvent != null && error == null)
		{
			idFoodMeeting = createSuggestionEvent.getIdFoodMeeting();
			idPlace = getPlaceId(createSuggestionEvent.getIdPlace().toString());
			error = createSuggestion(idFoodMeeting, idUser, idPlace, connection);
		}
		
		if (error != null)
		{
			return OutBuilder.response("text/plain", error);
		}
		
		String roomId = context.getRoom().toString();
		String users = getUserSuggestionsAsString(idFoodMeeting, connection);
		String places = getPlacesSuggestionsAsString(idFoodMeeting, connection);	
		
		System.out.println("Food meeting id: " + idFoodMeeting);
		System.out.println("Place id: " + idPlace);
		System.out.println("User id: " + idUser);
		System.out.println("users: " + users);
		System.out.println("places: " + places);
		
		List<MessageEvent> events = new ArrayList<>();
		events.add(MessageEvent.newBuilder().setEvent(
				CreateSuggestionEvent.newBuilder().
						setIdFoodMeeting(idFoodMeeting).
						setIdPlace(Integer.toString(idPlace)).
						setUserList(users).
						setPlaceList(places).
				build()).build());

		MessageContext messageContext = MessageContext.newBuilder().
				setRoom(roomId).setUser(idUser).setEvents(events).build();
				
		return OutBuilder.response(messageContext);
	}
}
