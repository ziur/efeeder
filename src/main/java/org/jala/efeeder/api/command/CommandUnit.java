package org.jala.efeeder.api.command;

import java.util.Map;

/**
 * Created by alejandro on 07-09-16.
 */
public interface CommandUnit {
	
	public void setIn(In parameters);
	
	
	public boolean checkParameters();
	
    public Out execute() throws Exception;

	public DisplayBean getDisplayBean();
	/*
	 * 
	 * key= fieldName
	 * value= Message text
	 * */
	public Map<String, String> getErrors();
	
	public boolean initialize();
}
