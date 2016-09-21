package org.jala.efeeder.foodmeeting;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
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

        PreparedStatement stm = parameters.getConnection()
                .prepareStatement(
                        "Select id, name, image_link, event_date, created_at from food_meeting where event_date >= ? order by event_date");
        stm.setTimestamp(1, new Timestamp(System.currentTimeMillis()));
        ResultSet resultSet = stm.executeQuery();

        List<FoodMeeting> foodMeetings = new ArrayList<>();
        while (resultSet.next()) {
            foodMeetings.add(new FoodMeeting(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3),
                    resultSet.getDate(4), resultSet.getDate(5)));
        }
        out.addResult("foodMeetings", foodMeetings);
        return out.forward("foodmeeting/foodMeeting.jsp");
    }
}
