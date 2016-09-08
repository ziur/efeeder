package org.jala.efeeder.api.command;

import java.sql.Connection;

/**
 * Created by alejandro on 07-09-16.
 */
public interface In {
    void addParameter(String key, Object value);
    Object getParameter(String key);

    void setConnection(Connection connection);
    Connection getConnection();
}
