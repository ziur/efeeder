package org.jala.efeeder.user;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.codehaus.plexus.util.StringUtils;

/**
 * 
 * @author amir_aranibar
 *
 */
public class UserManager {

	private static final String SELECT_QUERY = "SELECT id, email, name, last_name, image_path, username, password FROM user ";
	private static final String USERS_BY_ID_QUERY = SELECT_QUERY + "WHERE id IN (";
	private static final String USERS_BY_USERNAME_PASSWORD_QUERY = SELECT_QUERY + "WHERE username = ? AND password = ?";
	private static final String INSERT_USER_QUERY = "INSERT INTO user(name, last_name, email, username, password, image_path) values(?, ?, ?, ?, ?, ?)";
	private static final String UPDATE_USER_QUERY = "UPDATE user SET name = ?, last_name = ?, email = ? , username = ?, password = ?, image_path = ? "
			+ "WHERE id = ?";

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
		if (users.isEmpty() == false)
		{
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
			if (users.isEmpty() == false)
			{
				user = users.get(0);
			}
		}

		return user;
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
}
