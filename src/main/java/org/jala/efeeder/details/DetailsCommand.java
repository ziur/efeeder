package org.jala.efeeder.details;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.foodmeeting.FoodMeeting;
import org.jala.efeeder.foodmeeting.FoodMeetingManager;
import org.jala.efeeder.order.Order;
import org.jala.efeeder.order.OrderManager;
import org.jala.efeeder.suggestion.Place;
import org.jala.efeeder.user.User;

/**
 *
 * @author alexander_castro
 */
@Command
public class DetailsCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) {
		Out out = new DefaultOut();
		int idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
		Connection connection = parameters.getConnection();

		List<Order> orderList;
		try {
			orderList = getOrders(connection, idFoodMeeting);

			int idBuyer = getBuyerId(idFoodMeeting, connection);

			out.addResult("buyer", getBuyer(idBuyer, orderList));
			out.addResult("food_meeting", getFoodMeeting(connection, idFoodMeeting));
			out.addResult("orders", orderList);
			out.addResult("payment", getPayment(orderList));
			out.addResult("place", getPlace(idFoodMeeting, connection));

			return out.forward("details/details.jsp");
		} catch (Exception ex) {
			return OutBuilder.response("text/plain", ex.getMessage());
		}
	}

	private double getPayment(List<Order> orderList) {
		int res = 0;
		for (Order order : orderList) {
			res += order.getCost();
		}
		return res;
	}

	private int getBuyerId(int idFoodMeeting, Connection connection) throws Exception {

		try {
			PreparedStatement prepareStatement = connection.prepareStatement("select id_user from buyer where id_food_meeting=?");
			prepareStatement.setInt(1, idFoodMeeting);
			ResultSet resp = prepareStatement.executeQuery();

			int buyerId = 0;

			if (resp.next()) {
				buyerId = resp.getInt("id_user");
			}

			return buyerId;
		} catch (SQLException ex) {
			throw new Exception("Failed to get buyer from database : " + ex.toString());
		}

	}

	private FoodMeeting getFoodMeeting(Connection connection, int idFoodMeeting) throws Exception {
		try {
			FoodMeetingManager foodMeetingManager = new FoodMeetingManager(connection);
			return foodMeetingManager.getFoodMeetingById(idFoodMeeting);
		} catch (SQLException ex) {
			throw new Exception("Failed to get food meeting from database : " + ex.toString());
		}
	}

	private List<Order> getOrders(Connection connection, int idFoodMeeting) throws Exception {
		OrderManager orderManager = new OrderManager(connection);
		try {
			return orderManager.getOrdersWithUserByFoodMeeting(idFoodMeeting);
		} catch (SQLException ex) {
			throw new Exception("Failed to get orders from database : " + ex.toString());
		}
	}
	
	private Place getPlace(int idFoodMeeting, Connection connection) throws Exception {
		try {
			PreparedStatement prepareStatement = connection.prepareStatement("select id_place from food_meeting_user where id_food_meeting=?");
			prepareStatement.setInt(1, idFoodMeeting);
			ResultSet resp = prepareStatement.executeQuery();

			int placeId = 0;
			Place place = null; 

			if (resp.next()) {
				placeId = resp.getInt("id_place");
			}
			prepareStatement = connection.prepareStatement("select * from places where id=?");
			prepareStatement.setInt(1, placeId);
			resp = prepareStatement.executeQuery();
			
			if (resp.next()) {
				place = new Place(placeId, resp.getString("name"), resp.getString("phone"), resp.getString("direction"), resp.getString("image_link"));
			}

			return place;
		} catch (SQLException ex) {
			throw new Exception("Failed to get place from database : " + ex.toString());
		}
	}

	private User getBuyer(int buyerId, List<Order> orders) {
		for (Order order : orders) {
			User user = order.getUser();
			if (user.getId() == buyerId) {
				return user;
			}
		}

		return null;
	}
}
