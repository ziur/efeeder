package org.jala.efeeder.api.command;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.user.User;

/**
 * Created by alejandro on 07-09-16.
 */
public interface Out {
    void setExitStatus(ExitStatus status);
    ExitStatus getExitStatus();
    void addMessage(MessageType type, String message);
    void addResult(String key, Object value);
    List<String> getMessages(MessageType type);
    Set<Map.Entry<String, Object>> getResults();

    void addError(Throwable e);

    ResponseAction getResponseAction();
    Out forward(String page);
    Out redirect(String url);
    User getUser();
    void setUser(User user);
    
    Object getBody();
    void setBody(String body);
    
    void setBody(byte[] body);
    
    Map<String, String> getHeaders();
    void addHeader(String name, String value);
    MessageContext getMessageContext();
    void setMessageContext(MessageContext messageContext);
}
