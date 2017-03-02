package org.jala.efeeder.api.command;

// TODO: Auto-generated Javadoc
/**
 * Created by alejandro on 07-09-16.
 *
 * @author Patricia Escalera The Interface CommandUnit.
 */
public interface CommandUnit {

	
	/**
	 * The parameters that this Command will use.
	 *
	 * @param parameters
	 *            the new in
	 */
	public void setIn(In parameters);

	
	/**
	 * Check parameters.  Each subclass should implement this in order to validate the
	 * input parameters passed to this class.  
	 *
	 * @return true, if successful
	 */
	public boolean checkParameters();

	/**
	 * Execute.
	 *
	 * @return the out
	 * @throws Exception
	 *             the exception
	 */
	public Out execute() throws Exception;
	
	public String getNextPage();
	
	public DisplayBean getDisplayBean();

	/**
	 * Used to initialize whatever object need to execute a Command.
	 * For example the errorManager
	 *
	 * @return true, if successful
	 */
	public boolean initialize();
	
	public Out getErrorResponse();
}
