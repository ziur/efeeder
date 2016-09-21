package org.jala.efeeder.foodmeeting;

import static java.sql.Statement.RETURN_GENERATED_KEYS;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
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
public class CreateFoodMeetingCommand implements CommandUnit {


    private static final String INSERT_FOOD_MEETING_SQL = "insert into food_meeting(name, event_date, created_at) "
            + "values(?, ?, ?)";

    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();
        if (parameters.getParameter("meeting_name") == null && parameters.getParameter("date") == null
                && parameters.getParameter("time") == null) {
            return out.forward("foodmeeting/foodMeeting.jsp");
        }
        List<String> friends = parameters.getParameters("friends");


        PreparedStatement stm = parameters.getConnection()
                                        .prepareStatement(INSERT_FOOD_MEETING_SQL, RETURN_GENERATED_KEYS);


        stm.setString(1, parameters.getParameter("name"));
        stm.setDate(2, new Date(System.currentTimeMillis()));
        stm.setDate(3, new Date(System.currentTimeMillis()));

        stm.executeUpdate();

        ResultSet generatedKeysResultSet = stm.getGeneratedKeys();
        generatedKeysResultSet.next();
        int meetingId = generatedKeysResultSet.getInt(1);
        stm.close();


        return out.redirect("foodmeeting/foodMeeting.jsp");
    }
}
