package org.jala.efeeder.suggestion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import static org.jala.efeeder.suggestion.GetSuggestionsCommand.getAllSuggestionsAsString;

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
	
    @Override
    public Out execute(In parameters) throws Exception {
        Connection connection = parameters.getConnection();
        PreparedStatement stm;
		
        String parameter;
        int idFoodMeeting;
        try {
            parameter = parameters.getParameter("id_food_meeting");
            idFoodMeeting = Integer.parseInt(parameter);
        }
        catch (NumberFormatException e) {
            idFoodMeeting = -1;
        }  
        
		boolean allPlaces = false;
        int idPlace;
        try {
            parameter = parameters.getParameter("id_place");
			allPlaces = "all".equals(parameter);
            idPlace = Integer.parseInt(parameter);
        }
		catch (NumberFormatException e) {
            idPlace = -1;
        }    
       
        int idUser = parameters.getUser().getId();
        
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
                return OutBuilder.response("text/plain", "Failed to insert all places: " + e.toString());
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
				return OutBuilder.response("text/plain", "Failed to remove: " + e.toString());
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
					return OutBuilder.response("text/plain", "Failed to set: " + e.toString());
				}
			}
		}

		return OutBuilder.response("application/json", getAllSuggestionsAsString(parameters));
    }
}
