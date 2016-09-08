package org.jala.efeeder.servlets;

import org.jala.efeeder.api.command.CommandExecutor;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultIn;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.api.database.DatabaseManager;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Created by alejandro on 07-09-16.
 */
public class CommandServlet extends HttpServlet{
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        DatabaseManager databaseManager = new DatabaseManager();
        CommandExecutor executor = new CommandExecutor(databaseManager);
        In parameters = new DefaultIn();
        Out out = executor.executeCommand(parameters, new CommandUnit() {
            @Override
            public Out execute(In context) throws Exception {
                try(Connection connection = context.getConnection()) {
                    Statement statement = connection.createStatement();
                    ResultSet resultSet = statement.executeQuery("Select * from items");
                    while (resultSet.next())
                    {
                        System.out.println(resultSet.getString("name"));
                    }
                    return new DefaultOut();
                }
            }
        });
        System.out.println(out);
    }
}
