/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.user;

import lombok.Data;
import lombok.ToString;

/**
 *
 * @author rodrigo_ruiz
 */
@Data
public class User {
    private int    id;
    private String email;
    private String name;
    private String last_name;

    public User(int id, String email, String name, String last_name) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.last_name = last_name;
    }

    public User(String email, String name, String last_name) {
        this.email = email;
        this.name = name;
        this.last_name = last_name;
    }

    public User(int idUser, String nameUser) {
        this.id = idUser;
        this.name = nameUser;
    }

    public String toString()
    {
    	return this.name + " " + this.last_name;
    }
}
