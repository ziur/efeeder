package org.jala.efeeder.order;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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

    private static final String SELECT_ORDER = "SELECT id_food_meeting, id_user, order_name, Cost FROM orders";
    private static final String ORDERS_QUERY = SELECT_ORDER + " WHERE id_food_meeting=%s AND id_user!=%d;";
    private static final String MY_ORDER_QUERY = SELECT_ORDER + " WHERE id_food_meeting=%s AND id_user=%d;";

    @Override
    public Out execute(In parameters) throws Exception {
        String idFoodMeeting = parameters.getParameter("id_food_meeting");
        int idUser = parameters.getUser().getId();
        Out out = new DefaultOut();
        Connection connection = parameters.getConnection();

        List<Order> orders = getOrders(connection, idFoodMeeting, idUser);
        Order myOrder = getMyOrder(connection, idFoodMeeting, idUser);

        out.addResult("idFoodMeeting", idFoodMeeting);
        out.addResult("orders", orders);
        out.addResult("myOrder", myOrder);
        out.addResult("myUser", parameters.getUser());
        out.forward("order/orders.jsp");

        return out;
    }

    private List<Order> getOrders(Connection connection, String idFoodMeeting, int idUser) throws SQLException {
        List<Order> orders = new ArrayList<>();
        PreparedStatement preparedStatement = connection.prepareStatement(String.format(ORDERS_QUERY, idFoodMeeting, idUser));
        ResultSet resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            Order order = new Order(resultSet.getInt(1), resultSet.getInt(2), resultSet.getString(3), resultSet.getDouble(4));
            orders.add(order);
        }

        return orders;
    }

    private Order getMyOrder(Connection connection, String idFoodMeeting, int idUser) throws SQLException {
        Order myOrder = null;
        PreparedStatement preparedStatement = connection.prepareStatement(String.format(MY_ORDER_QUERY, idFoodMeeting, idUser));
        ResultSet resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            myOrder = new Order(resultSet.getInt(1), resultSet.getInt(2), resultSet.getString(3), resultSet.getDouble(4));
            break;
        }

        if (myOrder == null) {
            myOrder = new Order(Integer.parseInt(idFoodMeeting), idUser, null, 0.0);
        }

        return myOrder;
    }
}
