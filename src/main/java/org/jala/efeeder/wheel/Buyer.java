/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.wheel;

import lombok.Data;

/**
 *
 * @author alexander_castro
 */
@Data
public class Buyer {
    private int foodMeetingId;
    private int userId;

    public Buyer(int foodMeetingId, int userId) {
        this.foodMeetingId = foodMeetingId;
        this.userId = userId;
    }

    public int getFoodMeetingId() {
        return foodMeetingId;
    }

    public void setFoodMeetingId(int foodMeetingId) {
        this.foodMeetingId = foodMeetingId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }
}
