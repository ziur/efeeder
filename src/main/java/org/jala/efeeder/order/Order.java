package org.jala.efeeder.order;

import lombok.Data;
import org.jala.efeeder.user.User;

/**
 *
 * @author Mirko Terrazas
 */
@Data
public class Order {

	private int idFoodMeeting;
	private int idUser;
	private User user;
	private String details;
	private Double cost;
        private Double payment;

	public Order(int idFoodMeeting, int idUser, String details, Double cost, Double payment) {
		this.idFoodMeeting = idFoodMeeting;
		this.idUser = idUser;
		this.user = null;
		this.details = details;
		this.cost = cost;
                this.payment = payment;
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
}
