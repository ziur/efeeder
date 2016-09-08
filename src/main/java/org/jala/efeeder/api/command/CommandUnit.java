package org.jala.efeeder.api.command;

/**
 * Created by alejandro on 07-09-16.
 */
public interface CommandUnit {
    Out execute(In  parameters) throws Exception;
}
