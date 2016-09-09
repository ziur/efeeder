package org.jala.efeeder.servlets;

import org.jala.efeeder.api.command.*;
import org.jala.efeeder.api.database.DatabaseManager;
import org.jala.efeeder.servlets.support.InBuilder;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by alejandro on 07-09-16.
 */
public class CommandServlet extends HttpServlet {
    private static Pattern COMMAND_PATTERN = Pattern.compile(".*/action/(\\w*)");

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException,
                                                                                                      IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        DatabaseManager databaseManager = new DatabaseManager();
        CommandExecutor executor = new CommandExecutor(databaseManager);
        In parameters = InBuilder.createIn(request);

        Out out = executor.executeCommand(parameters, getCommand(request));

        for (Map.Entry<String, Object> result : out.getResults()) {
            request.setAttribute(result.getKey(), result.getValue());
        }
        ResponseAction action = out.getResponseAction();
        if (action.isRedirect()) {
            response.sendRedirect(action.getUrl());
            return;
        }

        request.getRequestDispatcher(action.getFordwarUrl()).forward(request, response);
    }

    private CommandUnit getCommand(HttpServletRequest req) {
        CommandFactory commandFactory =
                (CommandFactory) getServletContext().getAttribute(CommandFactory.COMMAND_FACTORY_KEY);
        Matcher matcher = COMMAND_PATTERN.matcher(req.getRequestURI());

        if (!matcher.matches()) {
            return null;
        }
        String command = matcher.group(1);
        return commandFactory.getInstance(command);
    }
}
