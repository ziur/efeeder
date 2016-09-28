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
public class getUserAndPLaceByFoodMeetingCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {
        Connection connection = parameters.getConnection();
        int idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
        
        PreparedStatement ps = connection.prepareStatement("select * from food_meeting_user where id_food_meeting=?");
        ps.setInt(1, idFoodMeeting);
        ResultSet resSet = ps.executeQuery();
        List<UserAndPlace> usersandplaces = new ArrayList<>();
        
        while(resSet.next()) {
            usersandplaces.add(new UserAndPlace(resSet.getInt("id_user"), resSet.getInt("id_place")));
        }
        
        return OutBuilder.response("application/json", JsonConverter.objectToJSON(usersandplaces));
    }
    
}
