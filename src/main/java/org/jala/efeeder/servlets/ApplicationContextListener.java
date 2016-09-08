package org.jala.efeeder.servlets;

import org.atteo.classindex.ClassIndex;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandFactory;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * Created by alejandro on 08-09-16.
 */
public class ApplicationContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        CommandFactory commandFactory = new CommandFactory();
        for (Class<?> klass : ClassIndex.getAnnotated(Command.class)) {
            commandFactory.registerCommand(klass.getSimpleName(), klass);
        }
        servletContextEvent.getServletContext().setAttribute(CommandFactory.COMMAND_FACTORY_KEY, commandFactory);
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {

    }
}
