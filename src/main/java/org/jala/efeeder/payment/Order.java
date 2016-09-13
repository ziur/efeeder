package org.jala.efeeder.payment;

import lombok.Data;

/**
 *
 * @author Mirko Terrazas
 */
@Data
public class Order {

    private int idFoodMeeting;
    private String user;
    private String order;
    private Double cost;

    public Order(int idFoodMeeting, String user, String order, Double cost) {
        this.idFoodMeeting = idFoodMeeting;
        this.user = user;
        this.order = order;
        this.cost = cost;
    }
}
