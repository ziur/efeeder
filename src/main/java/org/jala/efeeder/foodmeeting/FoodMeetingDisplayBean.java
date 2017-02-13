package org.jala.efeeder.foodmeeting;

import java.sql.Timestamp;

import org.jala.efeeder.api.command.DisplayBean;
import org.jala.efeeder.user.User;

import lombok.Getter;
import lombok.Setter;

public class FoodMeetingDisplayBean implements DisplayBean {

	public FoodMeetingDisplayBean() {
		super();
	}

	@Getter
	@Setter
	private int id;

	@Getter
	@Setter
	private String name;

	@Getter
	@Setter
	private String imageLink;

	@Getter
	@Setter
	private FoodMeetingStatus status;

	@Getter
	@Setter
	private Timestamp eventDate;

	@Getter
	@Setter
	private Timestamp votingDate;

	@Getter
	@Setter
	private Timestamp orderDate;

	@Getter
	@Setter
	private Timestamp paymentDate;

	@Getter
	@Setter
	private User userOwner;

	@Getter
	@Setter
	private Timestamp createdAt;

	@Getter
	@Setter
	private int buyerId;

	@Getter
	@Setter
	private java.time.LocalDate date;

	@Getter
	@Setter
	private String time;
	
}
