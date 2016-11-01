package org.jala.efeeder.foodmeeting;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.jala.efeeder.user.UserManager;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

public class FoodMeetingManager {

	private static final String SELECT_BY_ID_FOOD_MEETING = "SELECT id, name, image_link, status, event_date, created_at, "
			+ "voting_time, order_time, payment_time, id_user FROM food_meeting WHERE id=?";
	private static final String SELECT_UNFINISHED_FOOD_MEETINGS_SQL = "Select id, name, image_link, status, event_date, "
			+ "created_at, voting_time, order_time, payment_time, id_user "
			+ "from food_meeting where status != 'Finish' order by event_date";	
	private static final String UPDATE_STATUS_BY_ID_AND_USER = "UPDATE food_meeting SET status=? WHERE id=? AND id_user=?";
	private static final String UPDATE_FOOD_MEETING_SQL = "UPDATE food_meeting SET name= ?, image_link= ?, event_date=?, "
			+ "voting_time=?, order_time=?, payment_time=? WHERE id= ?;";
	private static final String SELECT_BY_USER_ID = "SELECT fm.id, fm.name, fm.image_link, fm.status, fm.event_date, fm.id_user " +
			"FROM food_meeting fm, food_meeting_user fmu " +
			"WHERE fmu.id_user = ? and fm.id = fmu.id_food_meeting " +
			"ORDER BY CASE WHEN fm.status = 'Payment' THEN 1 WHEN fm.status = 'Finish' THEN 3 ELSE 2 END, fm.event_date DESC";

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

	public List<FoodMeeting> getFoodMeetingByUser(int userId) throws SQLException {
		List<FoodMeeting> meetings = new ArrayList<>();
		FoodMeeting foodMeeting = null;

		PreparedStatement preparedStatement = connection.prepareStatement(SELECT_BY_USER_ID);
		preparedStatement.setInt(1, userId);
		ResultSet resultSet = preparedStatement.executeQuery();

		UserManager userManager = new UserManager(connection);

		while (resultSet.next()) {
			foodMeeting = new FoodMeeting(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3),
					FoodMeetingStatus.valueOf(resultSet.getString(4)), resultSet.getTimestamp(5),
					userManager.getUserById(resultSet.getInt(6)));
			meetings.add(foodMeeting);
		}

		return meetings;
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

	public void updateFoodMeeting(FoodMeeting meeting) throws SQLException {
		PreparedStatement stm = connection.prepareStatement(UPDATE_FOOD_MEETING_SQL);

		stm.setString(1, meeting.getName());
		stm.setString(2, meeting.getImageLink());
		stm.setTimestamp(3, meeting.getEventDate());
		stm.setTimestamp(4, meeting.getVotingDate());
		stm.setTimestamp(5, meeting.getOrderDate());
		stm.setTimestamp(6, meeting.getPaymentDate());
		stm.setInt(7, meeting.getId());
		stm.executeUpdate();
	}
}
