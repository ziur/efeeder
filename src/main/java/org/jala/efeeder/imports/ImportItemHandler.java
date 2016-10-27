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
	private StringBuilder importLine;
	private String name;
	private String description;
	private double price;
	private String imageLink;
	private Place placeParent;

	public ImportItemHandler(Connection connection) {
		itemPlaceManager = new ItemPlaceManager(connection);
	}

	@Override
	public ImportResult importObject(int lineNumber, List<String> values, Object place) {
		ImportResult importResult = new ImportResult();

		try {
			StringBuilder errorMessage = validItems(lineNumber, values, place);
			if(errorMessage.length() == 0) {
				ItemPlace itemPlace = new ItemPlace(name, description, price, imageLink, placeParent);

				itemPlaceManager.insertItemPlace(itemPlace);
			}
			else {
				importResult.setMessageLog(errorMessage.toString());
				importResult.setSuccessful(false);
			}

		} catch (SQLException e) {
			importResult.setMessageLog(String.format("ERROR: %s At the moment to import the following line: %s",
					e.getMessage(), importLine));
			importResult.setSuccessful(false);
		}

		return importResult;
	}

	private StringBuilder validItems(int lineNumber, List<String> values, Object place) {
		StringBuilder errorMessage = new StringBuilder();

		if (values.size() < 5) {
			errorMessage.append(String.format("SKIP: the line %1$i doesn't have the field required for a ITEM", lineNumber));
			return errorMessage;
		}

		name = values.get(1);
		description = values.get(2);
		price = Double.valueOf(values.get(3));
		imageLink = values.get(4);
		placeParent = (Place)place;

		importLine= new StringBuilder().append("Import Item: ").append(name).append(SEP).append(description)
				.append(SEP).append(price).append(SEP).append(imageLink);

		if (placeParent == null) {
			errorMessage.append(String.format("SKIP: You need to have a valid PLACE before  %s", importLine));
		}

		return errorMessage;
	}

}
