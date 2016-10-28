package org.jala.efeeder.imports;

import lombok.Data;

@Data
public class ImportResult {
	boolean successful = true;
	String messageLog = "";
	Object objectImported = null;

	public ImportResult() {

	}
}