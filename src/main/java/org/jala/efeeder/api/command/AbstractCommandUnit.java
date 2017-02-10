/**
 * 
 */
package org.jala.efeeder.api.command;

import java.util.HashMap;

import java.util.Map;
import org.jala.efeeder.api.command.DisplayBean;
import org.jala.efeeder.common.ErrorManager;
import org.jala.efeeder.util.InUtils;
import lombok.Getter;
import lombok.Setter;

/**
 * The Class AbstractCommandUnit
 *
 * @author Patricia Escalera
 */
public abstract class AbstractCommandUnit implements CommandUnit {

	@Setter
	@Getter
	protected int foodMeetingId = 0;
	@Setter
	protected int userId = 0;

	// HttpServletRequest request;
	@Getter
	protected In parameters;

	/** Display bean to be passed to the JSP page */
	private DisplayBean displayBean;

	/**
	 * The InUtils which is built from parameters and it can be used to access
	 * all parameters coming from the servlet
	 */
	protected InUtils inUtils;

	/**
	 * key: fieldName value: Message
	 */
	@Getter
	protected Map<String, String> errors = new HashMap<String, String>();
	
	protected ErrorManager errorManager = null;

	/**
	 * Instantiates a new abstract command unit.
	 */
	public AbstractCommandUnit() {
		super();
	}

	@Override
	public void setIn(In parameters) {
		this.parameters = parameters;
		this.inUtils = new InUtils(parameters);
	}

	/**
	 * Perform any initialization work that needs to be done before the command
	 * begins any of its work. Does nothing by default.
	 *
	 * @return true if initialization was successful
	 */
	public boolean initialize() {
		errorManager = new ErrorManager();
		if (parameters == null) {
			return false;
		}
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
