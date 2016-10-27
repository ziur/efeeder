package org.jala.efeeder.order;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.foodmeeting.FoodMeeting;
import org.jala.efeeder.foodmeeting.FoodMeetingManager;

/**
 *
 * @author Mirko Terrazas
 */
@Command
public class OrderCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		String idFoodMeeting = parameters.getParameter("id_food_meeting");
		int idUser = parameters.getUser().getId();
		Out out = new DefaultOut();
		Connection connection = parameters.getConnection();

		FoodMeeting foodMeeting = getFoodMeeting(connection, idFoodMeeting);
		List<Order> orders = getOrders(connection, idFoodMeeting);
		Order myOrder = extractMyOrder(idUser, orders);

		out.addResult("foodMeeting", foodMeeting);
		out.addResult("orders", orders);
		out.addResult("myOrder", myOrder);
		out.addResult("myUser", parameters.getUser());
		out.addResult("orderTime",  getOrderTime(connection, idFoodMeeting));
		out.forward("order/orders.jsp");

		return out;
	}

	private FoodMeeting getFoodMeeting(Connection connection, String idFoodMeeting) throws SQLException {
		FoodMeetingManager foodMeetingManager = new FoodMeetingManager(connection);
		return foodMeetingManager.getFoodMeetingById(Integer.parseInt(idFoodMeeting));
	}

	private Timestamp getOrderTime(Connection connection, String idFoodMeeting) throws SQLException {
		FoodMeetingManager foodMeetingManager = new FoodMeetingManager(connection);
		return foodMeetingManager.getStatusTime(Integer.parseInt(idFoodMeeting), "Order");
	}
	
	private List<Order> getOrders(Connection connection, String idFoodMeeting) throws SQLException {
		OrderManager orderManager = new OrderManager(connection);
		return orderManager.getOrdersWithUserByFoodMeeting(Integer.parseInt(idFoodMeeting));
	}

	private Order extractMyOrder(int idUser, List<Order> orders) {
		Order myOrder = null;

		for (Order order : orders) {
			if (order.getIdUser() == idUser) {
				myOrder = order;
				break;
			}
		}

		orders.remove(myOrder);
		return myOrder;
	}
}
