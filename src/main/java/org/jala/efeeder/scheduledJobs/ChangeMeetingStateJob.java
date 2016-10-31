package org.jala.efeeder.scheduledJobs;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jala.efeeder.api.database.DatabaseManager;
import org.jala.efeeder.foodmeeting.FoodMeeting;
import org.jala.efeeder.foodmeeting.FoodMeetingManager;
import org.jala.efeeder.foodmeeting.FoodMeetingStatus;
import org.jala.efeeder.servlets.CommandEndpoint;
import org.jala.efeeder.servlets.websocket.avro.ChangeFoodMeetingStatusEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageContext.Builder;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.util.DateFormatter;
import org.jala.efeeder.util.constants.WebsocketsConstants;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

/**
 *
 * @author Mirko Terrazas
 */
public class ChangeMeetingStateJob implements org.quartz.Job {
	
	private final FoodMeetingManager meetingManager;
	
	public ChangeMeetingStateJob() {
		DatabaseManager databaseManager = new DatabaseManager();
		Connection connection = databaseManager.getConnection();
		meetingManager = new FoodMeetingManager(connection);
	}

	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		Logger.getLogger(ChangeMeetingStateJob.class.getName())
				.log(Level.INFO, "Executing meeting states check at " + 
				DateFormatter.format(context.getScheduledFireTime()) + "...");
		try {		
 			List<FoodMeeting> unfinishedMeetings = this.meetingManager.getUnfinishedMeetings();
			
			unfinishedMeetings.forEach(meeting -> {
				FoodMeetingStatus newStatus = meeting.getStatusByTime(new Timestamp(context.getScheduledFireTime().getTime()));
				
				if(newStatus.compareTo(meeting.getStatus()) > 0) {				
					this.setNewStatus(meeting, newStatus);
				}
			});			
		} catch (SQLException ex) {
			Logger.getLogger(ChangeMeetingStateJob.class.getName()).log(Level.SEVERE, null, ex);
		}							
	}	

	private void setNewStatus(FoodMeeting meeting, FoodMeetingStatus newStatus) {		
		try {
			this.meetingManager.setStatusById(meeting.getId(), meeting.getUserOwner().getId(), newStatus);
		} catch (SQLException ex) {	
			Logger.getLogger(ChangeMeetingStateJob.class.getName()).log(Level.SEVERE, null, ex);
		}		

		meeting.setStatus(newStatus);
		this.notifyClients(meeting);	
		Logger.getLogger(ChangeMeetingStateJob.class.getName()).log(Level.INFO, 
				"Updating meeting: " + meeting.getId() + " to status: " + newStatus.name());	
	}
	
	private void notifyClients(FoodMeeting meeting) {
		String roomId = this.getRoomIdToNotify(meeting);
		String homeRoomId = WebsocketsConstants.homeRoom;
		
		ChangeFoodMeetingStatusEvent changeStatusEvent = 
				new ChangeFoodMeetingStatusEvent(meeting.getId(), 
						meeting.getUserOwner().getId(), meeting.getStatus().name());

		List<MessageEvent> events = new ArrayList<>();
		events.add(new MessageEvent(changeStatusEvent));
		
		Builder messageBuilder = MessageContext.newBuilder().setUser(meeting.getUserOwner().getId())
					.setEvents(events);
		
		CommandEndpoint.sendMessage(messageBuilder.setRoom(roomId).build());
		CommandEndpoint.sendMessage(messageBuilder.setRoom(homeRoomId).build());	
	}
	
	private String getRoomIdToNotify(FoodMeeting meeting) {
		String meetingId = Integer.toString(meeting.getId());
		String roomId = meetingId;
				
		switch (meeting.getStatus()) {
			case Order:
				roomId = WebsocketsConstants.voteRoomPrefix + meetingId;
				break;						
		}
		
		return roomId;		
	}
}
