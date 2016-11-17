package org.jala.efeeder.places;

import java.sql.Connection;
import java.util.List;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;

/**
 *
 * @author Roger
 */
@Command
public class GetItemsByPlaceCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		
		Connection connection = parameters.getConnection();
		
		int idPlace = Integer.parseInt(parameters.getParameter("idPlace"));
		Place place = new PlaceManager(connection).getPlaceById(idPlace);

		PlaceItemManager placeItemManager = new PlaceItemManager(parameters.getConnection());
		List<PlaceItem> placeItems = placeItemManager.getPlaceItemByPlaceWithoutPlace(place);

		return OutBuilder.response("application/json", JsonConverter.objectToJSON(placeItems));
	}
}
