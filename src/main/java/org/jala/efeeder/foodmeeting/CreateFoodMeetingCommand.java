package org.jala.efeeder.foodmeeting;

import static java.sql.Statement.RETURN_GENERATED_KEYS;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.MessageContextUtils;
import org.jala.efeeder.servlets.websocket.avro.CreateFoodMeetingEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.servlets.websocket.avro.UserOwner;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;
import org.jala.efeeder.util.constants.WebsocketsConstants;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class CreateFoodMeetingCommand extends MockCommandUnit {

	@Override
	public Out execute(In context) throws Exception {		
		FoodMeeting foodMeeting = this.insertMeeting(context);
		UserOwner userOwner = new UserOwner(foodMeeting.getUserOwner().getId(), foodMeeting.getUserOwner().getName(), foodMeeting.getUserOwner().getLastName());
		
		List<MessageEvent> events = new ArrayList<>();
		events.add(MessageEvent.newBuilder()
			.setEvent(
				CreateFoodMeetingEvent.newBuilder()
				.setId(foodMeeting.getId())
				.setName(foodMeeting.getName())
				.setImageLink(foodMeeting.getImageLink())
				.setStatus(foodMeeting.getStatus().name())
				.setEventDate(foodMeeting.getEventDate().getTime())
				.setWidth(foodMeeting.getWidth())
				.setUserOwner(userOwner)
				.build()
			)
			.build()
		);
		MessageContext messageContext = MessageContext.newBuilder()
											.setRoom(WebsocketsConstants.homeRoom)
											.setUser(0)
											.setEvents(events)
											.build();

		return OutBuilder.response(messageContext);
	}
	
	public FoodMeeting insertMeeting(In context) throws SQLException {		
		FoodMeetingManager meetingManager = new FoodMeetingManager(context.getConnection());
		
		int userId = context.getMessageContext().getUser().intValue();
		UserManager userManager = new UserManager(context.getConnection());
		User user = userManager.getUserById(userId);
		
		CreateFoodMeetingEvent createMeetingEvent = MessageContextUtils.getEvent(context.getMessageContext(), CreateFoodMeetingEvent.class);
		
		Timestamp eventDate = new Timestamp(Long.parseLong(createMeetingEvent.getEventDate().toString()));
		
		FoodMeeting meeting = new FoodMeeting(
				0, 
				createMeetingEvent.getName().toString(),
				createMeetingEvent.getImageLink().toString(),
				eventDate,
				user
		);
		
		return meetingManager.insertMeeting(meeting);
	}
}
