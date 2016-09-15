package org.jala.efeeder.suggestion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 *
 * @author Amir
 */
@Command
public class SuggestionsCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();
        Connection connection = parameters.getConnection();
        PreparedStatement preparedStatement = connection.prepareStatement("Select * from suggestions where id_food_meeting = ? order by created_at");
        preparedStatement.setInt(1, Integer.valueOf(parameters.getParameter("id_food_meeting")));
        ResultSet resultSet = preparedStatement.executeQuery();
        List<Suggestion> suggestions = new ArrayList<>();
        while (resultSet.next()) {
            suggestions.add(new Suggestion(resultSet.getInt("id"), resultSet.getInt("id_user"), resultSet.getInt("id_food_meeting"), resultSet.getString("place"), resultSet.getString("description"), resultSet.getDate("created_at")));
        }
        out.addResult("suggestions", suggestions);
        return out.forward("suggestion/suggestions.jsp");
    }
}
