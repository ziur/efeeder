package org.jala.efeeder.api.command;

import java.sql.Connection;
import java.util.List;

import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.user.User;

/**
 * Created by alejandro on 07-09-16.
 */
public interface In {
    void addParameter(String key, List<String> values);
    String getParameter(String key);
    List<String> getParameters(String key);

    void setConnection(Connection connection);
    Connection getConnection();
    User getUser();
    void setUser(User user);
    MessageContext getMessageContext();
    void setMessageContext(MessageContext messageContext);
}
