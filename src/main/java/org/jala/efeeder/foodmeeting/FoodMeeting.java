package org.jala.efeeder.foodmeeting;

import java.sql.Date;

import lombok.Data;

/**
 * Created by alejandro on 09-09-16.
 */
@Data
public class FoodMeeting {
    private int id;
    private String name;
    private String imageLink;
    private Date createdAt;

    public FoodMeeting() {
    }

    public FoodMeeting(int id, String name,String imageLink, Date createdAt) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.imageLink = imageLink;
    }
}
