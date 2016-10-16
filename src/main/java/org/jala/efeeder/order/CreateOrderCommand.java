package org.jala.efeeder.order;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

import java.sql.*;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class CreateOrderCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();
		saveOrder(parameters);

		return out.redirect("action/order?id_food_meeting=" + parameters.getParameter("id_food_meeting"));
	}

	private void saveOrder(In parameters) throws SQLException {
		int idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
		int idUser = parameters.getUser().getId();
		String details = parameters.getParameter("details");
		double cost = Double.parseDouble(parameters.getParameter("cost"));
		Connection connection = parameters.getConnection();

		OrderManager orderManager = new OrderManager(connection);
		Order myOrder = orderManager.getMyOrder(idUser, idFoodMeeting);
		if (myOrder == null) {
			orderManager.insertOrder(idFoodMeeting, idUser, details, cost);
		} else {
			orderManager.updateOrder(idFoodMeeting, idUser, details, cost);
		}
	}
}
