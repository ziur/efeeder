package org.jala.efeeder.foodmeeting;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.jala.efeeder.user.UserManager;

public class FoodMeetingManager {

	private static final String SELECT_BY_ID_FOOD_MEETING = "SELECT id, name, image_link, status, event_date, created_at, id_user FROM food_meeting WHERE id=?";

	private final Connection connection;

	public FoodMeetingManager(Connection connection) {
		this.connection = connection;
	}

	public FoodMeeting getFoodMeetingById(int id) throws SQLException {
		FoodMeeting foodMeeting = null;

		PreparedStatement preparedStatement = connection.prepareStatement(SELECT_BY_ID_FOOD_MEETING);
		preparedStatement.setInt(1, id);
		ResultSet resultSet = preparedStatement.executeQuery();

		UserManager userManager = new UserManager(connection);

		if (resultSet.next()) {
			foodMeeting = new FoodMeeting(id, resultSet.getString(2), resultSet.getString(3), resultSet.getString(4),
					resultSet.getTimestamp(5), resultSet.getTimestamp(6), userManager.getUserById(resultSet.getInt(7)));
		}

		return foodMeeting;
	}
}
