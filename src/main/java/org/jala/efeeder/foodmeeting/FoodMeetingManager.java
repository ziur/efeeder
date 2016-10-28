package org.jala.efeeder.foodmeeting;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

import org.jala.efeeder.user.UserManager;

public class FoodMeetingManager {

	private static final String SELECT_BY_ID_FOOD_MEETING = "SELECT id, name, image_link, status, event_date, created_at, "
			+ "voting_time, order_time, payment_time, id_user FROM food_meeting WHERE id=?";
	private static final String UPDATE_STATUS_BY_ID = "UPDATE food_meeting SET status=? WHERE id=? AND id_user=?;";
	private static final String SELECT_ORDER_TIME = "SELECT order_time FROM food_meeting WHERE id=?;";
	private static final String SELECT_VOTING_TIME  = "SELECT voting_time FROM food_meeting WHERE id=?;";
	private static final String SELECT_PAYMENT_TIME  = "SELECT payment_time FROM food_meeting WHERE id=?;";

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
			foodMeeting = new FoodMeeting(id, resultSet.getString(2), resultSet.getString(3), FoodMeetingStatus.valueOf(resultSet.getString(4)),
					resultSet.getTimestamp(5), resultSet.getTimestamp(6), resultSet.getTimestamp(7),
					resultSet.getTimestamp(8), resultSet.getTimestamp(9), userManager.getUserById(resultSet.getInt(10)));
		}

		return foodMeeting;
	}

	public Timestamp getStatusTime(int idFoodMeeting, String status) throws SQLException {
		String query = null;
		switch (status) {
			case "Order":
				query = SELECT_ORDER_TIME;
				break;
			case "Voting":
				query = SELECT_VOTING_TIME;
				break;
			case "Payment":
				query = SELECT_PAYMENT_TIME;
				break;
			default:
				throw new IllegalArgumentException("Invalid meeting status: " + status);
		}
	
		PreparedStatement preparedStatement = connection.prepareStatement(query);
		preparedStatement.setInt(1, idFoodMeeting);
		ResultSet resultSet = preparedStatement.executeQuery();

		if (resultSet.next()) {
			return resultSet.getTimestamp(1);
		}
		return null;
	}
	
	public void setStatusById(int id, int idUser, FoodMeetingStatus newStatus) throws SQLException {
		PreparedStatement preparedStatement = connection.prepareStatement(UPDATE_STATUS_BY_ID);
		preparedStatement.setString(1, newStatus.name());
		preparedStatement.setInt(2, id);
		preparedStatement.setInt(3, idUser);
		preparedStatement.executeUpdate();
	}
}
