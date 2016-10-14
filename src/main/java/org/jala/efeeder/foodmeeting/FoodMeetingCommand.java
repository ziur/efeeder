package org.jala.efeeder.foodmeeting;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.user.UserManager;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class FoodMeetingCommand implements CommandUnit {

	private static final String SELECT_FOOD_MEETING_SQL = "Select id, name, image_link, status, event_date, created_at, id_user  " 
			+ "from food_meeting where event_date >= ? order by event_date";

	private static final String SELECT_IMAGE_FOOD_MEETING_SQL = "Select distinct image_link from food_meeting";
	
	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();
		Connection connection = parameters.getConnection();
		
		out.addResult("foodMeetings", getFoodMeetings(connection));
		out.addResult("images", getImageFoodMeeting(connection));

		return out.forward("foodmeeting/foodMeeting.jsp");
	}

	private List<FoodMeeting> getFoodMeetings(Connection connection) throws SQLException {
		PreparedStatement stm = connection.prepareStatement(SELECT_FOOD_MEETING_SQL);
		stm.setTimestamp(1, new Timestamp(System.currentTimeMillis()));
		ResultSet resultSet = stm.executeQuery();
		List<FoodMeeting> foodMeetings = new ArrayList<>();

		UserManager userManager = new UserManager(connection);

		while (resultSet.next()) {
			foodMeetings.add(new FoodMeeting(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3),
					resultSet.getString(4), resultSet.getTimestamp(5), resultSet.getTimestamp(6), userManager.getUserById(resultSet.getInt(7))));
		}
		return foodMeetings;
	}
	
	private List<String> getImageFoodMeeting(Connection connection) throws SQLException {
		PreparedStatement stm = connection.prepareStatement(SELECT_IMAGE_FOOD_MEETING_SQL);
		ResultSet resultSet = stm.executeQuery();

		List<String> images = new ArrayList<>();
		while (resultSet.next()) {
			images.add(resultSet.getString(1));
		}
		return images;
	}
}
