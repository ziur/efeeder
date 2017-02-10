/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.tyche;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.servlets.websocket.avro.SetBuyerEvent;

/**
 *
 * @author 0x3
 */
@Command
public class SetBuyerCommand extends MockCommandUnit {

	private static final String GET_BUYER =
			"SELECT id_buyer FROM food_meeting WHERE id = ?";

	private static final String SET_BUYER =
			"UPDATE food_meeting SET id_buyer = ?, status = 'Payment' WHERE id = ?";

	static int getBuyer(int feastId, Connection connection) {
		try {
			PreparedStatement stm = connection.prepareStatement(GET_BUYER);
			stm.setInt(1, feastId);
			ResultSet resultSet = stm.executeQuery();
			if (resultSet.next()) {
				return resultSet.getInt(1);
			}
		}
		catch (Exception e) {
			return -1;
		}
		return 0;
	}
	
	static String updateBuyer(int feastId, int userId, Connection connection) {
		try {
			int buyerId = getBuyer(feastId, connection);
			if (buyerId > 0) {
				return "Buyer for feast id: " + feastId + " already set to user id: " + buyerId;
			}
			if (buyerId == -1) {
				return "Failed to get buyer id for feast id: " + feastId;
			}
			PreparedStatement stm = connection.prepareStatement(SET_BUYER);
			stm.setInt(1, userId);
			stm.setInt(2, feastId);
			stm.executeUpdate();
		}
		catch (Exception e) {
			return "Failed to update Buyer: " + e.toString();
		}
		return null;
	}

	@Override
	public Out execute() throws Exception {
		String error = null;
		int userId = parameters.getUser().getId();
		Connection connection = parameters.getConnection();
		MessageContext context = parameters.getMessageContext();
		String roomId = context.getRoom();
		int feastId = 0;

		try {
			feastId	= Integer.parseInt(roomId);
		} catch (Exception e) {
			error = "Room id is not a feast id: " + e.toString();
		}

		List<MessageEvent> messages = context.getEvents();
		
		if (error == null) {
			if (!(messages.get(0).getEvent() instanceof SetBuyerEvent)) {
				error = "Not a SetBuyerEvent.";
			}
		}

		if (error == null) {
			error = updateBuyer(feastId, userId, connection);
		}

		if (error != null) {
			return OutBuilder.response("text/plain", error);
		}

		List<MessageEvent> events = new ArrayList<>();
		events.add(MessageEvent.newBuilder().setEvent(
				SetBuyerEvent.newBuilder().
						setUserId(userId).
				build()).build());

		MessageContext messageContext = MessageContext.newBuilder().setUser(0).
				setRoom(roomId).setEvents(events).build();

		return OutBuilder.response(messageContext);
	}
}
