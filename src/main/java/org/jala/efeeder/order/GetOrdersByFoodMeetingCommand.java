package org.jala.efeeder.order;

import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;

/**
 *
 * @author Amir
 */
@Command
public class GetOrdersByFoodMeetingCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		int idFoodMeeting = Integer.parseInt(parameters.getParameter("idFoodMeeting"));
		int idUser = parameters.getUser().getId();
		
		OrderManager orderManager = new OrderManager(parameters.getConnection());
		List<Order> orders = orderManager.getOrdersWithUserByFoodMeeting(idFoodMeeting);
		extractMyOrder(orders, idUser);
		
		return OutBuilder.response("application/json", JsonConverter.objectToJSON(orders));
	}
	
	private void extractMyOrder(List<Order> orders, int idUser) {
		for (Order order : orders) {
			if (order.getIdUser() == idUser) {
				orders.remove(order);
				break;
			}
		}
	}
}
