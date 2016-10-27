package org.jala.efeeder.imports;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

import org.jala.efeeder.places.Place;
import org.jala.efeeder.places.PlaceManager;

public class ImportPlaceHandler implements ImportHandler {
	private static final String SEP = ", ";

	private final PlaceManager placeManager;
	
	public ImportPlaceHandler(Connection connection) {
		placeManager = new PlaceManager(connection);
	}

	@Override
	public ImportResult importObject(List<String> values, Object object) throws Exception {
		ImportResult importResult = new ImportResult();

		String name = values.get(1);
		String description = values.get(2);
		String phone = values.get(3);
		String direction = values.get(4);
		String imageLink = values.get(5);

		Place place = new Place(-1, name, description, phone, direction, imageLink);

		try {
			placeManager.insertPlace(place);
			importResult.setObjectImported(place);

		} catch (SQLException e) {
			StringBuilder importLine = new StringBuilder().append("Import Place: ").append(name).append(SEP).append(description)
					.append(SEP).append(phone).append(SEP).append(direction).append(SEP).append(imageLink);

			importResult.setMessageLog(String.format("ERROR: %s At the moment to import the following line: %s",
					e.getMessage(), importLine));
			importResult.setSuccessful(false);
		}
		
		return importResult;
	}

}
