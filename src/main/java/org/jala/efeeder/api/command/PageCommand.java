/**
 * 
 */
package org.jala.efeeder.api.command;

import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.common.ErrorMessage;

/**
 * @author Patricia Escalera This class was created to process errors
 *         differently for normal POSTS coming from jsps as a normal request and
 *         requests coming from events as a jason message.
 * 
 */
public abstract class PageCommand extends AbstractCommandUnit {

	/**
	 * The Constructor
	 */
	public PageCommand() {
		super();

	}

	/**
	 * TODO For now, all error messages are concatenated. Future versions should
	 * handle the list of ErrorMessage in order to display the messages properly
	 * in jsp pages.
	 */
	@Override
	public Out getErrorResponse() {
		Out out = new DefaultOut();
		StringBuilder messageText = new StringBuilder();
		for (ErrorMessage errorMsg : this.errorManager.getAllErrorMessages()) {
			messageText.append(errorMsg.getMessage()).append("\n");
		}
		out.addResult(ErrorMessage.KEY_ERROR_MESSAGE, messageText.toString());
		out.setExitStatus(ExitStatus.ERROR);
		return out;
	}

}
