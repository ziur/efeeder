package org.jala.efeeder.foodmeeting;

import java.sql.Timestamp;

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
	private String status;
	private Timestamp eventDate;
	private User userOwner;
	private Timestamp createdAt;

	public static final String DEFAULT_FOOD_MEETING_STATUS = FoodMeetingStatus.Voting.name();

	public FoodMeeting() {
	}

	public FoodMeeting(int id, String name,String imageLink, String status, Timestamp eventDate, Timestamp createdAt, User userOwner) {
		this.id = id;
		this.name = name;
		this.createdAt = createdAt;
		this.eventDate = eventDate;
		this.imageLink = imageLink;
		this.status = status;
		this.userOwner = userOwner;
	}

	public FoodMeeting(int id, String name, String imageLink, Timestamp eventDate, User userOwner) {
		this(id, name, imageLink, DEFAULT_FOOD_MEETING_STATUS, eventDate, null, userOwner);
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
	
	/**
	 *
	 * @return
	 */
	public java.time.LocalDate getDate() {
		return eventDate.toLocalDateTime().toLocalDate();
	}
	
	public String getTime() {
		DateTimeFormatter fmt = DateTimeFormat.forPattern("HH:mm");
		return fmt.print(eventDate.getTime());
	}
}
