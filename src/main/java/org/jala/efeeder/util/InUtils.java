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
	/**
	 * 
	 * @param paramName The parameter stocked in the request object
	 * @return 0 if the parameter cannot be found in parameters object
	 */
	public float getFloatParameter(String paramName) {
		try {
			return Float.valueOf(parameters.getParameter(paramName));
		} catch (NullPointerException npe) {
			return 0;
		}
	}

	public int getIntegerParam(String paramName) {
		return Integer.valueOf(parameters.getParameter(paramName));
	}

	public double getDoubleParam(String paramName) {
		return Double.valueOf(parameters.getParameter(paramName));
	}
}
