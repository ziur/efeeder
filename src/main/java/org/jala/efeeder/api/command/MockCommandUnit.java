/**
 * 
 */
package org.jala.efeeder.api.command;

/**
 * @author Patricia Escalera
 *
 */
public abstract class MockCommandUnit implements CommandUnit {
	DisplayBean displayBean;
	/**
	 * 
	 */
	public MockCommandUnit() {
		super();
	}

	/* (non-Javadoc)
	 * @see org.jala.efeeder.api.command.CommandUnit#checkParameters(org.jala.efeeder.api.command.In)
	 */
	@Override
	public boolean checkParameters(In parameters) {
		// TODO by all subclasses .
		return true;
	}

	/* (non-Javadoc)
	 * @see org.jala.efeeder.api.command.CommandUnit#getDisplayBean()
	 */
	@Override
	public DisplayBean getDisplayBean() {
		return displayBean;
	}
	@Override
	public void setIn(In parameters){
		
	}
	
}
