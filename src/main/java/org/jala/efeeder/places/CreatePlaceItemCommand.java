package org.jala.efeeder.places;

import java.sql.Connection;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.ExitStatus;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;

/**
 *
 * @author ricardo_ramirez
 */
@Command
public class CreatePlaceItemCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		PlaceManager placeManager = new PlaceManager(parameters.getConnection());
		Place place = placeManager.getPlaceById(Integer.valueOf(parameters.getParameter("id-place")));
		String name = parameters.getParameter("item-name");
		String description = parameters.getParameter("item-description");
		double price = Double.valueOf(parameters.getParameter("item-price"));
		String imageLink = parameters.getParameter("image-link");
		PlaceItem placeItem = new PlaceItem(name, description, price, imageLink, place);
		PlaceItemManager placeItemManager = new PlaceItemManager(parameters.getConnection());
		placeItemManager.insertPlaceItem(placeItem);
		placeItem.setPlace(null);
		return OutBuilder.response("application/json", JsonConverter.objectToJSON(placeItem), ExitStatus.SUCCESS);
	}
}