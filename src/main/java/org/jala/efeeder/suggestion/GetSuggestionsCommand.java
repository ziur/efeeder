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
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;
import org.jala.efeeder.places.Place;

/**
 *
 * @author 0x3
 * 
 * Supports AJAX and provides functionality for the Web Sockets version 
 */
@Command
public class GetSuggestionsCommand implements CommandUnit {

    private static final String SELECT_VOTE_FINISHER_SQL =
            "SELECT id_user FROM food_meeting WHERE food_meeting.id=? AND status='Voting'";
	private static final String SELECT_USERS_BY_MEETING_SQL =
            "SELECT id, name, last_name FROM efeeder.user WHERE id in (SELECT id_user FROM efeeder.food_meeting_participants WHERE id_food_meeting = ?)";
    private static final String SELECT_PLACES_BY_MEETING_SQL =
            "SELECT id, name, description, phone, direction, image_link FROM efeeder.places WHERE id IN"
            + "(SELECT id_place FROM efeeder.food_meeting_suggestions WHERE id_food_meeting = ?)";
    private static final String SELECT_WINNER_PLACE_SQL =
            "SELECT id_place,count(*) AS votes FROM food_meeting_suggestions WHERE id_food_meeting=? GROUP BY id_place ORDER BY votes DESC LIMIT 0, 2";
    private static final String GET_PARTICIPANT_VOTED_PLACE = 
            "SELECT id_place FROM efeeder.food_meeting_suggestions WHERE id = " +
            "(SELECT id_suggestion FROM efeeder.votes WHERE id_participant = " +
            "(SELECT id FROM efeeder.food_meeting_participants WHERE id_user = ? LIMIT 1) LIMIT 1) LIMIT 1; ";
    private static final String GET_SUGGESTION_VOTES = 
            "SELECT COUNT(id_suggestion) FROM efeeder.votes WHERE id_suggestion = "
            + "(SELECT id FROM efeeder.food_meeting_suggestions WHERE id_place = ? LIMIT 1); ";
	
	/**
	 * @return Either the feast owner id or zero if the voting phase is over
	 */
	static public int getVoteFinisherUserId(int feastId, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement(SELECT_VOTE_FINISHER_SQL);
        ps.setInt(1, feastId);
        ResultSet resSet = ps.executeQuery();
        if(resSet.next()) return resSet.getInt("id_user");
		return 0;
	}
	
	static public String getUserSuggestionsAsString(int feastId, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement(SELECT_USERS_BY_MEETING_SQL);
        ps.setInt(1, feastId);
        ResultSet resSet = ps.executeQuery();
        
        List<UserAndPlace> usersAndPlaces = new ArrayList<>();
        while(resSet.next()) {
            int userId = resSet.getInt("id");
            PreparedStatement getPlaceStm = connection.prepareStatement(GET_PARTICIPANT_VOTED_PLACE);
            getPlaceStm.setInt(1, userId);
            ResultSet placeResSet = getPlaceStm.executeQuery();
            int placeId = 0;
            if(placeResSet.next()) {
                placeId = placeResSet.getInt("id_place");
            }
            usersAndPlaces.add(new UserAndPlace(
                    userId,
                    placeId,
                    resSet.getString("user.name") + " " + resSet.getString("user.last_name") ));
        }
        
		return JsonConverter.objectToJSON(usersAndPlaces);
	}
	
	static public String getPlacesSuggestionsAsString(int feastId, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement(SELECT_PLACES_BY_MEETING_SQL);
        ps.setInt(1, feastId);
        ResultSet resSet = ps.executeQuery();
        
        List<Place> places = new ArrayList<>();
        while(resSet.next()) {
            int placeId = resSet.getInt("places.id");
            PreparedStatement votesStm = connection.prepareStatement(GET_SUGGESTION_VOTES);
            votesStm.setInt(1, placeId);
            ResultSet votesResSet = votesStm.executeQuery();
            votesResSet.next();
            int votesCount = votesResSet.getInt(1);
            places.add(new Place(placeId,
                    resSet.getString("places.name"), 
                    resSet.getString("places.description"), 
                    resSet.getString("places.phone"),
                    resSet.getString("places.direction"),
                    resSet.getString("places.image_link"),
                    votesCount));
        }

        return JsonConverter.objectToJSON(places);
	}
	
	static public int getWinnerPlaceId(int feastId, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement(SELECT_WINNER_PLACE_SQL);
        ps.setInt(1, feastId);
        ResultSet resSet = ps.executeQuery();

        if (resSet.next()){
			int winnerId = resSet.getInt("id_place");
			int winnerVotes = resSet.getInt("votes");
			int secondVotes = 0;
			if (resSet.next()){
				secondVotes = resSet.getInt("votes");
			}
			if (winnerVotes > secondVotes) return winnerId;
		}
		return 0;
	}	
	
	static public String getSuggestionsAsString(In parameters) throws Exception {
		int feastId = Integer.parseInt(parameters.getParameter("feastId"));
		Connection connection = parameters.getConnection();
		return "{\"users\":" +
				getUserSuggestionsAsString(feastId, connection) +
				",\"places\":" +
				getPlacesSuggestionsAsString(feastId, connection) +
				",\"ownerId\":" +
				Integer.toString(getVoteFinisherUserId(feastId, connection)) +
				"}";
	}

    @Override
    public Out execute(In parameters) throws Exception {
		return OutBuilder.response("application/json", getSuggestionsAsString(parameters));
    }
}
