/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.user;

import java.sql.Date;
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
public class UserCommand implements CommandUnit{
    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();
        if (parameters.getParameter("name") == null) {
            return out.forward("user/user.jsp");
        }

        PreparedStatement stm = parameters.getConnection()
                                        .prepareStatement("insert into user(name, last_name, email) values(?, ?, ?)");
        stm.setString(1, parameters.getParameter("name"));
        stm.setString(2, parameters.getParameter("last_name"));
        stm.setString(3, parameters.getParameter("email"));
        stm.executeUpdate();

        return out.redirect("action/users");
    }
}
