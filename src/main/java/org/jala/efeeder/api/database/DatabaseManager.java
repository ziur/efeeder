package org.jala.efeeder.api.database;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Created by alejandro on 07-09-16.
 */
public class DatabaseManager {

    private static final String JDBC_POOL_NAME = "jdbc/efeeder";
    public static final String JNDI_CONTEXT = "java:comp/env";


    public Connection getConnection() {
        try {
            Connection connection = createConnection();
            if (connection == null) {
                throw new SQLException("Error establishing connection!");
            }
            return connection;
        } catch (Exception e) {
            throw new DatabaseConnectionException("Database connection error", e);
        }
    }

    private Connection createConnection() throws NamingException, SQLException {
        InitialContext initialContext = new InitialContext();
        Context context = (Context) initialContext.lookup(JNDI_CONTEXT);
        DataSource ds = (DataSource) context.lookup(JDBC_POOL_NAME);
        return ds.getConnection();
    }
}
