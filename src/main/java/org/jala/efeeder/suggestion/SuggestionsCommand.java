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
import org.jala.efeeder.user.User;

/**
 *
 * @author Amir
 */
@Command
public class SuggestionsCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {
        Connection connection = parameters.getConnection();
        
        if (parameters.getParameter("save") != null) {
            String suggestion = parameters.getParameter("suggestion");
            String user = parameters.getParameter("user");
            
            //update votes
            String changeVote = "update suggestions set vote = vote + 1 WHERE id = ?";
            try {
                PreparedStatement preparedStatement = connection.prepareStatement(changeVote);
                preparedStatement.setInt(1, Integer.parseInt(suggestion));
                preparedStatement.executeUpdate();
            } catch (Exception e) {
                
            }
        }
        
        Out out = new DefaultOut();
        PreparedStatement preparedStatement = connection.prepareStatement("Select * from suggestions where id_food_meeting = ? order by created_at");
        preparedStatement.setInt(1, Integer.valueOf(parameters.getParameter("id_food_meeting")));
        ResultSet resultSet = preparedStatement.executeQuery();
        List<Suggestion> suggestions = new ArrayList<>();
        while (resultSet.next()) {
            suggestions.add(new Suggestion(resultSet.getInt("id"), resultSet.getInt("id_user"), resultSet.getInt("id_food_meeting"), resultSet.getString("place"), resultSet.getString("description"), resultSet.getDate("created_at"), resultSet.getInt("vote")));
        }
        
        // get users
        ResultSet resultSetUsers = preparedStatement.executeQuery("select id, name, last_name  from user");
        List<User> users = new ArrayList<>();
        while (resultSetUsers.next()) {
            users.add(new User(resultSetUsers.getInt(1), null, resultSetUsers.getString(2), resultSetUsers.getString(3)));
        }
        
        out.addResult("suggestions", suggestions);
        out.addResult("users", users);
        
        return out.forward("suggestion/suggestions.jsp");
    }
}
