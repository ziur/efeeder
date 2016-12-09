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
public class PlaceItemCommand implements CommandUnit {
	
	@Override
	public Out execute(In paramters) throws Exception {
		PlaceItemManager managerPLaceItem = new PlaceItemManager(paramters.getConnection());
		int id = Integer.parseInt(paramters.getParameter("id"));
		PlaceItem placeItem = managerPLaceItem.getPlaceItemById(id);
		return OutBuilder.response("application/json", JsonConverter.objectToJSON(placeItem));
	}
}
