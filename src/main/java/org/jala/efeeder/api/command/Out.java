package org.jala.efeeder.api.command;

import java.util.List;

/**
 * Created by alejandro on 07-09-16.
 */
public interface Out {
    void setExitStatus(ExitStatus status);
    ExitStatus getExitStatus();
    void addMessage(MessageType type, String message);
    void addResult(String key, Object value);
    List<String> getMessages(MessageType type);
    List<Object> getResults(MessageType type);

    void addError(Throwable e);
}
