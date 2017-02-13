/**
 * 
 */
package org.jala.efeeder.api.command;

import org.jala.efeeder.common.ErrorMessage;

/**
 * @author Patricia Escalera
 *
 */
public abstract class PageCommand extends AbstractCommandUnit {

	/**
	 * 
	 */
	public PageCommand() {
		super();

	}
	/* (non-Javadoc)
	 * @see org.jala.efeeder.api.command.CommandUnit#getErrorResponse()
	 */
	@Override
	public Out getErrorResponse() {
		Out out = OutBuilder.DEFAULT;
		StringBuilder messageText = new StringBuilder();
		for (ErrorMessage errorMsg : this.errorManager.getAllErrorMessages()) {
			messageText.append(errorMsg.getMessage()).append("\n");
		}
		out.addResult(ErrorMessage.KEY_ERROR_MESSAGE, messageText.toString());
		return out;
	}

}
