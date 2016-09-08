package org.jala.efeeder.servlets;

import org.jala.efeeder.api.command.*;
import org.jala.efeeder.api.command.impl.DefaultIn;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.api.database.DatabaseManager;
import org.jala.efeeder.voting.Vote;

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
        Out out = executor.executeCommand(parameters, new CommandUnit() {
            @Override
            public Out execute(In context) throws Exception {
                Connection connection = context.getConnection();
                Statement statement = connection.createStatement();
                ResultSet resultSet = statement.executeQuery("Select * from items");
                Out out = new DefaultOut();
                List<Vote> votes = new ArrayList<Vote>();
                while (resultSet.next()) {
                    votes.add(new Vote(resultSet.getString(1), resultSet.getString(2)));
                }
                out.addResult("votes", votes);
                out.forward("voting/vote.jsp");
                return out;

            }
        });

        for (Map.Entry<String, Object> result : out.getResults()) {
            req.setAttribute(result.getKey(), result.getValue());
        }
        ResponseAction action = out.getResponseAction();
        if (action.isRedirect()) {
            resp.sendRedirect(action.getUrl());
            return;
        }

        req.getRequestDispatcher(action.getFordwarUrl()).forward(req, resp);
        ;
    }
}
