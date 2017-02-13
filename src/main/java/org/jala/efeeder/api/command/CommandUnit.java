package org.jala.efeeder.api.command;

/**
 * Created by alejandro on 07-09-16.
 */
public interface CommandUnit {

	public void setIn(In parameters);

	public boolean checkParameters();

	public Out execute() throws Exception;
	
	public String getNextPage();
	
	public DisplayBean getDisplayBean();

	/**
	 * Used to initialize whatever object need to execute a Command
	 */
	public boolean initialize();
	
	public Out getErrorResponse();
}
