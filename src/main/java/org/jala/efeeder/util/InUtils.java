/**
 * 
 */
package org.jala.efeeder.util;

import javax.servlet.http.HttpServletRequest;

import org.jala.efeeder.api.command.In;

/**
 * @author Patricia Escalera
 *
 */
public final class InUtils {

	private In parameters;

	public InUtils(In parameters) {
		this.parameters = parameters;
	}

	public String getStringParameter(String paramName) {
		String parameter = parameters.getParameter(paramName);
		return parameter;
	}

	public Float getFloatParameter(String paramName) {
		try {
			return Float.valueOf(parameters.getParameter(paramName));
		} catch (NullPointerException npe) {
			// Do nothing and return null
			return null;
		}
	}

	public Integer getIntegerParameter(String paramName) {
		try {
			return Integer.valueOf(parameters.getParameter(paramName));
		} catch (NullPointerException npe) {
			// Do nothing and return null
			return null;
		}
	}

	public Double getDoubleParameter(String paramName) {
		try {
			return Double.valueOf(parameters.getParameter(paramName));
		} catch (NullPointerException npe) {
			// Do nothing and return null
			return null;
		}
	}
}
