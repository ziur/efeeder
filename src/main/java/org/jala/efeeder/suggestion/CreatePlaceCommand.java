/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.suggestion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;

/**
 *
 * @author alexander_castro
 */
@Command
public class CreatePlaceCommand implements CommandUnit{

    @Override
    public Out execute(In parameters) throws Exception {
        Connection connection = parameters.getConnection();
        
         PreparedStatement stm = connection
                .prepareStatement("insert into places(name, description, phone, direction, image_link) values(?, ?, ?, ?, ?)");

        stm.setString(1, parameters.getParameter("name"));
        stm.setString(2, parameters.getParameter("description"));
        stm.setString(3, parameters.getParameter("phone"));
        stm.setString(4, parameters.getParameter("direction"));
        stm.setString(5, parameters.getParameter("image_link"));
        stm.executeUpdate();
        
        return OutBuilder.response("text/plain", "Its insert into places a new data");
    }
    
}
