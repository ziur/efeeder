/**
 * 
 */
package org.jala.efeeder.api.command;

/**
 * The Class AbstractCommandUnit
 *
 * @author Patricia Escalera
 */
public abstract class AbstractCommandUnit implements CommandUnit {

	/** Display bean to be passed to the JSP page */
	private DisplayBean displayBean;

	/**
	 * Instantiates a new abstract command unit.
	 */
	public AbstractCommandUnit() {
		super();
	}
	//@Override
	DisplayBean getDisplayBean() {
		return displayBean;
	}
	
	boolean checkParameters(){
		return true;
	}
	
}
