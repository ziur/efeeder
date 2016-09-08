package org.jala.efeeder.api.command.impl;

import org.jala.efeeder.api.command.ExitStatus;
import org.jala.efeeder.api.command.MessageType;
import org.jala.efeeder.api.command.Out;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by alejandro on 07-09-16.
 */
public class DefaultOut extends HashMap implements Out {

    private List<String> errors;

    public DefaultOut() {
        errors = new ArrayList<>();
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

    }

    @Override
    public List<String> getMessages(MessageType type) {
        return null;
    }

    @Override
    public List<Object> getResults(MessageType type) {
        return null;
    }

    @Override
    public void addError(Throwable e) {
        errors.add(e.getMessage());
    }

    @Override
    public String toString() {
        return "DefaultOut{" +
                "errors=" + errors +
                '}';
    }
}
