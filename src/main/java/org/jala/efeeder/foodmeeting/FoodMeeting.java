package org.jala.efeeder.foodmeeting;

import java.sql.Timestamp;

import org.jala.efeeder.places.Place;
import org.jala.efeeder.user.User;
import org.joda.time.Days;
import org.joda.time.LocalDate;

import lombok.Data;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

/**
 * Created by alejandro on 09-09-16.
 */
@Data
public class FoodMeeting {
	private int id;
	private String name;
	private String imageLink;
	private FoodMeetingStatus status;
	private Timestamp eventDate;
	private Timestamp votingDate;
	private Timestamp orderDate;
	private Timestamp paymentDate;
	private User userOwner;
	private Place place;
	private Timestamp createdAt;

	public FoodMeeting() {
	}

	public FoodMeeting(int id, String name,String imageLink, FoodMeetingStatus status, Timestamp eventDate, Timestamp createdAt,
			Timestamp votingDate, Timestamp orderDate, Timestamp paymentDate, User userOwner) {
		this.id = id;
		this.name = name;
		this.createdAt = createdAt;
		this.eventDate = eventDate;
		this.votingDate = votingDate;
		this.orderDate = orderDate;
		this.paymentDate = paymentDate;
		this.status = status;
		this.imageLink = imageLink;
		this.userOwner = userOwner;
	}

	public FoodMeeting(int id, String name, String imageLink, Timestamp eventDate, User userOwner) {
		this(id, name, imageLink, FoodMeetingStatus.Voting, eventDate, eventDate, eventDate, eventDate, null, userOwner);
	}

	public int getWidth() {
		LocalDate today = new LocalDate();
		LocalDate endEventDate = new LocalDate(eventDate);
		int days = Days.daysBetween(today, endEventDate).getDays();
		return calculateWidth(days);
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
	
	public java.time.LocalDate getDate() {
		return eventDate.toLocalDateTime().toLocalDate();
	}
	
	public String getTime() {
		DateTimeFormatter fmt = DateTimeFormat.forPattern("HH:mm");
		return fmt.print(eventDate.getTime());
	}
}
