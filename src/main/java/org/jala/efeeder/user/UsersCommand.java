/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.user;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.foodmeeting.FoodMeeting;

/**
 *
 * @author rodrigo_ruiz
 */
@Command
public class UsersCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {

        Out out = new DefaultOut();
        Connection connection = parameters.getConnection();
        Statement statement = connection.createStatement();
        ResultSet resultSet = statement.executeQuery("select id, email, name, last_name  from user order by id, name, last_name, email");
        List<User> users = new ArrayList<>();
        while (resultSet.next()) {
            users.add(new User(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3), resultSet.getString(4)));
        }
        out.addResult("users", users);
        return out.forward("user/users.jsp");
    }
    
}
