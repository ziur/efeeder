/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.places;

import java.sql.PreparedStatement;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 *
 * @author ricardo_ramirez
 */
@Command
public class CreatePlaceCommand implements CommandUnit {

    private static final String UPDATE_PLACE_QUERY = "INSERT INTO places(name, description, phone, direction, image_link) values(?, ?, ?, ?, ?)";
    
    @Override
    public Out execute(In parameters) throws Exception {
        DefaultOut defaultOut = new DefaultOut();
        PreparedStatement prepareStatement = parameters.getConnection().prepareStatement(UPDATE_PLACE_QUERY);
        prepareStatement.setString(1, parameters.getParameter("name"));
        prepareStatement.setString(2, parameters.getParameter("description"));
        prepareStatement.setString(3, parameters.getParameter("phone"));
        prepareStatement.setString(4, parameters.getParameter("address"));
        prepareStatement.setString(5, parameters.getParameter("image_link"));  
        prepareStatement.execute();
        return defaultOut.forward("/places");
    }    
}

