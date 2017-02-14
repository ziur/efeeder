/**
 * 
 */
package org.jala.efeeder.common;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jala.efeeder.servlets.websocket.avro.MessageContext;



/**
 * @author Patricia Escalera
 *
 */
public class ErrorManager {

	protected List<ErrorMessage> errorMessages = new ArrayList<ErrorMessage>(5);

	/**
	 * Constructor for ErrorManager.
	 */
	public ErrorManager() {
		super();
	}

	/**
	 *
	 * @param errorMessage
	 *            a populated ErrorMessage object
	 * @return {@link ErrorMessage}
	 */
	public ErrorMessage addError(ErrorMessage errorMessage) {
		// add the error to the list
		errorMessages.add(errorMessage);

		return errorMessage;
	}
	//TODO check if the change for addError() only
	public void addErrorString(String message) {
		// Create an ErrorMessage object to add
		addError(
				new ErrorMessage(message));
	}
	
	public Collection<ErrorMessage> getAllErrorMessages(){
		return errorMessages;
	}
	
	/**
	 * This allows to concat a list of error messages in one String
	 */
	public static String getConcatMessages(Collection<ErrorMessage> listOfErrors){
		StringBuilder messageText = new StringBuilder();
		for (ErrorMessage errorMsg : listOfErrors) {
			messageText.append(errorMsg.getMessage()).append("\n");
		}
		return messageText.toString();
	}

}
