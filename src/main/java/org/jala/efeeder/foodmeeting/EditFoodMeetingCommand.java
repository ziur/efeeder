/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.foodmeeting;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.sql.Date;
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
public class EditFoodMeetingCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();

        PreparedStatement stm = parameters.getConnection()
                .prepareStatement("UPDATE food_meeting SET name= ?, image_link= ? WHERE id= ?;");

        /*DateFormat df = new SimpleDateFormat("yyyy/MM/dd"); 
         Date startDate = (Date) df.parse(date*/
        try {
            stm.setString(1, parameters.getParameter("meeting_name"));
            stm.setString(2, parameters.getParameter("image_link"));
            //stm.setDate(3, startDate);
            stm.setInt(3, Integer.valueOf(parameters.getParameter("id_food_meeting")));
            stm.executeUpdate();
        } catch (Exception e) {
        }

        return out.redirect("action/FoodMeeting");
    }
}
