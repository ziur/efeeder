/**
 * 
 */
package org.jala.efeeder.api.command;

import java.util.Collections;
import java.util.Map;

import org.jala.efeeder.common.ErrorManager;
import org.jala.efeeder.util.InUtils;

/**
 * @author Patricia Escalera
 *
 */
public abstract class MockCommandUnit implements CommandUnit {

	DisplayBean displayBean;
	/**
	 * 
	 */
	protected In parameters;

	protected InUtils inUtils;
	
	protected ErrorManager errorManager;

	public MockCommandUnit() {
		super();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.jala.efeeder.api.command.CommandUnit#checkParameters(org.jala.efeeder
	 * .api.command.In)
	 */
	@Override
	public boolean checkParameters() {
		// TODO by all subclasses .
		return true;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.jala.efeeder.api.command.CommandUnit#getDisplayBean()
	 */
	@Override
	public DisplayBean getDisplayBean() {
		return displayBean;
	}

	@Override
	public void setIn(In parameters) {
		inUtils = new InUtils(parameters);
		this.parameters = parameters;
	}

	public Map<String, String> getErrors() {
		return Collections.<String, String>emptyMap();
	}

	@Override
	public boolean initialize() {
		errorManager = new ErrorManager();
		if (parameters == null) {
			return false;
		}
		this.inUtils = new InUtils(parameters);
		return true;
	}
	@Override
	public int getFoodMeetingId(){
		return 0;
	}

}
