package org.jala.efeeder.login;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.user.User;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class LoginCommand implements CommandUnit {
    @Override
    public Out execute(In parameters) throws Exception {
    	
    	
    	Out out = new DefaultOut();
        Connection connection = parameters.getConnection();
        PreparedStatement preparedStatement = connection.prepareStatement(
                "Select id, email, name, last_name from user where nick_name=?");
        preparedStatement.setString(1, parameters.getParameter("nick_name"));
        ResultSet resultSet = preparedStatement.executeQuery();
        User user = null;

        while (resultSet.next()) {
            user = new User(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3), resultSet.getString(4));
        }
        
        if (user!=null)
        {
        	out.setUser(user);
            
            out.addResult("user_name", user.toString());
            
            return out.forward("home/home.jsp");
        }
        else
        {
        	return out.forward("home/login.jsp");
        }
        	
        
    }
}
