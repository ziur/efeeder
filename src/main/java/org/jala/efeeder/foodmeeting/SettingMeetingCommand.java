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
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 *
 * @author Danitza Machicado
 */
@Command
public class SettingMeetingCommand implements CommandUnit {
    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();
        Connection connection = parameters.getConnection();
      
        FoodMeeting foodMeeting = new FoodMeeting();
        String id = parameters.getParameter("id_food_meeting");
        PreparedStatement preparedStatement = connection.prepareStatement("Select name, image_link, event_date, created_at from food_meeting where id = ?");
        preparedStatement.setInt(1, Integer.valueOf(id));
        ResultSet resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            foodMeeting = (new FoodMeeting(Integer.valueOf(id), resultSet.getString(1), resultSet.getString(2),
                    resultSet.getTimestamp(3), resultSet.getTimestamp(4)));
        }

        out.addResult("foodMeeting", foodMeeting);

        out.forward("foodmeeting/settingMeeting.jsp");

        return out;
    }
    
}