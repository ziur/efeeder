package org.jala.efeeder.foodmeeting;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.order.Order;
import org.jala.efeeder.user.User;

import java.sql.*;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class CreateFoodMeetingCommand implements CommandUnit {
    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();
        if (parameters.getParameter("name") == null) {
            return out.forward("foodmeeting/createFoodMeeting.jsp");
        }

        PreparedStatement stm = parameters.getConnection()
                                        .prepareStatement("insert into food_meeting(name, created_at, fellow_dinner_id) values(?, ?, ?)");
        stm.setString(1, parameters.getParameter("name"));
        stm.setDate(2, new Date(System.currentTimeMillis()));
        stm.setInt(3, 1);
        stm.executeUpdate();

        int idFoodMeeting=-1;
        stm = parameters.getConnection().prepareStatement("Select id from food_meeting where name = ?");
        stm.setString(1, parameters.getParameter("name"));
        ResultSet resultSet = stm.executeQuery();

        while (resultSet.next()) {
            idFoodMeeting = resultSet.getInt(1);
        }

        return out.redirect("action/suggestions?id_food_meeting="+idFoodMeeting);
    }
}
