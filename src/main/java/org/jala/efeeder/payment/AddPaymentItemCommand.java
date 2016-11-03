package org.jala.efeeder.payment;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import static org.jala.efeeder.api.utils.JsonConverter.objectToJSON;
import org.jala.efeeder.servlets.CommandEndpoint;
import org.jala.efeeder.servlets.websocket.avro.CreateExtraItemPayment;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;

/**
 *
 * @author alexander_castro
 */
@Command
public class AddPaymentItemCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		String itemDescription = parameters.getParameter("item_description");
		double itemPrice = Double.parseDouble(parameters.getParameter("item_price"));
		int idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
		Connection connection = parameters.getConnection();
		
		PreparedStatement prepareStatement = connection.
				prepareStatement("INSERT INTO efeeder.payment (id_food_meeting, item_description, price)	VALUES (?, ?, ?)");
		prepareStatement.setInt(1, idFoodMeeting);
		prepareStatement.setString(2, itemDescription);
		prepareStatement.setDouble(3, itemPrice);
		prepareStatement.executeUpdate();
		
		prepareStatement = connection.prepareStatement("select id from payment where id_food_meeting=? and item_description=?");
		prepareStatement.setInt(1, idFoodMeeting);
		prepareStatement.setString(2, itemDescription);
		ResultSet res = prepareStatement.executeQuery();
		int itemId = 0;
		
		if(res.next()){
			itemId = res.getInt("id");
		}
		
		try {
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
		}
		catch (Exception e) {
			return OutBuilder.response("application/json", objectToJSON(e.toString()));
		}
		
		return OutBuilder.response("application/json", objectToJSON("Command complite"));
	}
	
}
