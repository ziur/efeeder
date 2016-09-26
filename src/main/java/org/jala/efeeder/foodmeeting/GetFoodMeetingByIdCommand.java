/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.foodmeeting;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
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
public class GetFoodMeetingByIdCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {
        Connection connection = parameters.getConnection();
        int foodMeetingId = Integer.parseInt(parameters.getParameter("id_food_meeting"));
        
        PreparedStatement prepareStatement = connection.prepareStatement("select * from food_meeting where id=?");
        prepareStatement.setInt(1, foodMeetingId);
        
        ResultSet result = prepareStatement.executeQuery();
        FoodMeeting foodMeeting = null;
        
        if(result.next()){
            foodMeeting = new FoodMeeting(result.getInt("id"), 
                    result.getString("name"), 
                    result.getString("image_link"), 
                    result.getTimestamp("event_date"), 
                    result.getTimestamp("created_at"));
        }
        
        return OutBuilder.response("application/json", JsonConverter.objectToJSON(foodMeeting));
    }
    
}
