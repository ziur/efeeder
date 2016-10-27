package org.jala.efeeder.imports;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import org.jala.efeeder.places.ItemPlace;
import org.jala.efeeder.places.ItemPlaceManager;
import org.jala.efeeder.places.Place;

public class ImportItemHandler implements ImportHandler {
	private static final String SEP = ", ";

	private final ItemPlaceManager itemPlaceManager;
	
	public ImportItemHandler(Connection connection) {
		itemPlaceManager = new ItemPlaceManager(connection);
	}

	@Override
	public ImportResult importObject(List<String> values, Object place) {
		ImportResult importResult = new ImportResult();
		StringBuilder importLine = new StringBuilder();

		try {
			String name = values.get(1);
			String description = values.get(2);
			double price = Double.valueOf(values.get(3));
			String imageLink = values.get(4);
			
			importLine= new StringBuilder().append("Import Item: ").append(name).append(SEP).append(description)
					.append(SEP).append(price).append(SEP).append(imageLink);

			ItemPlace itemPlace = new ItemPlace(name, description, price, imageLink, (Place)place);

			itemPlaceManager.insertItemPlace(itemPlace);

		} catch (SQLException e) {
			importResult.setMessageLog(String.format("ERROR: %s At the moment to import the following line: %s",
					e.getMessage(), importLine));
			importResult.setSuccessful(false);
		} catch (NullPointerException e) {
			importResult.setMessageLog(String.format("ERROR: You need to have a valid PLACE line before  it %s",
					importLine));
			importResult.setSuccessful(false);
		}

		return importResult;
	}

}
