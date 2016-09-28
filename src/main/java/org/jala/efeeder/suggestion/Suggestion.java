/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.suggestion;

import lombok.Data;
import java.util.List;

/**
 *
 * @author 0x3
 */
@Data 
public class Suggestion {
    private List<UserAndPlace> userList;
    private List<Place> placeList;
    private int userId;
    
    public Suggestion(List<UserAndPlace> userList, List<Place> placeList, int userId) {
        this.userList = userList;
        this.placeList = placeList;
        this.userId = userId;
    }
}