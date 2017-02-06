/**
 * 
 */
package org.jala.efeeder.api.command;

/**
 * Class containing data to be sent to the browser. Each class *Command should have
 * its own DisplayBean
 * 
 * @author Patricia Escalera
 *
 */
public interface DisplayBean {
	
	// The name under which display bean is stored in the request object
	public static final String DISPLAY_BEAN_ATTRIBUTE = "DisplayBean";
}
