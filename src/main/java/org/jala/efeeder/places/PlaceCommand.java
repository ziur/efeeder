package org.jala.efeeder.places;
import org.jala.efeeder.api.command.*;
import java.sql.Connection;
import static java.sql.Statement.RETURN_GENERATED_KEYS;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;

@Command
public class PlaceCommand implements CommandUnit {
	
	@Override 
	public Out execute(In parameters) throws Exception {
		PlaceManager placeManager = new PlaceManager(parameters.getConnection());
		int id = Integer.parseInt(parameters.getParameter("id"));
		Place place = placeManager.getPlaceById(id);
		place.setPlaceItems(null);
		return OutBuilder.response("application/json", JsonConverter.objectToJSON(place));
	}
}
