package org.jala.efeeder.api.command;

import java.sql.Connection;
import java.util.List;

/**
 * Created by alejandro on 07-09-16.
 */
public interface In {
    void addParameter(String key, List<String> values);
    String getParameter(String key);
    List<String> getParameters(String key);

    void setConnection(Connection connection);
    Connection getConnection();
}
