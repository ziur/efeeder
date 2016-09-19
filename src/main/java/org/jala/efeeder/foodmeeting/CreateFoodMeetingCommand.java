package org.jala.efeeder.foodmeeting;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.List;

import static java.sql.Statement.RETURN_GENERATED_KEYS;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class CreateFoodMeetingCommand implements CommandUnit {


    private static final String INSERT_FOOD_MEETING_SQL = "insert into food_meeting(name, created_at, " +
                              "fellow_dinner_id) values(?, ?, ?)";

    private static final String ADD_PARTICIPANT_TO_FOOD_MEETING_SQL = "insert into orders(id_food_meeting, id_user) values(?, ?)";

    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();
        if (parameters.getParameter("name") == null) {
            return out.forward("foodmeeting/createFoodMeeting.jsp");
        }
        List<String> friends = parameters.getParameters("friends");


        PreparedStatement stm = parameters.getConnection()
                                        .prepareStatement(INSERT_FOOD_MEETING_SQL, RETURN_GENERATED_KEYS);

        stm.setString(1, parameters.getParameter("name"));
        stm.setDate(2, new Date(System.currentTimeMillis()));
        stm.setInt(3, 1);
        stm.executeUpdate();

        ResultSet generatedKeysResultSet = stm.getGeneratedKeys();
        generatedKeysResultSet.next();
        int meetingId = generatedKeysResultSet.getInt(1);
        stm.close();

        PreparedStatement addParticipantStm = parameters.getConnection()
                                        .prepareStatement(ADD_PARTICIPANT_TO_FOOD_MEETING_SQL);

        addParticipantStm.setInt(1, meetingId);

        for(String friend:friends) {
            int friendId = Integer.parseInt(friend);
            addParticipantStm.setInt(2, friendId);
            addParticipantStm.executeUpdate();
        }

        return out.redirect("action/order?id_food_meeting=" + meetingId);
    }
}
