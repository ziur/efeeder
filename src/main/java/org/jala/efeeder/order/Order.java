package org.jala.efeeder.order;

import lombok.Data;

/**
 *
 * @author Mirko Terrazas
 */
@Data
public class Order {

    private int idFoodMeeting;
    private int idUser;
    private String details;
    private Double cost;

    public Order(int idFoodMeeting, int idUser, String details, Double cost) {
        this.idFoodMeeting = idFoodMeeting;
        this.idUser = idUser;
        this.details = details;
        this.cost = cost;
    }
}
