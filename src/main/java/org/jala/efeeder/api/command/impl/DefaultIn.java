package org.jala.efeeder.api.command.impl;

import org.jala.efeeder.api.command.In;

import java.sql.Connection;
import java.util.HashMap;

/**
 * Created by alejandro on 07-09-16.
 */
public class DefaultIn extends HashMap implements In {
    private Connection connection;
    @Override
    public void addParameter(String key, Object value) {

    }

    @Override
    public Object getParameter(String key) {
        return null;
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
