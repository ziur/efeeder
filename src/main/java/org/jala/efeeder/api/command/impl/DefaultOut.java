package org.jala.efeeder.api.command.impl;

import org.jala.efeeder.api.command.ExitStatus;
import org.jala.efeeder.api.command.MessageType;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.ResponseAction;

import java.util.*;

/**
 * Created by alejandro on 07-09-16.
 */
public class DefaultOut implements Out {

    private Map<MessageType, List<String>> messages;
    private ResponseAction responseAction;
    private Map<String, Object> context;
    private ExitStatus exitStatus;

    public DefaultOut() {
        context = new HashMap<>();
        messages = new HashMap<>();
        responseAction = new ResponseAction();
        exitStatus = ExitStatus.SUCCESS;
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
        responseAction.setRedirect(true);
        responseAction.setUrl(url);
        return this;
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
