/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.wheel;

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

/**votes
 *
 * @author alexander_castro
 */
@Command
public class WheeldecideCommand implements CommandUnit{

    @Override
    public Out execute(In context) throws Exception {
//        String a = context.getParameter("a") + "- Param";
        Connection connection = context.getConnection();
        Statement statement = connection.createStatement();
        ResultSet resultSet = statement.executeQuery("Select * from user");
        Out out = new DefaultOut();
        List<User> userList = new ArrayList<User>();
        while (resultSet.next()) {
            userList.add(new User(resultSet.getString(1), resultSet.getString(2)));
        }
        out.addResult("users1", userList);
        out.addResult("chosen", getRandomIndexPerson(userList.size()));
        out.forward("wheeldecide/wheel.jsp");
        return out;
    }
    
    private int getRandomIndexPerson(int numberOfPersons){
        double random = (Math.random() * 10) + 1;
        int d = (int)((random * numberOfPersons) / 10);
        return d;
    }
    
}
