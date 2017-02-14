package org.jala.efeeder.places;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.ExitStatus;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.command.PageCommand;
import org.jala.efeeder.api.utils.JsonConverter;

/**
 *
 * @author ricardo_ramirez
 */
@Command
public class CreatePlaceItemCommand extends PageCommand {

	public static String KEY_ITEM_PRICE = "item-price";
	public static String KEY_ITEM_NAME = "item-name";

	@Override
	public boolean checkParameters() {
		Float price = inUtils.getFloatParameter(KEY_ITEM_PRICE);
		String message = "";
		if (price == null || price <= 0) {
			message = "The price is not a valid value";
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
		Double price = inUtils.getDoubleParameter(KEY_ITEM_PRICE);
		String imageLink = parameters.getParameter("image-link");
		PlaceItem placeItem = new PlaceItem(name, description, price, imageLink, place);
		PlaceItemManager placeItemManager = new PlaceItemManager(parameters.getConnection());
		placeItemManager.insertPlaceItem(placeItem);
		placeItem.setPlace(null);
		return OutBuilder.response("application/json", JsonConverter.objectToJSON(placeItem), ExitStatus.SUCCESS);
	}
	/**
	 * This command is being called by ajax, so we add the exitStatus in order to
	 * be identified as error the js who's waiting for a response.
	 */
	@Override
	public Out getErrorResponse() {
		Out out = super.getErrorResponse();
		//String errorText = ErrorManager.getConcatMessages(this.errorManager.getAllErrorMessages());
		//Out out = OutBuilder.response("application/json", JsonConverter.objectToJSON(errorText), ExitStatus.ERROR);
		//out.addResult(ErrorMessage.KEY_ERROR_MESSAGE, errorText);
		return out;
	}


}