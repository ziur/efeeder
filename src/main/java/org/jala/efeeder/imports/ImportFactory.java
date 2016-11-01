package org.jala.efeeder.imports;

import java.sql.Connection;

public class ImportFactory {
	private static final String PLACE = "PLACE";
	private static final String ITEM = "ITEM";
	private final Connection connection;
	
	public ImportFactory(Connection connection) {
		this.connection = connection;
	}

	public ImportHandler getHandler(String type) {
		ImportHandler importHandler = null;

		switch (type) {
			case PLACE:
				importHandler = new ImportPlaceHandler(connection);
				break;
			case ITEM:
				importHandler = new ImportItemHandler(connection);
				break;
			default:
				break;
		}
		
		return importHandler;
	}
}
