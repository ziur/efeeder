package org.jala.efeeder.foodmeeting;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.jala.efeeder.user.UserManager;

public class FoodMeetingManager {

	private static final String SELECT_BY_ID_FOOD_MEETING = "SELECT id, name, image_link, event_date, created_at, "
			+ "voting_time, order_time, payment_time, id_user FROM food_meeting WHERE id=?";
	private static final String UPDATE_STATUS_BY_ID = "UPDATE food_meeting SET status=? WHERE id=? AND id_user=?;";


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
			foodMeeting = new FoodMeeting(id, resultSet.getString(2), resultSet.getString(3),
					resultSet.getTimestamp(4), resultSet.getTimestamp(5), resultSet.getTimestamp(6),
					resultSet.getTimestamp(7), resultSet.getTimestamp(8), userManager.getUserById(resultSet.getInt(9)));
		}

		return foodMeeting;
	}

	public void setStatusById(int id, int idUser, String newStatus) throws SQLException {
		PreparedStatement preparedStatement = connection.prepareStatement(UPDATE_STATUS_BY_ID);
		preparedStatement.setString(1, newStatus);
		preparedStatement.setInt(2, id);
		preparedStatement.setInt(3, idUser);

		preparedStatement.executeUpdate();
	}
}
