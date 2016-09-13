package org.jala.efeeder.payment;

/**
 *
 * @author Mirko Terrazas
 */
public class Payment {
    
    private String id;
    private String user;
    private String order;
    private Double cost;
    
    public Payment(String id, String user, String order, Double cost) {
        this.id = id;
        this.user = user;
        this.order = order;
        this.cost = cost;
    }

	public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }
    
    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = order;
    }
    
    public Double getCost() {
        return cost;
    }

    public void setUser(Double cost) {
        this.cost = cost;
    }
    
}
