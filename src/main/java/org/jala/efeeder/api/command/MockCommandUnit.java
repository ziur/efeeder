/**
 * 
 */
package org.jala.efeeder.api.command;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.common.ErrorManager;
import org.jala.efeeder.common.ErrorMessage;
import org.jala.efeeder.servlets.websocket.avro.ErrorEvent;
import org.jala.efeeder.util.InUtils;

/**
 * @author Patricia Escalera
 * All classes not implemented with checkParameters() and error handling inherit from this class.
 * This is supposed to disappear because it was created to help the transition of all Commands to the new
 * way architecture. 
 * TODO Change all XXXCommand classes to inherit from PageCommand or EventCommand
 *
 */
public abstract class MockCommandUnit implements CommandUnit {

	protected String nextPage;
	
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

	@Override
	public boolean initialize() {
		errorManager = new ErrorManager();
		if (parameters == null) {
			return false;
		}
		this.inUtils = new InUtils(parameters);
		return true;
	}

	public int getFoodMeetingId() {
		return 0;
	}

	@Override
	public Out getErrorResponse() {
		return new DefaultOut();
	}

	public String getNextPage() {
		return this.nextPage;
	}
}
