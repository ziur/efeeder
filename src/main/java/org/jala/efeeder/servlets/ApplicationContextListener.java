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

    private static String SETTINGS_PROPERTIES_PATH = "settings.properties";

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
		try
		{
			servletContext.setAttribute(SettingsManager.SETTINGS_FACTORY_KEY, readProperties(servletContext));
		}
		catch (Exception e)
		{
			System.out.println("\nERROR: missing configuration file. Copy efeeder\\src\\main\\resources\\settings.properties.template to efeeder\\src\\main\\resources\\settings.properties and update as needed.");
			throw e;
		}
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {

    }

    private SettingsManager readProperties(ServletContext servlet) {
        Properties prop = new Properties();
        SettingsManager settingsFactory = new SettingsManager();

        try {
            String settingPath = System.getProperty("app.settings");
            InputStream input;
            if (settingPath == null || !settingPath.isEmpty()) {
                ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
                input = classLoader.getResourceAsStream(SETTINGS_PROPERTIES_PATH);
            } else {
                input = new FileInputStream(settingPath);
            }
            prop.load(input);
            settingsFactory.addAll(prop.entrySet());

        } catch (IOException ex) {
            Logger.getLogger(ApplicationContextListener.class.getName()).log(Level.SEVERE, null, ex);
            throw new RuntimeException(ex);
        }
        return settingsFactory;
    }
}
