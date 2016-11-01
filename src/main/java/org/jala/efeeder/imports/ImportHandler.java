package org.jala.efeeder.imports;

import java.util.List;

public interface ImportHandler {
	
	ImportResult importObject(int lineNumber, List<String> values, Object parentObject) throws Exception;

}
