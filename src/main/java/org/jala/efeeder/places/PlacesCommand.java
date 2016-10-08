/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.places;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.suggestion.Place;
/**
 *
 * @author ricardo_ramirez
 */
@Command
public class PlacesCommand implements CommandUnit{
    private static final String TOP_FIVE_PLACES_QUERY = "SELECT * FROM places ORDER BY created_at DESC limit 5";
        
    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();
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
        out.addResult("places", places);
        return out.forward("suggestion/suggestions.jsp");
    }
}

