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

        List<Order> orders = new ArrayList<>();

        Out out = new DefaultOut();
        Connection connection = parameters.getConnection();
        PreparedStatement preparedStatement = connection.prepareStatement(
                "Select o.id_food_meeting, o.order_name, o.cost, u.id, u.email, u.name, u.last_name " +
                "from orders o, user u where o.id_food_meeting = ? and o.id_user = u.id");
        preparedStatement.setInt(1, Integer.valueOf(parameters.getParameter("id_food_meeting")));
        ResultSet resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            orders.add(new Order(resultSet.getInt(1), new User(resultSet.getInt(4), resultSet.getString(5),
                    resultSet.getString(6), resultSet.getString(7)), resultSet.getString(2), resultSet.getDouble(3)));
        }

        List<User> users = new ArrayList<>();
        preparedStatement = connection.prepareStatement("Select id, email, name, last_name from user");
        resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            users.add(new User(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3), resultSet.getString(4)));
        }

        String meetingName = "";
        preparedStatement = connection.prepareStatement("Select name from food_meeting where id = ?");
        preparedStatement.setInt(1, Integer.valueOf(parameters.getParameter("id_food_meeting")));
        resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            meetingName = resultSet.getString(1);
        }

        out.addResult("meetingName", meetingName);
        out.addResult("orders", orders);
        out.addResult("id_food_meeting", Integer.valueOf(parameters.getParameter("id_food_meeting")));
        out.addResult("users", users);
        out.forward("order/order.jsp");

        return out;
    }
}