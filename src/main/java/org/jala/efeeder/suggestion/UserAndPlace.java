/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.suggestion;

import lombok.Data;

/**
 *
 * @author alexander_castro
 */
@Data
public class UserAndPlace {
    private int userId;
    private int placeId;
    private String name;

    public UserAndPlace(int userId, int placeId, String name) {
        this.userId = userId;
        this.placeId = placeId;
        this.name = name;
    }
}
