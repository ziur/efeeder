package org.jala.efeeder.places;

import static java.sql.Statement.RETURN_GENERATED_KEYS;

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
public class PlaceManager {
	
	private static final String INSERT_PLACE_QUERY = "INSERT INTO places(name, description, phone, direction, image_link) values(?, ?, ?, ?, ?)";

	private final Connection connection;

	public PlaceManager(Connection connection) {
		this.connection = connection;
	}
	
	public void insertPlace(Place place)throws SQLException {
		PreparedStatement stm = connection.prepareStatement(INSERT_PLACE_QUERY, RETURN_GENERATED_KEYS);

		stm.setString(1, place.getName());
		stm.setString(2, place.getDescription());
		stm.setString(3, place.getPhone());
		stm.setString(4, place.getDirection());
		stm.setString(5, place.getImage_link());
		stm.executeUpdate();

		ResultSet generatedKeys = stm.getGeneratedKeys();

		generatedKeys.next();

		place.setId(generatedKeys.getInt(1));
	}
}
