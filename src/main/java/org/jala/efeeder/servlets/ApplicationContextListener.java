package org.jala.efeeder.servlets;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletContext;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandFactory;
import org.reflections.Reflections;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import org.jala.efeeder.api.command.SettingsManager;

/**
 * Created by alejandro on 08-09-16.
 */
public class ApplicationContextListener implements ServletContextListener {

    private static String SETTINGS_PROPERTIES_PATH = "/WEB-INF/classes/settings.properties";

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        CommandFactory commandFactory = new CommandFactory();
        SettingsManager settingsFactory = new SettingsManager();

        Reflections reflections = new Reflections("org.jala.efeeder");

        for (Class<?> klass : reflections.getTypesAnnotatedWith(Command.class)) {
            commandFactory.registerCommand(klass.getSimpleName(), klass);
        }
        ServletContext servletContext = servletContextEvent.getServletContext();
        servletContext.setAttribute(CommandFactory.COMMAND_FACTORY_KEY, commandFactory);
        servletContext.setAttribute(SettingsManager.SETTINGS_FACTORY_KEY, readProperties(servletContext));
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {

    }

    private SettingsManager readProperties(ServletContext servlet) {
        Properties prop = new Properties();
        InputStream input = null;
        String pathOfProperties = "";
        SettingsManager settingsFactory = new SettingsManager();

        try {

            pathOfProperties = servlet.getResource(SETTINGS_PROPERTIES_PATH).getPath();
            input = new FileInputStream(new File(pathOfProperties));

            prop.load(input);

            settingsFactory.addAll(prop.entrySet());

        } catch (IOException ex) {
            ex.printStackTrace();
            Logger.getLogger(ApplicationContextListener.class.getName()).log(Level.SEVERE, null, ex);
            throw new RuntimeException(ex);
        } finally {
            if (input != null) {
                try {
                    input.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        return settingsFactory;
    }
}
