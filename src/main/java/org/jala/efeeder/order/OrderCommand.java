package org.jala.efeeder.order;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

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

		List<Order> orders = getOrders(connection, idFoodMeeting);
		Order myOrder = extractMyOrder(idUser, orders);

		out.addResult("idFoodMeeting", idFoodMeeting);
		out.addResult("orders", orders);
		out.addResult("myOrder", myOrder);
		out.addResult("myUser", parameters.getUser());
		out.forward("order/orders.jsp");

		return out;
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
