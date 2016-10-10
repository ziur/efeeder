
package org.jala.efeeder.places;

import static java.sql.Statement.RETURN_GENERATED_KEYS;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;
import org.jala.efeeder.suggestion.Place;

/**
 *
 * @author ricardo_ramirez
 */
@Command
public class CreatePlaceCommand implements CommandUnit {
	private static final String UPDATE_PLACE_QUERY = "INSERT INTO places(name, description, phone, direction, image_link) values(?, ?, ?, ?, ?)";

	@Override
	public Out execute(In parameters) throws Exception {
		int placeId;
		PreparedStatement prepareStatement = parameters.getConnection().prepareStatement(UPDATE_PLACE_QUERY, RETURN_GENERATED_KEYS);
		prepareStatement.setString(1, parameters.getParameter("name"));
		prepareStatement.setString(2, parameters.getParameter("description"));
		prepareStatement.setString(3, parameters.getParameter("phone"));
		prepareStatement.setString(4, parameters.getParameter("address"));
		prepareStatement.setString(5, parameters.getParameter("image_link"));
		prepareStatement.executeUpdate();
		ResultSet generatedKeys = prepareStatement.getGeneratedKeys();
		generatedKeys.next();
		placeId = generatedKeys.getInt(1);

		Place place = new Place(placeId, parameters.getParameter("name"), 
								parameters.getParameter("description"), parameters.getParameter("phone"),
								parameters.getParameter("address"), parameters.getParameter("image_link"));
		return OutBuilder.response("application/json", JsonConverter.objectToJSON(place));
	}
}