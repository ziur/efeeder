package org.jala.efeeder.foodmeeting;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;

import java.sql.*;
import java.util.List;

/**
 * Created by denis_vasquez on 10/28/16.
 */
@Command
public class GetAllMeetingsByUserCommand extends MockCommandUnit{
    @Override
    public Out execute(In parameters) throws Exception {
        Connection connection = parameters.getConnection();

        int userId = parameters.getUser().getId();
        List<FoodMeeting> meetings = getFoodMeetings(connection, userId);
        return OutBuilder.response("application/json", JsonConverter.objectToJSON(meetings));
    }

    private List<FoodMeeting> getFoodMeetings(Connection connection, int userId) throws Exception {
        try {
            FoodMeetingManager foodMeetingManager = new FoodMeetingManager(connection);
            return foodMeetingManager.getFoodMeetingByUser(userId);
        } catch (SQLException ex) {
            throw new Exception("Failed to get food meeting from database : " + ex.toString());
        }
    }
}
