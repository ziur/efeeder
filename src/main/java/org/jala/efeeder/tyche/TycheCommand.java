/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.tyche;

import java.util.Random;
import java.security.SecureRandom;
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
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.api.utils.JsonConverter;
import org.jala.efeeder.places.Place;
import org.jala.efeeder.servlets.CommandEndpoint;
import org.jala.efeeder.servlets.websocket.avro.DrawLotsEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.suggestion.Feast;
import static org.jala.efeeder.tyche.SetBuyerCommand.getBuyer;

/**
 * Displays who is winning the privilege to buy the food and allows the winner
 * to accept his fate and become the buyer.
 * @author 0x3
 */
@Command
public class TycheCommand implements CommandUnit{

	private static final String GET_DRAWN_LOTS_SQL =
			"SELECT user.id, user.name, user.last_name, buyer.dice FROM buyer, user WHERE buyer.id_food_meeting = ? AND buyer.id_user = user.id";
	private static final String GET_WINNER_PLACE_SQL=
			"SELECT places.id,places.name,places.description,places.phone,places.direction,places.image_link FROM food_meeting,places WHERE food_meeting.id=? AND food_meeting.id_place=places.id";
	private static final String SELECT_FOOD_MEETING_SQL =
			"SELECT food_meeting.id_user, user.name, user.last_name, food_meeting.name, food_meeting.image_link, event_date, voting_time, order_time, payment_time FROM food_meeting, user WHERE food_meeting.id_user=user.id AND food_meeting.id=? AND status='Order'";

	private static final String GET_BUYER_DICE =
			"SELECT dice FROM buyer WHERE buyer.id_food_meeting = ? AND buyer.id_user = ?";
	private static final String GET_USER_NAME =
			"SELECT name, last_name FROM user WHERE id = ?";
	private static final String SET_BUYER_DICE =
			"INSERT INTO buyer(id_food_meeting, id_user, dice) VALUES(?, ?, ?)";

	static SecureRandom secureRandom = new SecureRandom();
	
	static Random rand = new Random();
	
	static String getBuyerDice(int feastId, int userId, Connection connection, int[] diceResult, String[] nameResult) {
		diceResult[0] = -1;
		nameResult[0] = "";
		nameResult[1] = "";
		try {
			PreparedStatement stm = connection.prepareStatement(GET_BUYER_DICE);
			stm.setInt(1, feastId);
			stm.setInt(2, userId);
			ResultSet rs = stm.executeQuery();
			if (rs.next()) {
				diceResult[0] = rs.getInt(1);
			}
			stm = connection.prepareStatement(GET_USER_NAME);
			stm.setInt(1, userId);
			rs = stm.executeQuery();
			if (rs.next()) {
				nameResult[0] = rs.getString(1);
				nameResult[1] = rs.getString(2);
			}
		}
		catch (Exception e) {
			return "Failed to get buyer dice: " + e.toString();
		}
		return null;
	}

	static String updateBuyer(int feastId, int userId, int dice, Connection connection) {
		try {
			PreparedStatement stm = connection.prepareStatement(SET_BUYER_DICE);
			stm.setInt(1, feastId);
			stm.setInt(2, userId);
			stm.setInt(3, dice);
			stm.executeUpdate();
		}
		catch (Exception e) {
			return "Failed to update buyer dice: " + e.toString();
		}
		return null;
	}
	

	public static String drawLot(int feastId, int userId, Connection connection) throws Exception {
		boolean broadcast = false;
		int dice = -1;
		String name = "";
		String lastName = "";
		int[] diceResult = new int[1];
		String[] nameResult = new String[2];
		String error = getBuyerDice(feastId, userId, connection, diceResult, nameResult);
		if (error == null)
		{
			name = nameResult[0];
			lastName = nameResult[1];
			dice = diceResult[0];
			if (dice == -1)
			{
				//dice = 1 + (int)Math.floor(secureRandom.nextDouble() * Integer.MAX_VALUE);
				dice = rand.nextInt((999999999 - 100000000) + 1) + 1;
				error = updateBuyer(feastId, userId, dice, connection);
				broadcast = true;
			}
		}

		if (error != null) {
			return error;
		}
		
		if (!broadcast) {
			return null;
		}

		try {
			String roomId = Integer.toString(feastId);
			List<MessageEvent> events = new ArrayList<>();
			events.add(MessageEvent.newBuilder().setEvent(
					DrawLotsEvent.newBuilder().
							setUserId(userId).
							setName(name).
							setLastName(lastName).
							setDice(dice).
					build()).build());

			MessageContext.Builder messageBuilder = MessageContext.newBuilder().setUser(0).setEvents(events);
			CommandEndpoint.sendMessage(messageBuilder.setRoom(roomId).build());
		}
		catch (Exception e) {
			return "Failed to broadcast draw lot : " + e.toString();
		}
		return null;
	}

	public static String concatenate(String name, String lastName){
		String result = name;
		if (result.length() > 0 && lastName.length() > 0) result += " "; 
		return result + lastName;
	}

	public static String getDrawnLots(int feastId, Connection connection){
		List<DrawnLot> drawnLots = new ArrayList<>();
		try {
			PreparedStatement stm = connection.prepareStatement(GET_DRAWN_LOTS_SQL);
			stm.setInt(1, feastId);
			ResultSet resultSet = stm.executeQuery();
			while (resultSet.next()) {
				drawnLots.add(new DrawnLot(
						resultSet.getInt(1),
						resultSet.getString(2),
						resultSet.getString(3),
						resultSet.getInt(4)));
			}
		}
		catch (Exception e) {
			System.err.println(e);
		}
		return JsonConverter.objectToJSON(drawnLots);
	}

	public static String getWinnerPlaceAsString(int feastId, Connection connection){
		Place place = null;
		try {
			PreparedStatement ps = connection.prepareStatement(GET_WINNER_PLACE_SQL);
			ps.setInt(1, feastId);
			ResultSet resSet = ps.executeQuery();
			if(resSet.next()) {
				place = new Place(resSet.getInt("places.id"), 
						resSet.getString("places.name"), 
						resSet.getString("places.description"), 
						resSet.getString("places.phone"),
						resSet.getString("places.direction"),
						resSet.getString("places.image_link"));
			}
		} catch (Exception e) {
			System.err.println(e);
		}
		return JsonConverter.objectToJSON(place);
	}
	
	static public String getFeastAsString(int feastId, Connection connection) throws Exception {
		PreparedStatement ps = connection.prepareStatement(SELECT_FOOD_MEETING_SQL);
		ps.setInt(1, feastId);
		ResultSet resSet = ps.executeQuery();
		if(resSet.next()){
			return JsonConverter.objectToJSON(new Feast(
					resSet.getInt("food_meeting.id_user"),
					concatenate(resSet.getString("user.name"),
							resSet.getString("user.last_name")),
					resSet.getString("food_meeting.name"),
					resSet.getString("food_meeting.image_link"),
					resSet.getTimestamp("event_date"),
					resSet.getTimestamp("voting_time"),
					resSet.getTimestamp("order_time"),
					resSet.getTimestamp("payment_time")));
		}
		return "";
	}

	@Override
	public Out execute(In parameters) throws Exception {
		int userId = parameters.getUser().getId();
		Connection connection = parameters.getConnection();
		String error = null;

		int feastId = 0;
		try {
			feastId	= Integer.parseInt(parameters.getParameter("id_food_meeting"));
		} catch (Exception e) {
			error = "Invalid id_food_meeting.";
		}

		int buyerId = getBuyer(feastId, connection);
		if (buyerId == -1) {
			error = "Failed to get buyer id for feast id: " + feastId;
		}

		if (buyerId == 0){
			error = drawLot(feastId, userId, connection);
		}

		if (error != null) {
			return OutBuilder.response("text/plain", error);
		}

		Out out = new DefaultOut();
		out.addResult("feastId", feastId);
		out.addResult("buyerId", buyerId);
		out.addResult("placeJson", getWinnerPlaceAsString(feastId, connection));
		out.addResult("feastJson", getFeastAsString(feastId, connection));
		out.addResult("drawnLotsJson", getDrawnLots(feastId, connection));
		return out.forward("tyche/tyche.jsp");
	}
}
