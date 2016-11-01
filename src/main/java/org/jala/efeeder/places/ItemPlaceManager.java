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
public class ItemPlaceManager {
	
	private static final String INSERT_ITEM_PLACE_QUERY = "INSERT INTO place_item(name, description, price, image_link, id_place) values(?, ?, ?, ?, ?)";

	private final Connection connection;

	public ItemPlaceManager(Connection connection) {
		this.connection = connection;
	}
	
	public void insertItemPlace(ItemPlace itemPlace)throws SQLException {
		PreparedStatement stm = connection.prepareStatement(INSERT_ITEM_PLACE_QUERY, RETURN_GENERATED_KEYS);

		stm.setString(1, itemPlace.getName());
		stm.setString(2, itemPlace.getDescription());
		stm.setDouble(3, itemPlace.getPrice());
		stm.setString(4, itemPlace.getImageLink());
		stm.setInt(5, itemPlace.getPlace().getId());
		stm.executeUpdate();

		ResultSet generatedKeys = stm.getGeneratedKeys();

		generatedKeys.next();

		itemPlace.setId(generatedKeys.getInt(1));
	}
}
