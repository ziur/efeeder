package org.jala.efeeder.suggestion;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;

/**
 *
 * @author Amir
 */
@Command
public class createSuggestionCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {
        Connection connection = parameters.getConnection();
        PreparedStatement stm;
        
        String parameter = "";
        int idFoodMeeting = -1;
        try
        {
            parameter = parameters.getParameter("id_food_meeting");
            idFoodMeeting = Integer.parseInt(parameter);
            stm = connection.prepareStatement("select id from food_meeting where id=?");
            stm.setInt(1, idFoodMeeting);
            stm.executeQuery();
        }
        catch (NumberFormatException | SQLException e)
        {
            return OutBuilder.response("text/plain", "Invalid food meeting id: " +
                    parameter + ". " + e.toString());
        }  
        
        int idPlace;
        try 
        {
            parameter = parameters.getParameter("id_place");
            idPlace = Integer.parseInt(parameter);
            if (idPlace >= 0)
            {
                stm = connection.prepareStatement("select id from places where id=?");
                stm.setInt(1, idPlace);
                stm.executeQuery();     
            } 
        }
        catch (NumberFormatException e)
        {
            idPlace = -1;
        }    
        catch (SQLException e)
        {
            return OutBuilder.response("text/plain", "Invalid place id " +
                            parameter + ". " + e.toString());            
        }
        
       
        int idUser = parameters.getUser().getId();
         
        stm = connection.prepareStatement(
                "delete from food_meeting_user where id_user=? and id_food_meeting=?");
        stm.setInt(1, idUser);
        stm.setInt(2, idFoodMeeting);
        try
        {
            stm.executeUpdate();
        }
        catch (Exception e)
        {
            if (idPlace < 0)
            {
                return OutBuilder.response("text/plain", "Failed to remove: " + e.toString());
            }
        }

        if (idPlace >= 0) {
            stm = connection.prepareStatement(
                    "insert into food_meeting_user(id_food_meeting, id_user, id_place) values(?, ?, ?)");
            stm.setInt(1, idFoodMeeting);
            stm.setInt(2, idUser);
            stm.setInt(3, idPlace);
            try
            {
                stm.executeUpdate();
                return OutBuilder.response("text/plain", "Inserted user id " +
                    idUser + ", place id " + idPlace +
                    " to food meeting id " + idFoodMeeting);
            }
            catch (Exception e)
            {
                return OutBuilder.response("text/plain", "Failed to insert: " + e.toString());
            }
        }

        return OutBuilder.response("text/plain", "Removed user id " + 
                idUser + " from food meeting id " + 
                idFoodMeeting);
    }
}
