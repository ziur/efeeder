package org.jala.efeeder.user;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.codehaus.plexus.util.StringUtils;
import org.jala.efeeder.order.Order;
import org.jala.efeeder.order.OrderManager;
import org.jala.efeeder.places.PlaceItem;

/**
 * 
 * @author amir_aranibar
 *
 */
public class UserManager {

	private static final String SELECT_QUERY = "SELECT id, email, name, last_name, image_path, username, password FROM user ";
	private static final String USERS_BY_ID_QUERY = SELECT_QUERY + "WHERE id IN (";
	private static final String USERS_BY_USERNAME_PASSWORD_QUERY = SELECT_QUERY + "WHERE username = ? AND password = ?";
	private static final String USERS_BY_FOOD_MEETING_QUERY = "SELECT DISTINCT u.id, u.email, u.name, u.last_name, u.image_path, u.username, u.password, fmp.payment FROM user u INNER JOIN orders o ON u.id = o.id_user AND o.id_food_meeting = ? INNER JOIN food_meeting_participants fmp ON o.id_food_meeting = fmp.id_food_meeting AND u.id = fmp.id_user";
	private static final String INSERT_USER_QUERY = "INSERT INTO user(name, last_name, email, username, password, image_path) values(?, ?, ?, ?, ?, ?)";
	private static final String UPDATE_USER_QUERY = "UPDATE user SET name = ?, last_name = ?, email = ? , username = ?, password = ?, image_path = ? "
			+ "WHERE id = ?";
	private static final String UPDATE_PAYMENT = "UPDATE food_meeting_participants SET payment=? WHERE id_food_meeting=? AND id_user=?";

	private final Connection connection;

	public UserManager(Connection connection) {
		this.connection = connection;
	}
	
	public List<User> getUsersFromResultSet(ResultSet resultSet) throws SQLException
	{
		List<User> users = new ArrayList<>();

		while (resultSet.next()) {

			int id = resultSet.getInt(1);
			String email = resultSet.getString(2);
			String name = resultSet.getString(3);
			String lastName = resultSet.getString(4);
			String image = resultSet.getString(5);
			String userName = resultSet.getString(6);
			String password = resultSet.getString(7);

			User user = new User(id, email, name, lastName, image, userName, password);
			
			if (resultSet.getMetaData().getColumnCount() > 7) {
				double payment = resultSet.getDouble(8);
				
				if (resultSet.wasNull()) {
					payment = 0.0;
				}
				
				user.setPayment(payment);
			}
			
			users.add(user);
		}
		
		return users;
	}

	public List<User> getUsersById(List<Integer> ids) throws SQLException {
		List<User> users = new ArrayList<>();

		if (!ids.isEmpty()) {
			PreparedStatement preparedStatement = connection
					.prepareStatement(USERS_BY_ID_QUERY + StringUtils.join(ids.toArray(), ",") + ");");
			ResultSet resultSet = preparedStatement.executeQuery();

			users.addAll(getUsersFromResultSet(resultSet));
		}

		return users;
	}

	public User getUserById(int id) throws SQLException {

		User user = null;
		List<Integer> listId = new ArrayList<>();
		listId.add(id);
		List<User> users = getUsersById(listId);
		if (users.isEmpty() == false) {
			user = users.get(0);
		}

		return user;
	}
	
	public User getUserByUserNamePassword(String userName, String password) throws SQLException {
		User user = null;
		if (userName.isEmpty() == false && password.isEmpty() == false) {
			PreparedStatement preparedStatement = connection.prepareStatement(USERS_BY_USERNAME_PASSWORD_QUERY);
			preparedStatement.setString(1, userName);
			preparedStatement.setString(2, password);

			ResultSet resultSet = preparedStatement.executeQuery();

			List<User> users = getUsersFromResultSet(resultSet);
			if (users.isEmpty() == false) {
				user = users.get(0);
			}
		}

		return user;
	}
	
	public List<User> getUsersWithOrders(int idFoodMeeting) throws SQLException {
		OrderManager orderManager = new OrderManager(connection);
		
		PreparedStatement preparedStatement = connection.prepareStatement(USERS_BY_FOOD_MEETING_QUERY);
        preparedStatement.setInt(1, idFoodMeeting);
        ResultSet resultSet = preparedStatement.executeQuery();
        
        List<User> users = getUsersFromResultSet(resultSet);
        
        users.stream().forEach((user) -> {
        	try {
				user.setOrders(orderManager.getMyOrders(user.getId(), idFoodMeeting));
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        });
		
		return users;
	}
	
	public void insertUser(User user)throws SQLException{

		PreparedStatement stm = connection.prepareStatement(INSERT_USER_QUERY);

		stm.setString(1, user.getName());
		stm.setString(2, user.getLastName());
		stm.setString(3, user.getEmail());
		stm.setString(4, user.getUserName());
		stm.setString(5, user.getPassword());
		stm.setString(6, user.getImage());

		stm.executeUpdate();
	}
	public void updateUser(User user)throws SQLException{

		PreparedStatement stm = connection.prepareStatement(UPDATE_USER_QUERY);

		stm.setString(1, user.getName());
		stm.setString(2, user.getLastName());
		stm.setString(3, user.getEmail());
		stm.setString(4, user.getUserName());
		stm.setString(5, user.getPassword());
		stm.setString(6, user.getImage());
		stm.setInt(7, user.getId());

		stm.executeUpdate();
	}
	
	public void updatePayment(int idFoodMeeting, int idUser, double payment) throws SQLException {
        executeUpdatePayment(idFoodMeeting, idUser, payment, UPDATE_PAYMENT);
    }
	
	private void executeUpdatePayment(int idFoodMeeting, int idUser, double payment, String query)
            throws SQLException {
        PreparedStatement preparedStatement = connection.prepareStatement(query);

        preparedStatement.setDouble(1, payment);
        preparedStatement.setInt(2, idFoodMeeting);
        preparedStatement.setInt(3, idUser);

        preparedStatement.executeUpdate();
    }
}
