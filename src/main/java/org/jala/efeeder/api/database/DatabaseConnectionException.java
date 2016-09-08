package org.jala.efeeder.api.database;

import java.sql.SQLException;

/**
 * Created by alejandro on 07-09-16.
 */
public class DatabaseConnectionException extends RuntimeException{

    public DatabaseConnectionException(String message, Exception e) {
        super(message, e);
    }
}
