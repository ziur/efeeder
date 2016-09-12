package org.jala.efeeder.foodmeeting;

import java.sql.Date;

/**
 * Created by alejandro on 09-09-16.
 */
public class FoodMeeting {
    private int id;
    private String name;
    private Date createdAt;

    public FoodMeeting() {
    }

    public FoodMeeting(int id, String name, Date createdAt) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
