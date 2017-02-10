package org.jala.efeeder.places;

import java.sql.Connection;

import org.jala.efeeder.api.command.AbstractCommandUnit;
import org.jala.efeeder.api.command.Command;

import org.jala.efeeder.api.command.ExitStatus;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;

/**
 *
 * @author ricardo_ramirez
 */
@Command
public class CreatePlaceItemCommand extends AbstractCommandUnit {

	public static String KEY_ITEM_PRICE = "item-price";
	@Override
	public boolean checkParameters() {
		
		Float price = inUtils.getFloatParameter(KEY_ITEM_PRICE);
		String message = "";
		if (price <= 0) {
			message = "The item price should be greater than zero";
			errors.put("CREATE_PLACE-ITEM-1", message);
			errorManager.addErrorString(message);
			return false;
		}
		
		return true;
	}
	@Override
	public Out execute() throws Exception {
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