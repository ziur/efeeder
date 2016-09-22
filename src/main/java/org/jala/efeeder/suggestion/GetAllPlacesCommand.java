/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.suggestion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.command.PaginationResult;
import org.jala.efeeder.api.utils.JsonConverter;

/**
 *
 * @author alexander_castro
 */
@Command
public class GetAllPlacesCommand implements CommandUnit {
    private Connection connection;

    @Override
    public Out execute(In parameters) throws Exception {
        connection = parameters.getConnection();
        
        PreparedStatement preparedStatement = connection.prepareStatement("Select * from places order by created_at");
        ResultSet resultSet = preparedStatement.executeQuery();
        List<Place> suggestions = new ArrayList<>();
        while (resultSet.next()) {
            suggestions.add(new Place(resultSet.getInt("id"), 
                    resultSet.getString("name"), 
                    resultSet.getString("description"), 
                    resultSet.getString("phone"),
                    resultSet.getDate("direction")));
        }
        
        return OutBuilder.response("application/json", JsonConverter.objectToJSON(new PaginationResult(suggestions)));
    }
    
}
