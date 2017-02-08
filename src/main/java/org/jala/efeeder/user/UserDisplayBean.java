/**
 * 
 */
package org.jala.efeeder.user;

import org.jala.efeeder.api.command.DisplayBean;

/**
 * User display bean
 * 
 * @author Patricia Escalera
 *
 */
public class UserDisplayBean implements DisplayBean {

	//public static final String USER_BEAN = "user";

	boolean newUser = true;

	User user;

	public UserDisplayBean() {
		user = new User(0, "", "", "", "empty", "", "");
	}

	public UserDisplayBean(String email, String name, String lastname) {
		user = new User(0, email, name, lastname);
	}

	public UserDisplayBean(int id, String email, String name, String lastname, String image, String login,
			String password) {
		if (id > 0) {
			newUser = false;
		}
		user = new User(id, email, name, lastname, image, login, password);
	}

	public User getUser() {
		return user;
	}
	
	public boolean isNewUser(){
		return newUser;
	}

}
