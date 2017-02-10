/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.suggestion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;
import org.jala.efeeder.places.Place;

/**
 *
 * @author alexander_castro
 */
@Command
public class GetAllPlacesCommand extends MockCommandUnit {
    private Connection connection;

    @Override
    public Out execute() throws Exception {
        connection = parameters.getConnection();
        
        PreparedStatement preparedStatement = connection.prepareStatement("Select * from places");
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
        
        return OutBuilder.response("application/json", JsonConverter.objectToJSON(places));
    }
    
}
