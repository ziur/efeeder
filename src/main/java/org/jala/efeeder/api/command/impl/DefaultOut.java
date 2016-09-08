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

    private List<String> errors;
    private ResponseAction responseAction;
    private Map<String, Object> context;

    public DefaultOut() {
        context = new HashMap<>();
        errors = new ArrayList<>();
        responseAction = new ResponseAction();
    }

    @Override
    public void setExitStatus(ExitStatus status) {

    }

    @Override
    public ExitStatus getExitStatus() {
        return null;
    }

    @Override
    public void addMessage(MessageType type, String message) {

    }

    @Override
    public void addResult(String key, Object value) {
        context.put(key, value);
    }

    @Override
    public List<String> getMessages(MessageType type) {
        return null;
    }


    @Override
    public Set<Map.Entry<String, Object>> getResults() {
        return context.entrySet();
    }

    @Override
    public void addError(Throwable e) {
        errors.add(e.getMessage());
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
                "errors=" + errors +
                '}';
    }
}
