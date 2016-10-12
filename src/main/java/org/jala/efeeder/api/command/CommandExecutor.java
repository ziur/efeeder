package org.jala.efeeder.api.command;

import java.sql.Connection;
import java.sql.SQLException;

import org.jala.efeeder.api.database.DatabaseManager;

/**
 * Created by alejandro on 07-09-16.
 */
public class CommandExecutor {
    private final DatabaseManager databaseManager;

    public CommandExecutor(DatabaseManager databaseManager) {
        this.databaseManager = databaseManager;
    }

    public Out executeCommand(In parameters, CommandUnit command) {
        Connection connection = databaseManager.getConnection();
        try {
            connection.setAutoCommit(false);
            parameters.setConnection(connection);
            Out result = command.execute(parameters);
            connection.commit();
            return result;
        }catch(Throwable throwable) {

            Out result = OutBuilder.newError(throwable);
            try {
                connection.rollback();
            } catch (SQLException e) {
                result.addError(e);
            }
            throw new RuntimeException(throwable);
            //return result;
        }finally {
            try {
                connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
                return OutBuilder.DEFAULT;
            }

        }
    }
}
