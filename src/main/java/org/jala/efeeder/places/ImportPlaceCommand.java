package org.jala.efeeder.places;

import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.ExitStatus;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;
import org.jala.efeeder.imports.ImportFactory;
import org.jala.efeeder.imports.ImportHandler;
import org.jala.efeeder.imports.ImportResult;

/**
 * 
 * @author Roger Ayaviri
 *
 */
@Command
public class ImportPlaceCommand extends MockCommandUnit {
	final static Logger logger = Logger.getLogger(ImportPlaceCommand.class);

	@Override
	public Out execute(In in) throws Exception {
		ExitStatus status = ExitStatus.SUCCESS;

		StringBuilder messageLog = new StringBuilder();
		messageLog.append("Total lines successful = %1$d");
		messageLog.append(System.getProperty("line.separator"));
		messageLog.append("Total lines failed = %2$d");
		messageLog.append(System.getProperty("line.separator"));

		ImportFactory importFactory = new ImportFactory(in.getConnection());
		ImportHandler importHandler = null;
		ImportResult importResult = null;

		String result = "";

		Place currentPlace = null;

		Map<String, List<String>> placeOrItems = in.getAllParameters();

		int size = placeOrItems.size();
		int countCorrectImport = 0;
		int countfailImport = 0;

		for (int key = 0; key < size; key++) {
			List<String> values = placeOrItems.get(String.valueOf(key));

			if (values.size() > 0) {

				importHandler = importFactory.getHandler(values.get(0));
				importResult = importHandler.importObject(key, values, currentPlace);
				if (importResult.isSuccessful()) {
					if (importResult.getObjectImported() instanceof Place) {
						currentPlace = (Place) importResult.getObjectImported();
					}
					countCorrectImport++;
				}
				else {
					countfailImport++;
					messageLog.append(importResult.getMessageLog());
					messageLog.append(System.getProperty("line.separator"));
				}
			}
		}

		result = JsonConverter.objectToJSON(String.format(messageLog.toString(), countCorrectImport, countfailImport));

		return OutBuilder.response("application/json", result, status);
	}
}