package org.jala.efeeder.api.command;

import org.apache.avro.Protocol;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;

/**
 * Created by alejandro on 07-09-16.
 */
public class OutBuilder {
    public final static Out DEFAULT = new DefaultOut().redirect("/");

    public static Out newError(Throwable throwable) {
        Out out = new DefaultOut();
        out.setExitStatus(ExitStatus.ERROR);
        out.addError(throwable);
        return out;
    }

    public static Out response(String contentType, String message) {
        DefaultOut out = new DefaultOut();
        out.addHeader(DefaultOut.CONTENT_TYPE, contentType);
        out.setBody(message);
        out.getResponseAction().setResponseType(ResponseAction.ResponseType.MESSAGE);
        return out;
    }

    public static Out response(MessageContext messageContext) {
        DefaultOut out = new DefaultOut();
        out.setMessageContext(messageContext);
        return out;
    }
}
