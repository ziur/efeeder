package org.jala.efeeder.places;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.places.Place;


@Command
public class PlaceListPageCommand  implements CommandUnit {

	private static final String ALL_PLACE_QUERY = "select * from places";
	@Override
	public Out execute(In parameters) throws Exception {
		Connection connection = parameters.getConnection();
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
		Out out = new DefaultOut();
		out.addResult("places", places);
		return out.forward("place/placeList.jsp");
	}
}
