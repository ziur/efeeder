package org.jala.efeeder.suggestion;

import java.sql.Date;

/**
 *
 * @author Amir
 */
public class Suggestion {

    private int id;
    private int idUser;
    private int idFoodMeeting;
    private String place;
    private String description;
    private Date createdAt;

    public Suggestion() {
        this(0, 0, 0, null, null, null);
    }

    public Suggestion(int id, int idUser, int idFoodMeeting, String place, String description, Date createdAt) {
        this.id = id;
        this.idUser = idUser;
        this.idFoodMeeting = idFoodMeeting;
        this.place = place;
        this.description = description;
        this.createdAt = createdAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getIdUser() {
        return idUser;
    }

    public void setIdUser(int idUser) {
        this.idUser = idUser;
    }

    public int getIdFoodMeeting() {
        return idFoodMeeting;
    }

    public void setIdFoodMeeting(int idFoodMeeting) {
        this.idFoodMeeting = idFoodMeeting;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
