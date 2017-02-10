package org.jala.efeeder.places;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@Command
public class PlaceProfileCommand extends MockCommandUnit {
	private static final Logger LOG = Logger.getLogger(SearchPlaceCommand.class.getName());
	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();
		PlaceManager managerPlace = new PlaceManager(parameters.getConnection());
		PlaceItemManager managerPlaceItem = new PlaceItemManager(parameters.getConnection());
		int idPlace = 0;
		try {
			idPlace = Integer.parseInt(parameters.getParameter("id"));
		}
		catch(Exception exception) {
			LOG.info("Not foud place");
		}
		Place place = managerPlace.getPlaceById(idPlace); 
		out.addResult("place", place);
		List<PlaceItem> listItem = managerPlaceItem.getPlaceItemByPlace(place);
		out.addResult("placeItems", listItem);
		return out.forward("place/placeProfile.jsp");
	}
}