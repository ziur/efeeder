package org.jala.efeeder.servlets.models;

/**
 *
 * @author amir_aranibar
 */
public class Suggestion {

    private String author;
    private String place;
    private String description;

    public Suggestion(String author, String place, String description) {
        this.author = author;
        this.place = place;
        this.description = description;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place.trim();
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description.trim();
    }
}
