package org.jala.efeeder.servlets;

import org.jala.efeeder.api.command.*;
import org.jala.efeeder.api.command.impl.DefaultIn;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.api.database.DatabaseManager;
import org.jala.efeeder.voting.Vote;
import org.jala.efeeder.voting.VotingCommand;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by alejandro on 07-09-16.
 */
public class CommandServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        DatabaseManager databaseManager = new DatabaseManager();
        CommandExecutor executor = new CommandExecutor(databaseManager);
        In parameters = new DefaultIn();
        Out out = executor.executeCommand(parameters, getCommand(req));

        for (Map.Entry<String, Object> result : out.getResults()) {
            req.setAttribute(result.getKey(), result.getValue());
        }
        ResponseAction action = out.getResponseAction();
        if (action.isRedirect()) {
            resp.sendRedirect(action.getUrl());
            return;
        }

        req.getRequestDispatcher(action.getFordwarUrl()).forward(req, resp);
    }

    private CommandUnit getCommand(HttpServletRequest req) {
        CommandFactory commandFactory = (CommandFactory) getServletContext().getAttribute(CommandFactory.COMMAND_FACTORY_KEY);
        String[] uri = req.getRequestURI().split("/");
        if (uri.length < 3) {
            return null;
        }
        String command = uri[2];
        return commandFactory.getInstance(command);
    }
}
