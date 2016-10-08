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

	private static final String USERS_BY_ID_QUERY = "SELECT id, name, last_name, email FROM user WHERE id IN (";

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
				User user = new User(resultSet.getInt(1), resultSet.getString(4), resultSet.getString(2),
						resultSet.getString(3));
				users.add(user);
			}
		}

		return users;
	}
}
