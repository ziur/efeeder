/**
 * 
 */
package org.jala.efeeder.order;

import java.sql.Timestamp;
import java.util.List;

import org.jala.efeeder.api.command.DisplayBean;
import org.jala.efeeder.foodmeeting.FoodMeeting;
import org.jala.efeeder.places.Place;
import org.jala.efeeder.user.User;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Patricia Escalera
 *
 */
public class OrdersDisplayBean implements DisplayBean {

	FoodMeeting foodMeeting;
	@Setter
	@Getter
	Place place;
	@Setter
	@Getter
	List<Order> orders;
	@Setter
	@Getter
	Timestamp orderTime;
	@Setter
	@Getter
	User myUser;
	/**
	 * 
	 */
	public OrdersDisplayBean() {
		super();
	}
	public FoodMeeting getFoodMeeting() {
		return foodMeeting;
	}
	public void setFoodMeeting(FoodMeeting foodMeeting) {
		this.foodMeeting = foodMeeting;
	}

	
}
