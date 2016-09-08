package org.jala.efeeder.api.command;

import java.util.List;
import java.util.Map;
import java.util.Set;

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
}
