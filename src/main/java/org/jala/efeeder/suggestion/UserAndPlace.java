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
    private int id_User;
    private int id_Place;
    private String name;

    public UserAndPlace(int id_User, int id_Place, String name) {
        this.id_User = id_User;
        this.id_Place = id_Place;
        this.name = name;
    }
}
