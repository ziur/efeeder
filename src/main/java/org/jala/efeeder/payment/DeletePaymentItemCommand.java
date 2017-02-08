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
import org.jala.efeeder.servlets.websocket.avro.DeleteExtraItemPayment;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;

import static org.jala.efeeder.api.utils.JsonConverter.objectToJSON;

/**
 *
 * @author alexander_castro
 */
@Command
public class DeletePaymentItemCommand extends MockCommandUnit {

	@Override
	public Out execute(In parameters) {
		try {
			Connection connection = parameters.getConnection();
			int index = Integer.parseInt(parameters.getParameter("index"));
			ItemPaymentManager itemManager = new ItemPaymentManager(connection);

			itemManager.deletePaymentItemById(index);

			String roomId = "addItem";
			List<MessageEvent> events = new ArrayList<>();
			events.add(MessageEvent.newBuilder().setEvent(
					DeleteExtraItemPayment.newBuilder()
					.setTableIndex(index)
					.build()).build());
			CommandEndpoint.getRoomManager().getRoom(roomId).sendMessage(
					MessageContext.newBuilder().setUser(0).setRoom(roomId).setEvents(events).build());
		} catch (NumberFormatException | SQLException e) {
			return OutBuilder.response("application/json", objectToJSON(e.toString()));
		}

		return OutBuilder.response("text/plain", "correctly!!");
	}

}
