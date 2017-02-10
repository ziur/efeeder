/**
 * 
 */
package org.jala.efeeder.common;

/**
 * @author Patricia Escalera
 *
 */
public class ErrorLevel {
	
	private int code;
	private String displayText;

	/** Critical conditions. */
	public static final ErrorLevel SE_ERROR = new ErrorLevel(1, "Error");

	/** Required field conditions. */
	public static final ErrorLevel SE_REQUIRED = new ErrorLevel(8, "Required");

	/** Warning conditions. */
	public static final ErrorLevel SE_WARNING = new ErrorLevel(4, "Warning");

	/** Notifications. */
	public static final ErrorLevel SE_NOTIFICATION = new ErrorLevel(16, "Notification");


	private ErrorLevel(int code, String displayText) {
		this.code= code;
		this.displayText = displayText;
	}

	public final String getDisplayText() {
		return displayText;
	}
}
