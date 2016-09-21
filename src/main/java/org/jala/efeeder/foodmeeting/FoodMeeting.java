package org.jala.efeeder.foodmeeting;

import java.sql.Date;

import org.joda.time.Days;
import org.joda.time.LocalDate;

import lombok.Data;

/**
 * Created by alejandro on 09-09-16.
 */
@Data
public class FoodMeeting {
    private int id;
    private String name;
    private String imageLink;
    private Date eventDate;
    private Date createdAt;

    public FoodMeeting() {
    }

    public FoodMeeting(int id, String name,String imageLink, Date eventDate, Date createdAt) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.eventDate = eventDate;
        this.imageLink = imageLink;
    }
    
    public int getWidth()
    {
        int width = 500;

        LocalDate today = new LocalDate();
        LocalDate endEventDate = new LocalDate(eventDate);

        int days = Days.daysBetween(today, endEventDate).getDays();

        width = (50 * days) < 400 ?
                width - (50 * days) :
                200;

        return width;
    }
}
