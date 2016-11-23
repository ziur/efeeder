/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.participants;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;

/**
 *
 * @author vicente_rodriguez
 */
public class ParticipantsManager {
    
    private static final String PARTICIPANTS_BY_FOOD_MEETING_ID = "SELECT id_user FROM food_meeting_participants WHERE id_food_meeting = ?";
    
    private final Connection connection;
    
    public ParticipantsManager(Connection connection) {
        this.connection = connection;
    }

    public List<User> getAllParticipantsForMeeting(int idFoodMeeting) throws SQLException {
        PreparedStatement statement = connection.prepareStatement(PARTICIPANTS_BY_FOOD_MEETING_ID);
        statement.setInt(1, idFoodMeeting);
        ResultSet resultSet = statement.executeQuery();
        
        List<Integer> idsList = new ArrayList<>();
        while (resultSet.next()) {
            idsList.add(resultSet.getInt(1));
        }
        
        UserManager userManager = new UserManager(connection);
        return userManager.getUsersById(idsList);
    }
    
    
}
