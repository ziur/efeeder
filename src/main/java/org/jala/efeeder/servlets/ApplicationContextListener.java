package org.jala.efeeder.servlets;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandFactory;
import org.reflections.Reflections;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * Created by alejandro on 08-09-16.
 */
public class ApplicationContextListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        CommandFactory commandFactory = new CommandFactory();
        Reflections reflections = new Reflections("org.jala.efeeder");

        for (Class<?> klass : reflections.getTypesAnnotatedWith(Command.class)) {
            commandFactory.registerCommand(klass.getSimpleName(), klass);
        }
        servletContextEvent.getServletContext().setAttribute(CommandFactory.COMMAND_FACTORY_KEY, commandFactory);
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {

    }
}
