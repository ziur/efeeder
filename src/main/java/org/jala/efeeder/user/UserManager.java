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

	private static final String USERS_BY_ID_QUERY = "SELECT id, email, name, last_name, image_path FROM user WHERE id IN (";

	private final Connection connection;

	public UserManager(Connection connection) {
		this.connection = connection;
	}

	public List<User> getUsersById(List<Integer> ids) throws SQLException {
		List<User> users = new ArrayList<>();

		if (!ids.isEmpty()) {
			PreparedStatement preparedStatement = connection
					.prepareStatement(USERS_BY_ID_QUERY + StringUtils.join(ids.toArray(), ",") + ");");
			ResultSet resultSet = preparedStatement.executeQuery();

			while (resultSet.next()) {

				int id = resultSet.getInt(1);
				String email = resultSet.getString(2);
				String name = resultSet.getString(3);
				String last_name = resultSet.getString(4);
				String image = resultSet.getString(5);

				User user = new User(id, email, name, last_name, image);
				users.add(user);
			}
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
}
