package org.jala.efeeder.order;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.jala.efeeder.places.PlaceItem;
import org.jala.efeeder.places.PlaceItemManager;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;

/**
 * 
 * @author amir_aranibar
 *
 */
public class OrderManager {
	private static final String SELECT_ORDER = "SELECT id_food_meeting, id_user, order_name, Cost, quantity, id_place_item FROM orders";
	private static final String MY_ORDER_QUERY = SELECT_ORDER + " WHERE id_food_meeting=? AND id_user=?;";
	private static final String ORDERS_BY_FOOD_MEETING_QUERY = SELECT_ORDER + " WHERE id_food_meeting=?;";
	private static final String INSERT_ORDER = "INSERT INTO orders(order_name, cost, id_food_meeting, id_user, id_place_item, quantity) VALUES(?, ?, ?, ?, ?, ?);";
	private static final String UPDATE_ORDER = "UPDATE orders SET order_name=?, cost=? WHERE id_food_meeting=? AND id_user=?;";

	private final Connection connection;

	public OrderManager(Connection connection) {
		this.connection = connection;
	}

	public List<Order> getOrdersWithUserByFoodMeeting(int idFoodMeeting) throws SQLException {
		List<Order> orders = getOrdersByFoodMeeting(idFoodMeeting);
		List<Integer> idUsers = new ArrayList<>();

		orders.stream().forEach((order) -> {
			idUsers.add(order.getIdUser());
		});

		joinUserToOrder(orders, idUsers);

		return orders;
	}

	public List<Order> getOrdersByFoodMeeting(int idFoodMeeting) throws SQLException {
		List<Order> orders = new ArrayList<>();

		PlaceItemManager placeItemManager = new PlaceItemManager(connection);

		PreparedStatement preparedStatement = connection.prepareStatement(ORDERS_BY_FOOD_MEETING_QUERY);
		preparedStatement.setInt(1, idFoodMeeting);
		ResultSet resultSet = preparedStatement.executeQuery();

		while (resultSet.next()) {
			int idUser = resultSet.getInt(2);
			PlaceItem placeItem = placeItemManager.getPlaceItemById(resultSet.getInt(6));

			Order order = new Order(resultSet.getInt(1), idUser, resultSet.getString(3), resultSet.getDouble(4), placeItem, resultSet.getInt(5));
			orders.add(order);
		}

		return orders;
	}

	public List<Order> getMyOrder(int idUser, int idFoodMeeting) throws SQLException {
		List<Order> myOrders = new ArrayList<Order>();

		PlaceItemManager placeItemManager = new PlaceItemManager(connection);

		PreparedStatement preparedStatement = connection.prepareStatement(MY_ORDER_QUERY);
		preparedStatement.setInt(1, idFoodMeeting);
		preparedStatement.setInt(2, idUser);
		ResultSet resultSet = preparedStatement.executeQuery();

		if (resultSet.next()) {
			PlaceItem placeItem = placeItemManager.getPlaceItemById(resultSet.getInt(6));
			
			myOrders.add(new Order(resultSet.getInt(1), idUser, resultSet.getString(3), resultSet.getDouble(4), placeItem, resultSet.getInt(5)));
		}

		return myOrders;
	}

	public void insertOrder(int idFoodMeeting, int idUser,int idPlaceItem, int quantity, String details, double cost) throws SQLException {
		executeUpdateOrder(idFoodMeeting, idUser,idPlaceItem, quantity, details, cost, INSERT_ORDER);
	}

	public void updateOrder(int idFoodMeeting, int idUser, String details, double cost) throws SQLException {
		//executeUpdateOrder(idFoodMeeting, idUser, details, cost, UPDATE_ORDER);
	}

	private void executeUpdateOrder(int idFoodMeeting, int idUser, int idPlaceItem, int quantity, String details, double cost, String query)
			throws SQLException {
		PreparedStatement preparedStatement = connection.prepareStatement(query);

		preparedStatement.setString(1, details);
		preparedStatement.setDouble(2, cost);
		preparedStatement.setInt(3, idFoodMeeting);
		preparedStatement.setInt(4, idUser);
		preparedStatement.setInt(5, idPlaceItem);
		preparedStatement.setInt(6, quantity);

		preparedStatement.executeUpdate();
	}

	private void joinUserToOrder(List<Order> orders, List<Integer> idUsers) throws SQLException {
		UserManager userManager = new UserManager(connection);
		List<User> users = userManager.getUsersById(idUsers);

		orders.stream().forEach((order) -> {
			Optional<User> result = users.stream()
					.filter(user -> order.getIdUser() == user.getId()).findFirst();
			if (result.isPresent()) {
				order.setUser(result.get());
				//users.remove(result.get());
			}
		});
	}
}
