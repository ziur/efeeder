package org.jala.efeeder.order;

import lombok.Data;
import lombok.EqualsAndHashCode;

import org.jala.efeeder.places.PlaceItem;
import org.jala.efeeder.user.User;

/**
 *
 * @author Mirko Terrazas
 */
@Data
@EqualsAndHashCode(exclude={"details", "quantity", "cost"})
public class Order {

	private int idFoodMeeting;
	private int idUser;
	private User user;
	private String details;
	private int quantity;
	private PlaceItem placeItem;
	private Double cost;
        private Double payment;
        
	public Order(int idFoodMeeting, int idUser, String details, Double cost, PlaceItem placeItem, int quantity, Double payment) {
		this.idFoodMeeting = idFoodMeeting;
		this.idUser = idUser;
		this.user = null;
		this.details = details;
		this.cost = cost;
		this.placeItem = placeItem;
		this.quantity = quantity;
                this.payment = payment;
	}
	
	public double getTotalCost(){
		return roundTwoDecimals(cost * quantity);
	}
	
	public double getDebt(){
		return roundTwoDecimals(getTotalCost() - payment);
	}

	public void setUser(User user) {
		setIdUserFromUser(user);
		this.user = user;
	}

	private void setIdUserFromUser(User user) {
		if (user != null) {
			this.idUser = user.getId();
		} else {
			this.idUser = 0;
		}
	}
	
	private double roundTwoDecimals(double number) {
		number = Math.round(number * 100);
		number = number/100;
		return number;
	}
}
