package org.jala.efeeder.user;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 *
 * @author rodrigo_ruiz
 */
@Deprecated
public class BuyerManager {

    private static final String SELECT_QUERY = "SELECT id_food_meeting, id_user FROM buyer WHERE id_food_meeting = ?";
    private static final String INSERT_USER_QUERY = "INSERT INTO buyer(id_food_meeting, id_user) values(?, ?)";

    private final Connection connection;

    public BuyerManager(Connection connection) {
        this.connection = connection;
    }

    public void insertUser(Buyer buyer) throws SQLException {

        PreparedStatement stm = connection.prepareStatement(INSERT_USER_QUERY);

        stm.setInt(1, buyer.getFoodMeetingId());
        stm.setInt(2, buyer.getUserId());

        stm.executeUpdate();
    }

    public Buyer getBuyerByFoodMeetingId(int foodMeetingId) throws SQLException {
        PreparedStatement preparedStatement = connection.prepareStatement(SELECT_QUERY);
        preparedStatement.setInt(1, foodMeetingId);
        Buyer buyer = null;
        ResultSet resultSet = preparedStatement.executeQuery();

        if (resultSet.next()) {
            int userId = resultSet.getInt(2);
            buyer = new Buyer(foodMeetingId, userId);
        }

        return buyer;
    }
}
