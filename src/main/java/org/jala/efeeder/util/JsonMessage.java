package org.jala.efeeder.util;

import lombok.Data;

@Data
public class JsonMessage {
	String message = "";

	public JsonMessage(String message) {
		this.message = message;
	}

}
