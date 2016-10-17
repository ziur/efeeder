package org.jala.efeeder.foodmeeting;

import java.sql.Timestamp;
import java.util.Date;

import org.jala.efeeder.user.User;
import org.joda.time.Days;
import org.joda.time.LocalDate;

import lombok.Data;

/**
 * Created by alejandro on 09-09-16.
 */
@Data
public class FoodMeeting {
	private int id;
	private String name;
	private String imageLink;
	private String status;
	private Timestamp eventDate;
	private Timestamp votingDate;
	private Timestamp orderDate;
	private Timestamp paymentDate;
	private User userOwner;
	private Timestamp createdAt;

	public static final String DEFAULT_FOOD_MEETING_STATUS = FoodMeetingStatus.Voting.name();

	public FoodMeeting() {
	}

	public FoodMeeting(int id, String name,String imageLink, String status, Timestamp eventDate, Timestamp createdAt,
			Timestamp votingDate, Timestamp orderDate, Timestamp paymentDate, User userOwner) {
		this.id = id;
		this.name = name;
		this.createdAt = createdAt;
		this.eventDate = eventDate;
		this.votingDate = votingDate;
		this.orderDate = orderDate;
		this.paymentDate = paymentDate;
		this.imageLink = imageLink;
		this.status = status;
		this.userOwner = userOwner;
	}

	public FoodMeeting(int id, String name, String imageLink, Timestamp eventDate, User userOwner) {
		this(id, name, imageLink, DEFAULT_FOOD_MEETING_STATUS, eventDate, eventDate, eventDate, eventDate, null, userOwner);
	}

	public int getWidth() {
		LocalDate today = new LocalDate();
		LocalDate endEventDate = new LocalDate(eventDate);
		int days = Days.daysBetween(today, endEventDate).getDays();

		return calculateWidth(days);
	}
	
	public String getStatus() {
		String  status = FoodMeetingStatus.Voting.name();
		Timestamp now = new Timestamp((new Date()).getTime());
		
		if(now.before(this.votingDate)) {
			status = FoodMeetingStatus.Voting.name();
		} else if(now.before(this.orderDate)) {
			status = FoodMeetingStatus.Order.name();
		} else if(now.before(this.paymentDate)) {
			status = FoodMeetingStatus.Payment.name();
		} else if(now.before(this.eventDate))
		{
			status = FoodMeetingStatus.Buying.name();
		} else {
			status = FoodMeetingStatus.Finish.name();
		}
		
		return status;
	}

	private int calculateWidth(int days) {
		int maxWidth = 500;
		int minWidth = 200;
		int maxNumberOfDays = 6;
		int widthToSubstractPerDay = (maxWidth - minWidth) / maxNumberOfDays;
		int width;

		if(days >= maxNumberOfDays) {
			width = minWidth;
		}
		else {
			width = maxWidth - widthToSubstractPerDay * days;
		}

		return width;
	}
}
