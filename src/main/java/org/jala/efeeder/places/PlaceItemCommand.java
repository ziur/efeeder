package org.jala.efeeder.places;
import org.jala.efeeder.api.command.*;
import java.sql.Connection;
import static java.sql.Statement.RETURN_GENERATED_KEYS;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.jala.efeeder.api.utils.JsonConverter;

@Command
public class PlaceItemCommand extends MockCommandUnit {
	
	@Override
	public Out execute() throws Exception {
		PlaceItemManager managerPLaceItem = new PlaceItemManager(parameters.getConnection());
		int id = Integer.parseInt(parameters.getParameter("id"));
		PlaceItem placeItem = managerPLaceItem.getPlaceItemById(id);
		return OutBuilder.response("application/json", JsonConverter.objectToJSON(placeItem));
	}
}
