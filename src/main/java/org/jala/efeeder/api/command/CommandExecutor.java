package org.jala.efeeder.api.command;

import java.sql.Connection;
import java.sql.SQLException;

import org.jala.efeeder.api.database.DatabaseManager;
import org.jala.efeeder.foodmeeting.FoodMeetingCommand;

/**
 * Created by alejandro on 07-09-16.
 */
public class CommandExecutor {
	private final DatabaseManager databaseManager;

	public CommandExecutor(DatabaseManager databaseManager) {
		this.databaseManager = databaseManager;
	}

	public Out executeCommand(In parameters, CommandUnit command) {

		// Set parameters inside command class to be used by all methods.
		command.setIn(parameters);
		
		command.initialize();
		
		// Check input parameters before executing the command
		if (!command.checkParameters()) {
			// Build output with an event
			System.out.println("CommandExecutor.checkParameters() did not pass");
			return command.getErrorResponse();
		}else{
	
			Connection connection = databaseManager.getConnection();
			try {
				connection.setAutoCommit(false);
				parameters.setConnection(connection);
				if (command != null) {
					Out result = command.execute();
					connection.commit();
					// if there was an error in the execution
					if (result == null) {
						result = command.getErrorResponse();
					}
					return result;
				}
				System.err.println("Null command unit");
				return OutBuilder.response("text/plain", "Null command unit");
			} catch (Throwable throwable) {
	
				Out result = OutBuilder.newError(throwable);
				try {
					connection.rollback();
				} catch (SQLException e) {
					result.addError(e);
				}
				throw new RuntimeException(throwable);
				// return result;
			} finally {
				try {
					connection.close();
				} catch (SQLException e) {
					e.printStackTrace();
					return OutBuilder.DEFAULT;
				}
	
			}
		}
	}
}
