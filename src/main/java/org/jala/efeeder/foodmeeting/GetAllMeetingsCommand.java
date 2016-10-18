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
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;
import org.jala.efeeder.user.UserManager;

/**
 *
 * @author Mirko Terrazas
 */
@Command
public class GetAllMeetingsCommand implements CommandUnit {
    
	private static final String SELECT_FOOD_MEETING_SQL = "Select id, name, image_link, event_date, created_at, "
			+ "voting_time, order_time, payment_time, id_user "
			+ "from food_meeting where event_date >= ? order by event_date";

	@Override
	public Out execute(In parameters) throws Exception {
		PreparedStatement stm = parameters.getConnection().prepareStatement(SELECT_FOOD_MEETING_SQL);
		stm.setTimestamp(1, new Timestamp(System.currentTimeMillis()));
		ResultSet resultSet = stm.executeQuery();

		UserManager userManager = new UserManager(parameters.getConnection());

		List<FoodMeeting> foodMeetings = new ArrayList<>();
		while (resultSet.next()) {

			foodMeetings.add(new FoodMeeting(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3),
					resultSet.getTimestamp(4), resultSet.getTimestamp(5), resultSet.getTimestamp(6),
					resultSet.getTimestamp(7), resultSet.getTimestamp(8), userManager.getUserById(resultSet.getInt(9))));
		}

		return OutBuilder.response("application/json", JsonConverter.objectToJSON(foodMeetings));
	}
}
