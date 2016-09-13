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
        PreparedStatement preparedStatement = connection.prepareStatement("Select o.id_food_meeting, u.name, o.order_name, o.cost from orders o, users u where o.id_food_meeting = ? and o.id_user = u.id");
        preparedStatement.setInt(1, Integer.valueOf(parameters.getParameter("id_food_meeting")));
        ResultSet resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            orders.add(new Order(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3), resultSet.getDouble(4)));
        }

        List<Integer> users = new ArrayList<>();
        preparedStatement = connection.prepareStatement("Select distinct id from users");
        resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            users.add(resultSet.getInt(1));
        }
        
        String meetingName = "";
        preparedStatement = connection.prepareStatement("Select name from food_meeting where id = ?");
        preparedStatement.setInt(1, Integer.valueOf(parameters.getParameter("id_food_meeting")));
        resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            meetingName = resultSet.getString(1);
        }

        out.addResult("meetingName", meetingName);
        out.addResult("payments", orders);
        out.addResult("id_food_meeting", Integer.valueOf(parameters.getParameter("id_food_meeting")));
        out.addResult("users", users);
        out.forward("order/order.jsp");

        return out;
    }
}