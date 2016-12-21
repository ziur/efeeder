package org.jala.efeeder.user;

import java.util.List;

import lombok.Data;
import lombok.EqualsAndHashCode;

import org.jala.efeeder.order.Order;

/**
 *
 * @author rodrigo_ruiz
 */
@Data
@EqualsAndHashCode(exclude={"email", "name", "lastName", "image", "userName", "password", "orders", "payment"})
public class User {
	private int id;
	private String email;
	private String name;
	private String lastName;
	private String image;
	private String userName;
	private String password;
	private List<Order> orders;
	private double payment;
	
	public User(int id, String email, String name, String lastName, String image, String userName, String password) {
		this.id = id;
		this.email = email;
		this.name = name;
		this.lastName = lastName;
		this.image = image;
		this.userName = userName;
		this.password = password;
	}

	public User(int id, String email, String name, String lastName, String image) {
		this(id, email, lastName, lastName, image, "", "");
	}
	
	public User(int id, String email, String name, String lastName) {
		this(email, name, lastName);
		this.id = id;
	}

	public User(String email, String name, String lastName) {
		this.email = email;
		this.name = name;
		this.lastName = lastName;
	}

	public User(int idUser, String nameUser) {
		this.id = idUser;
		this.name = nameUser;
	}
	
	public double getTotalOrders() {
		double result = 0.0;
		
		if (orders != null) {
			for (Order order : orders) {
				result += order.getTotalCost();
			};
		}
		
		return result;
	}

	@Override
	public String toString()
	{
		return this.name + " " + this.lastName;
	}
}
