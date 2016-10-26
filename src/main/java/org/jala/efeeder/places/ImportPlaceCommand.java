package org.jala.efeeder.places;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.ExitStatus;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;

/**
 * 
 * @author Roger Ayaviri
 *
 */
@Command
public class ImportPlaceCommand implements CommandUnit {
	private final String SEP = ", "; 

	@Override
	public Out execute(In in) throws Exception {
		ExitStatus status = ExitStatus.SUCCESS;

		StringBuilder messageLog = new StringBuilder();

		String result = "";

		PlaceManager placeManager = new PlaceManager(in.getConnection());
		ItemPlaceManager itemPlaceManager = new ItemPlaceManager(in.getConnection());

		Place currentPlace = null;
		ItemPlace itemPlace = null;

		StringBuilder importLine = null;

		Map<String, List<String>> placeOrItems = in.getAllParameters();

		int size = placeOrItems.size();

		for (int key = 0; key < size; key++) {
			List<String> values = placeOrItems.get(String.valueOf(key));

			if (values.size() > 0) {
				String type = values.get(0);

				String name = "";
				String description = "";
				String imageLink = "";

				switch (type) {
					case "PLACE":
						name = values.get(1);
						description = values.get(2);
						String phone = values.get(3);
						String direction = values.get(4);
						imageLink = values.get(5);
	
						importLine = new StringBuilder().append("Import Place: ").append(name).append(SEP).append(description)
								.append(SEP).append(phone).append(SEP).append(direction).append(SEP).append(imageLink);
	
						messageLog.append(importLine);
						messageLog.append(System.getProperty("line.separator"));
	
						currentPlace = new Place(-1, name, description, phone, direction, imageLink);
	
						try {
							placeManager.insertPlace(currentPlace);
	
							messageLog.append("PLACE WAS CORRECTLY IMPORT");
							messageLog.append(System.getProperty("line.separator"));
							messageLog.append(System.getProperty("line.separator"));
	
						} catch (SQLException e) {
							status = ExitStatus.FAIL;
							messageLog.append("ERROR: " + e.getMessage());
							messageLog.append(System.getProperty("line.separator"));
							messageLog.append(System.getProperty("line.separator"));
						}
						
						break;

					case "ITEM":
						name = values.get(1);
						description = values.get(2);
						double price = Double.valueOf(values.get(3));
						imageLink = values.get(4);
	
						importLine = new StringBuilder().append("Import Item: ").append(name).append(SEP).append(description)
								.append(SEP).append(price).append(SEP).append(imageLink);
	
						messageLog.append(importLine);
						messageLog.append(System.getProperty("line.separator"));
	
						itemPlace = new ItemPlace(name, description, price, imageLink, currentPlace);
	
						try {
							itemPlaceManager.insertItemPlace(itemPlace);
	
							messageLog.append("ITEM WAS CORRECTLY IMPORT");
							messageLog.append(System.getProperty("line.separator"));
							messageLog.append(System.getProperty("line.separator"));
	
						} catch (SQLException e) {
							status = ExitStatus.FAIL;
							messageLog.append("ERROR: " + e.getMessage());
							messageLog.append(System.getProperty("line.separator"));
							messageLog.append(System.getProperty("line.separator"));
						}
						break;
	
					default:
						break;
				}
			}
		}

		result = JsonConverter.objectToJSON(messageLog);

		return OutBuilder.response("application/json", result, status);
	}
}