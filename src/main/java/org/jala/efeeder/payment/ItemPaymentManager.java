/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.payment;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author alexander_castro
 */
public class ItemPaymentManager {

	private static final String SELECT_ITEMS_FROM_PAYMENT_BY_FOOD_MEETING_ID_SQL = "select * from payment where id_food_meeting=?";
	private static final String INSERT_NEW_PAYMENT_ITEM = "INSERT INTO efeeder.payment (id_food_meeting, item_description, price)	VALUES (?, ?, ?)";
	private static final String SELECT_ID_BY_FOOD_MEETING_AND_DESCRIPTION = "select id from payment where id_food_meeting=? and item_description=?";
	private static final String DELETE_PAYMENT_ITEM_BY_ID = "delete from payment where id=?";

	private final Connection connection;
	private PaymentItem paymentItem;

	public ItemPaymentManager(Connection connection) {
		this.connection = connection;
	}

	public List<PaymentItem> getPaymentItemByFoodMeeting(int foodMeetingId) throws SQLException {
		List<PaymentItem> resList = new ArrayList<>();
		PreparedStatement prepareStatement = connection.prepareStatement(SELECT_ITEMS_FROM_PAYMENT_BY_FOOD_MEETING_ID_SQL);
		prepareStatement.setInt(1, foodMeetingId);
		ResultSet res = prepareStatement.executeQuery();

		while (res.next()) {
			resList.add(new PaymentItem(res.getInt("id"), foodMeetingId, res.getString("item_description"), res.getDouble("price")));
		}

		return resList;
	}

	public void insertItemPayment(int foodMeetingId, String description, double price) throws SQLException {
		PreparedStatement prepareStatement = connection.
				prepareStatement(INSERT_NEW_PAYMENT_ITEM);
		prepareStatement.setInt(1, foodMeetingId);
		prepareStatement.setString(2, description);
		prepareStatement.setDouble(3, price);
		prepareStatement.executeUpdate();
	}

	public int selectIdByFoodMeetingAndDescription(int foodMeetingId, String description) throws SQLException {
		PreparedStatement prepareStatement = connection.prepareStatement(SELECT_ID_BY_FOOD_MEETING_AND_DESCRIPTION);
		prepareStatement.setInt(1, foodMeetingId);
		prepareStatement.setString(2, description);
		ResultSet res = prepareStatement.executeQuery();
		int itemId = 0;

		if (res.next()) {
			itemId = res.getInt("id");
		}

		return itemId;
	}

	public void deletePaymentItemById(int paymentItemId) throws SQLException {
		PreparedStatement preparedStatement = connection.prepareStatement(DELETE_PAYMENT_ITEM_BY_ID);
		preparedStatement.setInt(1, paymentItemId);
		preparedStatement.executeUpdate();
	}
}
