/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.user;

import org.jala.efeeder.api.command.*;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.api.utils.JsonConverter;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author rodrigo_ruiz
 */
@Command
public class UserPaginationCommand implements CommandUnit {
    private static final int ENTRIES_BY_PAGE = 10;
    private static final String USERS_QUERY = "select id, email, name, last_name " +
                                                      "from user %s order by id, name, last_name, email " +
                                                      "LIMIT %d OFFSET %d";


    @Override
    public Out execute(In parameters) throws Exception {
        String term = parameters.getParameter("term");
        int page = 1;
        try {
            page = Integer.parseInt(parameters.getParameter("page"));
        } catch (NumberFormatException ex) {
            System.out.println("Invalid page");
        }

        page--;

        Connection connection = parameters.getConnection();
        Statement statement = connection.createStatement();
        String query = String.format(USERS_QUERY, getWhere(term),
                ENTRIES_BY_PAGE, ENTRIES_BY_PAGE * page);
        ResultSet resultSet = statement.executeQuery(query);
        List<User> users = new ArrayList<>();
        while (resultSet.next()) {
            users.add(new User(resultSet.getInt(1), resultSet.getString(2), resultSet.getString(3), resultSet.getString(4)));
        }

        return OutBuilder.response("application/json", JsonConverter.objectToJSON(new PaginationResult(users)));
    }

    private String getWhere(String term) {
        if (term == null || term.isEmpty()) {
            return "";
        }
        term += "%";
        return String.format("WHERE name like \"%s\" or email like \"%s\" ", term, term);
    }

}
