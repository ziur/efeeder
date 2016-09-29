package org.jala.efeeder.api.command.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.jala.efeeder.api.command.*;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.user.User;

import lombok.Getter;
import lombok.Setter;

/**
 * Created by alejandro on 07-09-16.
 */
public class DefaultOut implements Out {
    private static final String HEADER_RESPONSE = "__HEADER_RESPONSE__";
    public static final String CONTENT_TYPE = "contentType";
    private static final String BODY_RESPONSE = "__BODY_RESPONSE__";

    private Map<MessageType, List<String>> messages;
    private ResponseAction responseAction;
    private Map<String, Object> context;
    private ExitStatus exitStatus;
    @Setter @Getter private User user;
    @Setter @Getter private MessageContext messageContext;

    public DefaultOut() {
        Map<String, String> header = new HashMap<>();
        context = new HashMap<>();
        messages = new HashMap<>();
        responseAction = new ResponseAction();
        exitStatus = ExitStatus.SUCCESS;
        context.put(HEADER_RESPONSE, header);
    }

    @Override
    public void setExitStatus(ExitStatus status) {
        exitStatus = status;
    }

    @Override
    public ExitStatus getExitStatus() {
        return exitStatus;
    }

    @Override
    public void addMessage(MessageType type, String message) {
        if (!messages.containsKey(type)) {
            messages.put(MessageType.ERROR, new ArrayList<String>());
        }

        List<String> messageEntries = messages.get(type);
        messageEntries.add(message);
        messages.put(MessageType.ERROR, messageEntries);
    }

    @Override
    public void addResult(String key, Object value) {
        context.put(key, value);
    }

    @Override
    public List<String> getMessages(MessageType type) {
        return messages.get(type);
    }


    @Override
    public Set<Map.Entry<String, Object>> getResults() {
        return context.entrySet();
    }

    @Override
    public void addError(Throwable e) {
        addMessage(MessageType.ERROR, e.getMessage());
    }

    @Override
    public ResponseAction getResponseAction() {
        return responseAction;
    }

    public Out redirect(String url) {
        responseAction.setResponseType(ResponseAction.ResponseType.REDIRECT);
        responseAction.setUrl(url);
        return this;
    }

    @Override
    public void setBody(String body) {
        context.put(BODY_RESPONSE, body);
    }

    @Override
    public void addHeader(String name, String value) {
        getHeaders().put(name, value);
    }

    @Override
    public String getBody() {
        return (String) context.get(BODY_RESPONSE);
    }

    @Override
    public Map<String, String> getHeaders() {
        return (Map<String, String>) context.get(HEADER_RESPONSE);
    }


    public Out forward(String page) {
        responseAction.setUrl(page);
        return this;
    }

    @Override
    public String toString() {
        return "DefaultOut{" +
                "messages=" + messages +
                ", responseAction=" + responseAction +
                ", context=" + context +
                '}';
    }
}
