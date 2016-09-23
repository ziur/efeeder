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
        String id = parameters.getParameter("id_food_meeting");
        
        /*
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
        PreparedStatement preparedStatement = connection.prepareStatement("Select * from suggestions order by created_at");
//        preparedStatement.setInt(1, Integer.valueOf(parameters.getParameter("id_food_meeting")));
//        preparedStatemenaddForeignKeyConstraintt.setInt(1, 1);
        ResultSet resultSet = preparedStatement.executeQuery();
        List<Place> suggestions = new ArrayList<>();
        while (resultSet.next()) {
            //suggestions.add(new Place(resultSet.getInt("id"), "china", resultSet.getString("description"), resultSet.getString("phone"), resultSet.getDate("created_at")));
        }
        
        // get users
        ResultSet resultSetUsers = preparedStatement.executeQuery("select id, name, last_name  from user");
        List<User> users = new ArrayList<>();
        while (resultSetUsers.next()) {
            users.add(new User(resultSetUsers.getInt(1), null, resultSetUsers.getString(2), resultSetUsers.getString(3)));
        }
        
        out.addResult("suggestions", suggestions);
        out.addResult("users", users);
        

*/
        
        Out out = new DefaultOut();
        out.addResult("id", id);
        return out.forward("suggestion/suggestions.jsp");
    }
}
