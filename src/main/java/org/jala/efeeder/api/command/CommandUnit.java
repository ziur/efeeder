package org.jala.efeeder.api.command;


/**
 * Created by alejandro on 07-09-16.
 */
public interface CommandUnit {
	
	public void setIn(In parameters);
	
	
	public boolean checkParameters(In parameters);
	
    Out execute(In  parameters) throws Exception;

	DisplayBean getDisplayBean();
}
