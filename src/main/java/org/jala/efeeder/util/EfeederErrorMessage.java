package org.jala.efeeder.util;

import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.order.CreateOrderCommand;

public class EfeederErrorMessage {
	
	static String DUPLICATE_KEY_ORDER = "El Item ya fue ingresado, porfavor seleccione otro."; 
	
	public static String getEfeederMessage(String errorMessage, CommandUnit command) {
		
		String error = "";
		if (errorMessage.startsWith("Duplicate entry") && command instanceof CreateOrderCommand){
			error = DUPLICATE_KEY_ORDER;
		}
		
		return error;
	}

}
