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
    private static final String TOP_FIVE_PLACES_QUERY = "SELECT * FROM places ORDER BY created_at DESC limit 5";
       
    @Override
    public Out execute(In parameters) throws Exception {
       
        PreparedStatement preparedStatement = parameters.getConnection().prepareStatement(TOP_FIVE_PLACES_QUERY);
        ResultSet resultSet = preparedStatement.executeQuery();
        List<Place> places = new ArrayList<>();
        while (resultSet.next()) {
            places.add(new Place(resultSet.getInt("id"), 
                    resultSet.getString("name"), 
                    resultSet.getString("description"), 
                    resultSet.getString("phone"),
                    resultSet.getString("direction"),
                    resultSet.getString("image_link")));
        } 
        
        
        Out out = new DefaultOut();
        out.addResult("places", places);
        
        String id = parameters.getParameter("id_food_meeting");
        out.addResult("id", id);
        return out.forward("suggestion/suggestions.jsp");
    }
}
