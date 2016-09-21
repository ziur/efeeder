package org.jala.efeeder.foodmeeting;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class FoodMeetingCommand implements CommandUnit {
    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();
        Connection connection = parameters.getConnection();
        Statement statement = connection.createStatement();
        ResultSet resultSet = statement
                .executeQuery(
                        "Select id, name, image_link, event_date, created_at from food_meeting order by created_at");
        List<FoodMeeting> foodMeetings = new ArrayList<>();
        while (resultSet.next()) {
            foodMeetings.add(new FoodMeeting(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3),
                    resultSet.getDate(4), resultSet.getDate(5)));
        }
        out.addResult("foodMeetings", foodMeetings);
        return out.forward("foodmeeting/foodMeeting.jsp");
    }
}
