
package org.jala.efeeder.places;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

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

	@Override
	public Out execute(In parameters) throws Exception {
		ExitStatus status = ExitStatus.SUCCESS;

		StringBuilder messageLog = new StringBuilder();
		
		String result = "";

		List<String> lines = parameters.getParameters("lines");

		PlaceManager placeManager = new PlaceManager(parameters.getConnection());

		Place currentPlace = null;

		for (String line : lines) {

			messageLog.append("Import: " + line);
			messageLog.append(System.getProperty("line.separator"));

			String[] placeData = line.split(",");

			if (placeData[0].length() > 0) {
				if ("PLACE".equals(placeData[0]) && placeData.length == 6) {
					currentPlace = new Place(-1, placeData[1], placeData[2], placeData[3], placeData[4], placeData[5]);

					try {
						placeManager.insertPlace(currentPlace);

						messageLog.append("PLACE WAS CORRECTLY IMPORT");
						messageLog.append(System.getProperty("line.separator"));

					} catch (SQLException e) {
						status = ExitStatus.FAIL;
						messageLog.append("ERROR: " + e.getMessage());
						messageLog.append(System.getProperty("line.separator"));
					}
				}
			}
		}

		result = JsonConverter.objectToJSON(messageLog);
		
		return OutBuilder.response("application/json", result, status);
	}
}