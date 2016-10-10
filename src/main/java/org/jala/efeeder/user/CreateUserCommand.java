/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.user;

import java.sql.PreparedStatement;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 *
 * @author rodrigo_ruiz
 */
@Command
public class CreateUserCommand implements CommandUnit{
    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();

        PreparedStatement stm = parameters.getConnection()
                .prepareStatement(
                        "insert into user(name, last_name, email, username, password, image_path)" + " values(?, ?, ?, ?, ?, ?)");
        
        stm.setString(1, parameters.getParameter("name"));
        stm.setString(2, parameters.getParameter("last_name"));
        stm.setString(3, parameters.getParameter("email"));
        stm.setString(4, parameters.getParameter("username"));
        stm.setString(5, parameters.getParameter("password"));
        stm.setString(6, parameters.getParameter("image"));
        stm.executeUpdate();

        return out.redirect("login");
    }
}
