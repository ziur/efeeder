package org.jala.efeeder.api.database;

/**
 * Created by alejandro on 07-09-16.
 */
public class DatabaseConnectionException extends RuntimeException {

    private static final long serialVersionUID = -1619306049459394295L;

    public DatabaseConnectionException(String message, Exception e) {
        super(message, e);
    }
}
