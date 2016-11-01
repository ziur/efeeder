/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.foodmeeting;

import java.sql.SQLException;
import java.sql.Timestamp;
import org.apache.log4j.Logger;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.servlets.StartUpServlet;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

/**
 *
 * @author Danitza Machicado
 */
@Command
public class EditFoodMeetingCommand implements CommandUnit {
	private final static Logger logger = Logger.getLogger(StartUpServlet.class);

	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();
		
		FoodMeetingManager meetingManager = new FoodMeetingManager(parameters.getConnection());
		FoodMeeting meeting = meetingManager.getFoodMeetingById(Integer.valueOf(parameters.getParameter("id-food-meeting")));				

		DateTimeFormatter formatter = DateTimeFormat.forPattern("dd MMMM, yyyy HH:mm");
		DateTime dateTime = formatter.parseDateTime(parameters.getParameter("date") + " " + parameters.getParameter("time"));
		Timestamp eventDate = new Timestamp(dateTime.getMillis());
		Timestamp votingDate = new Timestamp(Long.parseLong(parameters.getParameter("voting-date")));
		Timestamp orderDate = new Timestamp(Long.parseLong(parameters.getParameter("order-date")));
		Timestamp paymentDate = new Timestamp(Long.parseLong(parameters.getParameter("payment-date")));
		
		meeting.setName(parameters.getParameter("meeting_name"));
		meeting.setImageLink(parameters.getParameter("image_link"));
		meeting.setEventDate(eventDate);
		meeting.setVotingDate(votingDate);
		meeting.setOrderDate(orderDate);
		meeting.setPaymentDate(paymentDate);
		
		try {
			meetingManager.updateFoodMeeting(meeting);				
		} catch (SQLException ex) {
			logger.error("Error when updating meeting with id: " + meeting.getId(), ex);
		}
		
		return out.redirect("/action/FoodMeeting");
	}
}
