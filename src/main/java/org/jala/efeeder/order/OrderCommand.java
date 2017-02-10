package org.jala.efeeder.order;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.jala.efeeder.api.command.AbstractCommandUnit;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.DisplayBean;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.foodmeeting.FoodMeeting;
import org.jala.efeeder.foodmeeting.FoodMeetingManager;
import org.jala.efeeder.places.Place;
import org.jala.efeeder.places.PlaceManager;

/**
 *
 * @author Mirko Terrazas
 * @author Patricia Escalera
 */
@Command
public class OrderCommand extends AbstractCommandUnit {
	
	@Override
	public boolean checkParameters(){
		return true;
	}
	
	@Override
	public Out execute() throws Exception {
		String idFoodMeeting = parameters.getParameter("id_food_meeting");
		Out out = new DefaultOut();
		Connection connection = parameters.getConnection();
		OrdersDisplayBean displayBean= new OrdersDisplayBean();

		FoodMeeting foodMeeting = getFoodMeeting(connection, idFoodMeeting);
		Place placeSelected = getPlaceSelect(connection, foodMeeting);
		List<Order> orders = getOrders(connection, idFoodMeeting);
		
		displayBean.setFoodMeeting(foodMeeting);
		displayBean.setPlace(placeSelected);
		displayBean.setOrders(orders);
		displayBean.setOrderTime(getOrderTime(connection, idFoodMeeting));
		displayBean.setMyUser(parameters.getUser());
		
		out.addResult(DisplayBean.DISPLAY_BEAN_ATTRIBUTE, displayBean);
		
		out.forward("order/orders.jsp");

		return out;
	}

	private FoodMeeting getFoodMeeting(Connection connection, String idFoodMeeting) throws SQLException {
		FoodMeetingManager foodMeetingManager = new FoodMeetingManager(connection);
		return foodMeetingManager.getFoodMeetingById(Integer.parseInt(idFoodMeeting));
	}

	private Timestamp getOrderTime(Connection connection, String idFoodMeeting) throws SQLException {
		FoodMeetingManager foodMeetingManager = new FoodMeetingManager(connection);
		return foodMeetingManager.getFoodMeetingById(Integer.parseInt(idFoodMeeting)).getOrderDate();
	}
	
	private List<Order> getOrders(Connection connection, String idFoodMeeting) throws SQLException {
		OrderManager orderManager = new OrderManager(connection);
		return orderManager.getOrdersWithUserByFoodMeeting(Integer.parseInt(idFoodMeeting));
	}
	
	private Place getPlaceSelect(Connection connection, FoodMeeting foodMeeting) throws SQLException {
		PlaceManager placeManager = new PlaceManager(connection);
		return placeManager.getPlaceByFoodMeeting(foodMeeting);
	}

	
}
