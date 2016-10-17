/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.user;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 *
 * @author rodrigo_ruiz
 */
@Data
@EqualsAndHashCode(exclude={"email", "name", "lastName", "image", "userName", "password"})
public class User {
	private int id;
	private String email;
	private String name;
	private String lastName;
	private String image;
	private String userName;
	private String password;
	
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

	@Override
	public String toString()
	{
		return this.name + " " + this.lastName;
	}
}
