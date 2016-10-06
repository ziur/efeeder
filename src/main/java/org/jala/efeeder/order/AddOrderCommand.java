package org.jala.efeeder.order;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

import java.sql.*;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class AddOrderCommand implements CommandUnit {

    private static final String GET_MY_ORDER = "SELECT id_food_meeting, id_user, order_name, cost FROM orders WHERE id_food_meeting=? AND id_user=?;";
    private static final String INSERT_ORDER = "INSERT INTO orders(order_name, cost, id_food_meeting, id_user) VALUES(?, ?, ?, ?);";
    private static final String UPDATE_ORDER = "UPDATE orders SET order_name=?, cost=? WHERE id_food_meeting=? AND id_user=?;";

    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();
        saveOrder(parameters);

        return out.redirect("action/order?id_food_meeting=" + parameters.getParameter("id_food_meeting"));
    }

    private void saveOrder(In parameters) throws SQLException {
        int idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
        int idUser = parameters.getUser().getId();
        String details = parameters.getParameter("details");
        double cost = Double.parseDouble(parameters.getParameter("cost"));
        Connection connection = parameters.getConnection();

        Order myOrder = getMyOrder(idFoodMeeting, idUser, connection);
        if (myOrder == null) {
            insertOrder(idFoodMeeting, idUser, details, cost, connection);
        } else {
            updateOrder(idFoodMeeting, idUser, details, cost, connection);
        }
    }

    private Order getMyOrder(int idFoodMeeting, int idUser, Connection connection) throws SQLException {
        Order myOrder = null;
        PreparedStatement preparedStatement = connection.prepareStatement(GET_MY_ORDER);
        preparedStatement.setInt(1, idFoodMeeting);
        preparedStatement.setInt(2, idUser);
        ResultSet resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            myOrder = new Order(resultSet.getInt(1), resultSet.getInt(2), resultSet.getString(3), resultSet.getDouble(4));
            break;
        }

        return myOrder;
    }

    private void insertOrder(int idFoodMeeting, int idUser, String details, double cost, Connection connection) throws SQLException {
        executeUpdateOrder(idFoodMeeting, idUser, details, cost, connection, INSERT_ORDER);
    }

    private void updateOrder(int idFoodMeeting, int idUser, String details, double cost, Connection connection) throws SQLException {
        executeUpdateOrder(idFoodMeeting, idUser, details, cost, connection, UPDATE_ORDER);
    }

    private void executeUpdateOrder(int idFoodMeeting, int idUser, String details, double cost, Connection connection, String query) throws SQLException {
        PreparedStatement preparedStatement = connection.prepareStatement(query);

        preparedStatement.setString(1, details);
        preparedStatement.setDouble(2, cost);
        preparedStatement.setInt(3, idFoodMeeting);
        preparedStatement.setInt(4, idUser);

        preparedStatement.executeUpdate();
    }
}
