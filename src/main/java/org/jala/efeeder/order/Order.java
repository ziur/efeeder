package org.jala.efeeder.order;

import org.jala.efeeder.user.User;

import lombok.Data;

/**
 *
 * @author Mirko Terrazas
 */
@Data
public class Order {

    private int idFoodMeeting;
    private User user;
    private String details;
    private Double cost;

    public Order(int idFoodMeeting, User user, String details, Double cost) {
        this.idFoodMeeting = idFoodMeeting;
        this.user = user;
        this.details = details;
        this.cost = cost;
    }
}
