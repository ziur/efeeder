package org.jala.efeeder.user;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.jala.efeeder.api.command.In;

public class UserUtilDataBase {

	private static final String USER_SQL = "Select id, email, name, last_name, image_path from user where id=?";

	public static User getUser(Connection connection, int id)throws SQLException
	{
		User user = null;
		PreparedStatement stm = connection.prepareStatement(USER_SQL);
		stm.setInt(1, id);
		ResultSet resultSet = stm.executeQuery();
		if (resultSet.next()) {
			String email = resultSet.getString(2);
			String name = resultSet.getString(3);
			String last_name = resultSet.getString(4);
			String image = resultSet.getString(5);
			user = new User(id, email, name, last_name, image);
		}
		return user;
	}

}
