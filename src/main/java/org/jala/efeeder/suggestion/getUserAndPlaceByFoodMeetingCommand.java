/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.suggestion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;

/**
 *
 * @author alexander_castro
 */
@Command
public class getUserAndPlaceByFoodMeetingCommand implements CommandUnit {

    private static final String SELECT_USERS_BY_MEETING_SQL =
            "SELECT id_user,user.name,user.last_name,id_place FROM food_meeting_user,user WHERE food_meeting_user.id_food_meeting=? AND food_meeting_user.id_user=user.id";
    private static final String SELECT_PLACES_BY_MEETING_SQL =
            "SELECT places.id,places.name,places.description,places.phone,places.direction,places.image_link,count(*) AS votes FROM food_meeting_user,places WHERE food_meeting_user.id_food_meeting=? AND food_meeting_user.id_place=places.id GROUP BY places.id";
    
    @Override
    public Out execute(In parameters) throws Exception {
        Connection connection = parameters.getConnection();
        int idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
        
        PreparedStatement ps = connection.prepareStatement(SELECT_USERS_BY_MEETING_SQL);
        ps.setInt(1, idFoodMeeting);
        ResultSet resSet = ps.executeQuery();
        
        List<UserAndPlace> usersAndPlaces = new ArrayList<>();
        while(resSet.next()) {
            usersAndPlaces.add(new UserAndPlace(
                    resSet.getInt("id_user"),
                    resSet.getInt("id_place"),
                    resSet.getString("user.name") + " " + resSet.getString("user.last_name") ));
        }
        
        ps = connection.prepareStatement(SELECT_PLACES_BY_MEETING_SQL);
        ps.setInt(1, idFoodMeeting);
        resSet = ps.executeQuery();
        
        List<Place> places = new ArrayList<>();
        while(resSet.next()) {
            places.add(new Place(resSet.getInt("places.id"), 
                    resSet.getString("places.name"), 
                    resSet.getString("places.description"), 
                    resSet.getString("places.phone"),
                    resSet.getString("places.direction"),
                    resSet.getString("places.image_link"),
                    resSet.getInt("votes")));
        }

        Suggestion suggestion = new Suggestion(usersAndPlaces, places, parameters.getUser().getId());
        return OutBuilder.response("application/json", JsonConverter.objectToJSON(suggestion));
    }
    
}
