package org.jala.efeeder.places;

import static java.sql.Statement.RETURN_GENERATED_KEYS;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.jala.efeeder.foodmeeting.FoodMeeting;

/**
 * 
 * @author amir_aranibar
 *
 */
public class PlaceManager {

	private static final String INSERT_PLACE_QUERY = "INSERT INTO places(name, description, phone, direction, image_link) values(?, ?, ?, ?, ?)";
	private static final String SELECT_PLACE_QUERY = "SELECT p.id, p.name, p.description, p.phone, p.direction, p.image_link FROM places p ";
	private static final String BY_FOOD_MEETING_ID_QUERY = " , food_meeting fm WHERE p.id = fm.id_place AND fm.id = ? ";
	private static final String BY_ID_QUERY = " WHERE p.id = ? ";
	private static final String ALL_PLACE_QUERY = "select * from places";

	private final Connection connection;
	private final PlaceItemManager placeManager;

	public PlaceManager(Connection connection) {
		this.connection = connection;
		this.placeManager = new PlaceItemManager(connection);
	}

	public void insertPlace(Place place) throws SQLException {
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

	public Place getPlaceByFoodMeeting(FoodMeeting foodMeeting) throws SQLException {
		PreparedStatement stm = connection.prepareStatement(SELECT_PLACE_QUERY + BY_FOOD_MEETING_ID_QUERY);

		stm.setInt(1, foodMeeting.getId());

		ResultSet resultSet = stm.executeQuery();
		
		return createPlaceByResultSet(resultSet);
	}
	
	public Place getPlaceById(int idPlace) throws SQLException {
		PreparedStatement stm = connection.prepareStatement(SELECT_PLACE_QUERY + BY_ID_QUERY);

		stm.setInt(1, idPlace);

		ResultSet resultSet = stm.executeQuery();

		return createPlaceByResultSet(resultSet);
	}
	
	public List<Place> getAllPlace() throws SQLException {
		PreparedStatement preparedStatement	= connection.prepareStatement(ALL_PLACE_QUERY);
		ResultSet resultSet = preparedStatement.executeQuery();
		List<Place> places = new ArrayList<>();
		while(resultSet.next()) {
			places.add(new Place(resultSet.getInt("id"), 
				resultSet.getString("name"),
				resultSet.getString("description"),
				resultSet.getString("phone"),
				resultSet.getString("direction"),
				resultSet.getString("image_link")));
		}
		return places;
	}

	private Place createPlaceByResultSet(ResultSet resultSet) throws SQLException{
		Place place = null;

		if (resultSet.next()) {
			int id = resultSet.getInt(1);
			String name = resultSet.getString(2);
			String description = resultSet.getString(3);
			String phone = resultSet.getString(4);
			String direction = resultSet.getString(5);
			String image_link = resultSet.getString(6);

			place = new Place(id, name, description, phone, direction, image_link);
			place.setPlaceItems(placeManager.getPlaceItemByPlace(place));
		}

		return place;
	}

}
