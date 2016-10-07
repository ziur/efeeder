/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.wheel;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.jala.efeeder.api.command.*;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.servlets.websocket.avro.RaffleEvent;
import org.jala.efeeder.user.User;


/**
 * @author alexander_castro
 */
@Command
public class WheeldecideCommand implements CommandUnit{

	public static final String SELECT_USERS_BY_MEETING_SQL =
			"select id,name from user u, orders o where o.id_food_meeting = ? and u.id = o.id_user";

	@Override
	public Out execute(In context) throws Exception {    
		String roomId = context.getMessageContext().getRoom().toString();
		int choseIndex = 0;
		PreparedStatement pStatement = context.getConnection()
				.prepareStatement(SELECT_USERS_BY_MEETING_SQL);

		pStatement.setInt(1, Integer.parseInt(roomId));

		ResultSet resultSet = pStatement.executeQuery();

		List<User> users = new ArrayList<>();
		while (resultSet.next()) {
			int idUser = resultSet.getInt(1);
			String nameUser = resultSet.getString(2);
			users.add(new User(idUser, nameUser));
		}
		Collections.shuffle(users);
		choseIndex = getRandomIndexPerson(users.size());

		//insertNewBuyer(context, users.get(choseIndex).getId());

		List<MessageEvent> events = new ArrayList<>();

		events.add(MessageEvent.newBuilder()
				.setEvent(
						RaffleEvent.newBuilder()
									.setChosen(choseIndex)
									.setItems(users.stream().map(user -> user.getName()).collect(Collectors.toList()))
									.build()
				)
				.build()
		);
		MessageContext messageContext = MessageContext.newBuilder()
											.setRoom(roomId)
											.setUser(0)
											.setEvents(events)
											.build();

		return OutBuilder.response(messageContext);
	}

	private static int insertNewBuyer(In context, int choseUserId) throws Exception{
		PreparedStatement stm = context.getConnection()
										.prepareStatement("insert into buyer(id_food_meeting, id_user) values(?, ?)");

		String roomId = context.getMessageContext().getRoom().toString();
		stm.setInt(1, Integer.parseInt(roomId));
		stm.setInt(2, choseUserId);
		return stm.executeUpdate();
	}


	private static int getRandomIndexPerson(int numberOfPersons){
		return (int)Math.floor(Math.random() * numberOfPersons);
	}
}
