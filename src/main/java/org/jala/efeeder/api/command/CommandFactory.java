package org.jala.efeeder.api.command;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by alejandro on 08-09-16.
 */
public class CommandFactory {
    public static final String COMMAND_FACTORY_KEY = "COMMAND_FACTORY_KEY";

    private final Map<String, Class<?>> commands = new HashMap<>();
    public void registerCommand(String name, Class klass) {
        commands.put(name.toLowerCase(), klass);
    }

    public CommandUnit getInstance(String name) {
        String commandName = name.toLowerCase() + "command";
        if (!commands.containsKey(commandName)) {
            return null;
        }

        Class command = commands.get(commandName);
        try {
            return (CommandUnit) command.newInstance();
        } catch (Exception e) {
            return null;
        }
    }
}
