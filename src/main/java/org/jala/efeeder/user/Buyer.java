/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.user;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 *
 * @author rodrigo_ruiz
 */
@Data
@EqualsAndHashCode(exclude={"foodMeetingId", "userId"})
public class Buyer {
    int foodMeetingId;
    int userId;
    
    public Buyer(int foodMeetingId, int userId) {
        this.foodMeetingId = foodMeetingId;
        this.userId = userId;
    }    
}
