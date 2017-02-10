package org.jala.efeeder.payment;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.servlets.CommandEndpoint;
import org.jala.efeeder.servlets.websocket.avro.CreateExtraItemPayment;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;

import static org.jala.efeeder.api.utils.JsonConverter.objectToJSON;

/**
 *
 * @author alexander_castro
 */
@Command
public class AddPaymentItemCommand extends MockCommandUnit{

	@Override
	public Out execute() {
		try {
			String itemDescription = parameters.getParameter("item_description");
			double itemPrice = Double.parseDouble(parameters.getParameter("item_price"));
			int idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
			Connection connection = parameters.getConnection();
			ItemPaymentManager itemManger = new ItemPaymentManager(connection);

			itemManger.insertItemPayment(idFoodMeeting, itemDescription, itemPrice);
			int itemId = itemManger.selectIdByFoodMeetingAndDescription(idFoodMeeting, itemDescription);

			String roomId = "addItem";
			List<MessageEvent> events = new ArrayList<>();
			events.add(MessageEvent.newBuilder().setEvent(
					CreateExtraItemPayment.newBuilder()
					.setItemId(itemId)
					.setItemDescription(itemDescription)
					.setItemPrice(itemPrice)
					.setStatus("add")
					.build()).build());
			CommandEndpoint.getRoomManager().getRoom(roomId).sendMessage(
					MessageContext.newBuilder().setUser(0).setRoom(roomId).setEvents(events).build());
		} catch (NumberFormatException | SQLException e) {
			return OutBuilder.response("application/json", objectToJSON(e.toString()));
		}

		return OutBuilder.response("application/json", objectToJSON("Command executed"));

	}

}
