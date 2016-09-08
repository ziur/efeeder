package org.jala.efeeder.api.command;

import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 * Created by alejandro on 07-09-16.
 */
public class OutBuilder {
    public static Out newError(Throwable throwable) {
        Out out = new DefaultOut();
        out.addError(throwable);
        return out;
    }
}
