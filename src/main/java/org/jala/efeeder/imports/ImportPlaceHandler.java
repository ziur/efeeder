package org.jala.efeeder.imports;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import org.jala.efeeder.places.Place;
import org.jala.efeeder.places.PlaceManager;

public class ImportPlaceHandler implements ImportHandler {
	private static final String SEP = ", ";

	private final PlaceManager placeManager;
	private StringBuilder importLine;
	private String name;
	private String description;
	private String phone;
	private String direction;
	private String imageLink;

	public ImportPlaceHandler(Connection connection) {
		placeManager = new PlaceManager(connection);
	}

	@Override
	public ImportResult importObject(int lineNumber, List<String> values, Object object) throws Exception {
		ImportResult importResult = new ImportResult();

		try {
			StringBuilder errorMessage = validItems(lineNumber, values);

			if (errorMessage.length() == 0) {
				Place place = new Place(name, description, phone, direction, imageLink);
				placeManager.insertPlace(place);
				importResult.setObjectImported(place);
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

	private StringBuilder validItems(int lineNumber, List<String> values) {
		StringBuilder errorMessage = new StringBuilder();

		if (values.size() < 5) {
			errorMessage
					.append(String.format("SKIP: the line %1$i doesn't have the field required for PLACE", lineNumber));
			return errorMessage;
		}

		name = values.get(1);
		description = values.get(2);
		phone = values.get(3);
		direction = values.get(4);
		imageLink = values.get(5);

		importLine = new StringBuilder().append("Import Place: ").append(name).append(SEP).append(description)
				.append(SEP).append(phone).append(SEP).append(direction).append(SEP).append(imageLink);

		return errorMessage;
	}

}
