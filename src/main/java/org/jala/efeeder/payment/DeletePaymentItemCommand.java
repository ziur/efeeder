package org.jala.efeeder.payment;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import static org.jala.efeeder.api.utils.JsonConverter.objectToJSON;
import org.jala.efeeder.servlets.CommandEndpoint;
import org.jala.efeeder.servlets.websocket.avro.DeleteExtraItemPayment;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;

/**
 *
 * @author alexander_castro
 */
@Command
public class DeletePaymentItemCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) {
		try {
			Connection connection = parameters.getConnection();
			int index = Integer.parseInt(parameters.getParameter("index"));
			PreparedStatement preparedStatement = connection.prepareStatement("delete from payment where id=?");
			preparedStatement.setInt(1, index);
			preparedStatement.executeUpdate();
			
//			String roomId = Integer.toString(idFoodMeeting);not nsjkadh
			String roomId = "addItem";
			List<MessageEvent> events = new ArrayList<>();
			events.add(MessageEvent.newBuilder().setEvent(
					DeleteExtraItemPayment.newBuilder()
							.setTableIndex(index)
							.build()).build());
			CommandEndpoint.getRoomManager().getRoom(roomId).sendMessage(
					MessageContext.newBuilder().setUser(0).setRoom(roomId).setEvents(events).build());
		}
		catch (Exception e) {
			return OutBuilder.response("application/json", objectToJSON(e.toString()));
		}
		
		return OutBuilder.response("text/plain", "correctly!!");
	}
	
}
