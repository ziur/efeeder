package org.jala.efeeder.api.command.impl;

import org.jala.efeeder.api.command.In;

import java.sql.Connection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by alejandro on 07-09-16.
 */
public class DefaultIn implements In {
    private Connection connection;
    private final Map<String, List<String>> parameters;

    public DefaultIn() {
        parameters = new HashMap<>();
    }

    @Override
    public void addParameter(String key, List<String> values) {
        parameters.put(key, values);
    }

    @Override
    public String getParameter(String key) {
        if(!parameters.containsKey(key) || parameters.isEmpty()) {
            return null;
        }
        return parameters.get(key).get(0);
    }

    @Override
    public List<String> getParameters(String key) {
        return parameters.get(key);
    }

    @Override
    public void setConnection(Connection connection) {
        this.connection = connection;
    }

    @Override
    public Connection getConnection() {
        return connection;
    }
}
