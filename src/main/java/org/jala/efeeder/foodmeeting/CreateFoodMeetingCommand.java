package org.jala.efeeder.foodmeeting;

import static java.sql.Statement.RETURN_GENERATED_KEYS;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.servlets.websocket.avro.CreateFoodMeetingEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.servlets.websocket.avro.UserOwner;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class CreateFoodMeetingCommand implements CommandUnit {

	private static final String INSERT_FOOD_MEETING_SQL = "insert into food_meeting(name,image_link, event_date, id_user, created_at, voting_time, order_time, payment_time) "
            + "values(?, ?, ?, ?, ?, ?, ?, ?)";
	private static final String createMeetingRoomId = "createMeetingRoomId";

	@Override
	public Out execute(In context) throws Exception {
		PreparedStatement stm = context.getConnection()
										.prepareStatement(INSERT_FOOD_MEETING_SQL, RETURN_GENERATED_KEYS);

		List<MessageEvent> messages = context.getMessageContext().getEvents();
		int userId = context.getMessageContext().getUser().intValue();

		CreateFoodMeetingEvent createMeetingEvent = (CreateFoodMeetingEvent)messages.get(0).getEvent();

		Timestamp eventDate = new Timestamp(Long.parseLong(createMeetingEvent.getEventDate().toString()));
		Timestamp createdAt = new Timestamp(System.currentTimeMillis());

		stm.setString(1, createMeetingEvent.getName().toString());
		stm.setString(2, createMeetingEvent.getImageLink().toString());
		stm.setTimestamp(3, eventDate);
		stm.setInt(4, userId);
		stm.setTimestamp(5, createdAt);
		stm.setTimestamp(6, eventDate);
		stm.setTimestamp(7, eventDate);
		stm.setTimestamp(8, eventDate);

		stm.executeUpdate();

		ResultSet generatedKeysResultSet = stm.getGeneratedKeys();
		generatedKeysResultSet.next();
		int meetingId = generatedKeysResultSet.getInt(1);
		stm.close();

		UserManager userManager = new UserManager(context.getConnection());

		User user = userManager.getUserById(userId);

		FoodMeeting foodMeeting = new FoodMeeting(meetingId, createMeetingEvent.getName().toString(),
			createMeetingEvent.getImageLink().toString(), eventDate, user
			);

		List<MessageEvent> events = new ArrayList<>();

		UserOwner userOwner = new UserOwner(user.getName(), user.getLastName());

		events.add(MessageEvent.newBuilder()
			.setEvent(
				CreateFoodMeetingEvent.newBuilder()
				.setId(foodMeeting.getId())
				.setName(foodMeeting.getName())
				.setImageLink(foodMeeting.getImageLink())
				.setStatus(foodMeeting.getStatus())
				.setEventDate(foodMeeting.getEventDate().getTime())
				.setWidth(foodMeeting.getWidth())
				.setUserOwner(userOwner)
				.build()
			)
			.build()
		);
		MessageContext messageContext = MessageContext.newBuilder()
											.setRoom(createMeetingRoomId)
											.setUser(0)
											.setEvents(events)
											.build();

		return OutBuilder.response(messageContext);
	}
}
