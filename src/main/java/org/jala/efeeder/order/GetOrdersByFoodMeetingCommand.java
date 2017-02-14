package org.jala.efeeder.order;

import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.command.PageCommand;
import org.jala.efeeder.api.utils.JsonConverter;

/**
 *
 * @author Amir
 */
@Command
public class GetOrdersByFoodMeetingCommand extends PageCommand{
	
	public boolean initialize(){
		super.initialize();
		this.idFoodMeeting = this.inUtils.getIntegerParameter("idFoodMeeting");
		return true;
	}

	@Override
	public Out execute() throws Exception {
		//int idFoodMeeting = Integer.parseInt(parameters.getParameter("idFoodMeeting"));
		int idFoodMeeting = this.idFoodMeeting;
		OrderManager orderManager = new OrderManager(parameters.getConnection());
		List<Order> orders = orderManager.getOrdersWithUserByFoodMeeting(idFoodMeeting);

		return OutBuilder.response("application/json", JsonConverter.objectToJSON(orders));
	}

	@Override
	public boolean checkParameters() {
		if (this.idFoodMeeting <= 0) {
			return false;
		}
		return true;
	}
}
