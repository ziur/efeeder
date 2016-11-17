package org.jala.efeeder.places;

import static java.sql.Statement.RETURN_GENERATED_KEYS;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * 
 * @author amir_aranibar
 *
 */
public class PlaceItemManager {
	
	private static final String INSERT_PLACE_ITEM_QUERY = "INSERT INTO place_item(name, description, price, image_link, id_place) values(?, ?, ?, ?, ?)";
	private static final String SELECT_PLACE_ITEM_QUERY = "SELECT pi.id, pi.name, pi.description, pi.price, pi.image_link FROM place_item pi";
	private static final String BY_PLACE = " , places p WHERE p.id = pi.id_place AND p .id = ?";
	private static final String BY_ID = " WHERE pi.id = ?";
	private final Connection connection;

	public PlaceItemManager(Connection connection) {
		this.connection = connection;
	}

	public void insertPlaceItem(PlaceItem placeItem)throws SQLException {
		PreparedStatement stm = connection.prepareStatement(INSERT_PLACE_ITEM_QUERY, RETURN_GENERATED_KEYS);

		stm.setString(1, placeItem.getName());
		stm.setString(2, placeItem.getDescription());
		stm.setDouble(3, placeItem.getPrice());
		stm.setString(4, placeItem.getImageLink());
		stm.setInt(5, placeItem.getPlace().getId());
		stm.executeUpdate();

		ResultSet generatedKeys = stm.getGeneratedKeys();

		generatedKeys.next();

		placeItem.setId(generatedKeys.getInt(1));
	}

	public List<PlaceItem> getPlaceItemByPlace(Place place) throws SQLException {
		PreparedStatement stm = connection.prepareStatement(SELECT_PLACE_ITEM_QUERY + BY_PLACE);

		stm.setInt(1, place.getId());

		ResultSet resultSet = stm.executeQuery();
		
		return createPlaceItemsByResultSet(resultSet, place);
	}

	public List<PlaceItem> getPlaceItemByPlaceWithoutPlace(Place place) throws SQLException {
		PreparedStatement stm = connection.prepareStatement(SELECT_PLACE_ITEM_QUERY + BY_PLACE);

		stm.setInt(1, place.getId());

		ResultSet resultSet = stm.executeQuery();
		
		return createPlaceItemsByResultSet(resultSet, null);
	}
	
	public PlaceItem getPlaceItemById(int id) throws SQLException {
		PreparedStatement stm = connection.prepareStatement(SELECT_PLACE_ITEM_QUERY + BY_ID);

		stm.setInt(1, id);

		ResultSet resultSet = stm.executeQuery();

		return createPlaceItemsByResultSet(resultSet, null).get(0);
	}

	private List<PlaceItem> createPlaceItemsByResultSet(ResultSet resultSet, Place place) throws SQLException{
		List<PlaceItem> placeItemList = new ArrayList<PlaceItem>();
		PlaceItem placeItem;

		while (resultSet.next()) {
			int id = resultSet.getInt(1);
			String name = resultSet.getString(2);
			String description = resultSet.getString(3);
			double price = resultSet.getDouble(4);
			String imageLink = resultSet.getString(5);

			placeItem = new PlaceItem(id, name, description, price, imageLink, place);
			placeItemList.add(placeItem);
		}

		return placeItemList;
	}
}
