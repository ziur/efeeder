package org.jala.efeeder.api.command;

import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 * Created by alejandro on 07-09-16.
 */
public class OutBuilder {

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
}
