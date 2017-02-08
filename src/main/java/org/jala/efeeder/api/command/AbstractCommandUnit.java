/**
 * 
 */
package org.jala.efeeder.api.command;

import javax.servlet.http.HttpServletRequest;

import org.jala.efeeder.api.command.DisplayBean;
import org.jala.efeeder.util.InUtils;

import lombok.Setter;


/**
 * The Class AbstractCommandUnit
 *
 * @author Patricia Escalera
 */
public abstract class AbstractCommandUnit implements CommandUnit {
	
	@Setter
	protected int foodMeetingId = 0;
	
	//HttpServletRequest request;
	
	protected In parameters;
	
	/** Display bean to be passed to the JSP page */
	private DisplayBean displayBean;
	
	
	/** The InUtils. */
	protected InUtils inUtils;
	
	
	/**
	 * Instantiates a new abstract command unit.
	 */
	public AbstractCommandUnit() {
		super();
	}
	@Override
	public void setIn(In parameters){
		this.parameters = parameters;
	}
	
	/**
	 * Perform any initialization work that needs to be done before the
	 * command begins any of its work.  Does nothing by default.
	 *
	 * @return	true if initialization was successful
	 */
	public boolean initialize(){
		this.inUtils = new InUtils(parameters);
		return true;
	}
	
	public final void setDisplayBean(DisplayBean bean) {
		this.displayBean = bean;
	}
	
	@Override
	public DisplayBean getDisplayBean() {
		return displayBean;
	}

	
}
