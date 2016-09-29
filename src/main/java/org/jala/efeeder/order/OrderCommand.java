package org.jala.efeeder.order;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.user.User;

/**
 *
 * @author Mirko Terrazas
 */
@Command
public class OrderCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {

        Out out = new DefaultOut();
        Connection connection = parameters.getConnection();

        List<User> users = new ArrayList<>();
        PreparedStatement preparedStatement = connection.prepareStatement("Select id, email, name, last_name from user");
        ResultSet resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            users.add(new User(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3), resultSet.getString(4)));
        }

        out.addResult("users", users);
        out.forward("order/orders.jsp");

        return out;
    }
}