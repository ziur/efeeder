/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.user;

/**
 *
 * @author rodrigo_ruiz
 */
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLast_name() {
        return last_name;
    }

    public void setLast_name(String last_name) {
        this.last_name = last_name;
    }
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }    
    
}
