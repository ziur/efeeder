package org.jala.efeeder.foodmeeting;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.jala.efeeder.user.UserManager;

public class FoodMeetingManager {

	private static final String SELECT_BY_ID_FOOD_MEETING = "SELECT id, name, image_link, status, event_date, created_at, "
			+ "voting_time, order_time, payment_time, id_user FROM food_meeting WHERE id=?";
	private static final String SELECT_UNFINISHED_FOOD_MEETINGS_SQL = "Select id, name, image_link, status, event_date, "
			+ "created_at, voting_time, order_time, payment_time, id_user "
			+ "from food_meeting where status != 'Finish' order by event_date";	
	private static final String UPDATE_STATUS_BY_ID_AND_USER = "UPDATE food_meeting SET status=? WHERE id=? AND id_user=?";

	private final Connection connection;
	private UserManager userManager;

	public FoodMeetingManager(Connection connection) {
		this.connection = connection;
		this.userManager = new UserManager(connection);
	}

	public FoodMeeting getFoodMeetingById(int id) throws SQLException {
		FoodMeeting foodMeeting = null;

		PreparedStatement preparedStatement = connection.prepareStatement(SELECT_BY_ID_FOOD_MEETING);
		preparedStatement.setInt(1, id);
		ResultSet resultSet = preparedStatement.executeQuery();

		if (resultSet.next()) {
			foodMeeting = new FoodMeeting(id, resultSet.getString(2), resultSet.getString(3), FoodMeetingStatus.valueOf(resultSet.getString(4)),
					resultSet.getTimestamp(5), resultSet.getTimestamp(6), resultSet.getTimestamp(7),
					resultSet.getTimestamp(8), resultSet.getTimestamp(9), this.userManager.getUserById(resultSet.getInt(10)));
		}

		return foodMeeting;
	}
	
	public void setStatusById(int id, int idUser, FoodMeetingStatus newStatus) throws SQLException {
		PreparedStatement preparedStatement = connection.prepareStatement(UPDATE_STATUS_BY_ID_AND_USER);
		preparedStatement.setString(1, newStatus.name());
		preparedStatement.setInt(2, id);
		preparedStatement.setInt(3, idUser);
		preparedStatement.executeUpdate();
	}
	
	public List<FoodMeeting> getUnfinishedMeetings() throws SQLException {
		List<FoodMeeting> meetings = new ArrayList<>();

		PreparedStatement preparedStatement = connection.prepareStatement(SELECT_UNFINISHED_FOOD_MEETINGS_SQL);
		ResultSet resultSet = preparedStatement.executeQuery();

		while (resultSet.next()) {
			FoodMeeting meeting = new FoodMeeting(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3), 
					FoodMeetingStatus.valueOf(resultSet.getString(4)), resultSet.getTimestamp(5), resultSet.getTimestamp(6),
					resultSet.getTimestamp(7), resultSet.getTimestamp(8), resultSet.getTimestamp(9), this.userManager.getUserById(resultSet.getInt(10)));
			meetings.add(meeting);
		}

		return meetings;
	}
}
