package org.jala.efeeder.api.database;

/**
 * Created by alejandro on 07-09-16.
 */
public class DatabaseConnectionException extends RuntimeException {

    public DatabaseConnectionException(String message, Exception e) {
        super(message, e);
    }
}
