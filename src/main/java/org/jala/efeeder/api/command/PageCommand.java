/**
 * 
 */
package org.jala.efeeder.api.command;

import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.common.ErrorMessage;

/**
 * @author Patricia Escalera This class was created to process errors
 *         differently for normal posts with jsps and jason from those coming
 *         from events.
 *         
 */
public abstract class PageCommand extends AbstractCommandUnit {

	/**
	 * 
	 */
	public PageCommand() {
		super();

	}
	/**
	 * TODO For now, all error messages are concatenated.
	 * Future versions should handle the list of ErrorMessage in
	 * order to display the messages properly in jsp pages.  
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
