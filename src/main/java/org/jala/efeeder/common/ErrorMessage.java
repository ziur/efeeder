/**
 * 
 */
package org.jala.efeeder.common;

/**
 * @author Patricia Escalera
 *
 */
public final class ErrorMessage {
	
	public static String KEY_ERROR_MESSAGE = "ErrorMessage";
	
	private String errorId;

	/** The field the error is associated with */
	private String errorField;

	/** Text of the error message*/
	private String message;
	
	/** The severity of the error */
	protected ErrorLevel errorLevel = null;
	
	public ErrorMessage(String message){
		this.errorId = "GENERIC-ID";
		this.message = message;
		this.errorLevel = ErrorLevel.SE_ERROR;
	}
	/**
	 * 
	 */
	public ErrorMessage(String errorId, String message) {
		this.errorId = errorId;
		this.message=message;
		this.errorLevel = ErrorLevel.SE_ERROR;
	}
	
	public ErrorMessage(String errorId, String message, ErrorLevel errorLevel) {
		this(errorId, message);
		this.errorLevel =  errorLevel;
	}
	
	public String getErrorId() {
		return errorId;
	}
	public void setErrorId(String errorId) {
		this.errorId = errorId;
	}
	public String getErrorField() {
		return errorField;
	}
	public void setErrorField(String errorField) {
		this.errorField = errorField;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}

}
