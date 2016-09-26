package org.jala.efeeder.foodmeeting;

import static java.sql.Statement.RETURN_GENERATED_KEYS;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.api.utils.JsonConverter;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class CreateFoodMeetingCommand implements CommandUnit {


    private static final String INSERT_FOOD_MEETING_SQL = "insert into food_meeting(name,image_link, event_date, created_at) "
            + "values(?, ?, ?, ?)";

    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();
        if (parameters.getParameter("meeting_name") == null && parameters.getParameter("eventdate") == null) {
            return out.forward("foodmeeting/foodMeeting.jsp");
        }

        PreparedStatement stm = parameters.getConnection()
                                        .prepareStatement(INSERT_FOOD_MEETING_SQL, RETURN_GENERATED_KEYS);

        DateTimeFormatter formatter = DateTimeFormat.forPattern("dd/MM/yyyy HH:mm:ss");
        DateTime dateTime = formatter.parseDateTime(parameters.getParameter("eventdate"));

        Timestamp eventDate = new Timestamp(dateTime.getMillis());
        Timestamp createdAt = new Timestamp(System.currentTimeMillis());

        stm.setString(1, parameters.getParameter("meeting_name"));
        stm.setString(2, "http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg");
        stm.setTimestamp(3, eventDate);
        stm.setTimestamp(4, createdAt);

        stm.executeUpdate();

        ResultSet generatedKeysResultSet = stm.getGeneratedKeys();
        generatedKeysResultSet.next();
        int meetingId = generatedKeysResultSet.getInt(1);
        stm.close();

        FoodMeeting foodMeeting = new FoodMeeting(meetingId, parameters.getParameter("meeting_name"),
                "https://images.sciencedaily.com/2016/06/160614100258_1_540x360.jpg",
                new Timestamp(eventDate.getTime()), new Timestamp(createdAt.getTime()));

        return OutBuilder.response("application/json", JsonConverter.objectToJSON(foodMeeting));
    }
}
