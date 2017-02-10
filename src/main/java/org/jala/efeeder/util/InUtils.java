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
	
	public String getStringParameter(String paramName){
		String parameter = parameters.getParameter(paramName);
		return parameter;
	}
	public float getFloatParameter(String paramName){
		return Float.valueOf(parameters.getParameter(paramName));
	}
	public int getIntegerParam(String paramName){
		return Integer.valueOf(parameters.getParameter(paramName));
	}
	public double getDoubleParam(String paramName){
		return Double.valueOf(parameters.getParameter(paramName));
	}
}
