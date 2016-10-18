package org.jala.efeeder.foodmeeting;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;

import org.jala.efeeder.user.UserManager;

public class FoodMeetingManager {

	private static final String SELECT_BY_ID_FOOD_MEETING = "SELECT id, name, image_link, event_date, created_at, "
			+ "voting_time, order_time, payment_time, id_user FROM food_meeting WHERE id=?";
	private static final String UPDATE_VOTING_TIME_BY_ID = "UPDATE food_meeting SET voting_time=? WHERE id=? AND id_user=?;";
	private static final String UPDATE_ORDER_TIME_BY_ID = "UPDATE food_meeting SET order_time=? WHERE id=? AND id_user=?;";
	private static final String UPDATE_PAYMENT_TIME_BY_ID = "UPDATE food_meeting SET payment_time=? WHERE id=? AND id_user=?;";


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
	
	public void setStatusById(int id, int idUser, FoodMeetingStatus newStatus) throws SQLException {
		
		Timestamp now = new Timestamp((new Date()).getTime());
		PreparedStatement preparedStatement = connection.prepareStatement("");
		switch (newStatus) {
			case Order:
				preparedStatement = connection.prepareStatement(UPDATE_VOTING_TIME_BY_ID);
				break;
			case Payment:
				preparedStatement = connection.prepareStatement(UPDATE_ORDER_TIME_BY_ID);
				break;
			case Buying:
				preparedStatement = connection.prepareStatement(UPDATE_PAYMENT_TIME_BY_ID);
				break;			
		}
		
		preparedStatement.setTimestamp(1, now);
		preparedStatement.setInt(2, id);
		preparedStatement.setInt(3, idUser);

		preparedStatement.executeUpdate();
	}
}
