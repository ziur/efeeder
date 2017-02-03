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

	
    private static final String SELECT_PLACES_BY_MEETING_SQL =
    		"SELECT p.id, p.name, p.description, p.phone, p.direction, p.image_link "
    	    		+" FROM places p, food_meeting_suggestions fms"
    	            +" WHERE fms.id_food_meeting = ?"		
    	    		+" AND p.id = fms.id_place";
    private static final String SELECT_WINNER_PLACE_SQL =
            "SELECT id_suggestion AS suggestionId, count(*) AS votes, " +
            "(SELECT id_place FROM efeeder.food_meeting_suggestions WHERE id = suggestionId) AS placeId " +
            "FROM efeeder.votes WHERE id_food_meeting = ? GROUP BY id_suggestion ORDER BY votes DESC LIMIT 0, 2";
    
    //20170118 pescalera: The query now retrieves the right voted place for every user at a specific food meeting. 
    private static final String GET_PARTICIPANT_VOTED_PLACE = 
    		"SELECT fmp.id_user as id_user, fms.id_place as id_place, "
    		+" u.last_name as last_name, u.name as name" 
    		+ " FROM food_meeting_participants fmp"
    		+ " LEFT JOIN votes v"
    		+ " ON fmp.id = v.id_participant"
    		+ " JOIN food_meeting_suggestions fms"
    		+ " ON v.id_suggestion = fms.id"
    		+ " JOIN user u"
    		+ " ON fmp.id_user=u.id"
    		+ " WHERE fmp.id_food_meeting = ?";
          
    private static final String GET_SUGGESTION_VOTES = 
    		"select count(*)"
    	    + " FROM food_meeting_suggestions fms, votes v"
    	    + " WHERE fms.id_food_meeting= ?"
    	    + " AND fms.id_place = ?"
    	    + " AND fms.id_food_meeting = v.id_food_meeting"
    	    + " AND fms.id = v.id_suggestion";
    private static final String SELECT_FOOD_MEETING_SQL =
			"SELECT food_meeting.id_user, user.name, user.last_name, food_meeting.name, food_meeting.image_link, event_date, voting_time, order_time, payment_time FROM food_meeting, user WHERE food_meeting.id_user=user.id AND food_meeting.id=? AND status='Voting'";
    private static final String SELECT_VOTE_FINISHER_SQL =
            "SELECT id_user FROM food_meeting WHERE food_meeting.id=? AND status='Voting'";
	
	/**
	 * @param feastId The id of the feast to look for
	 * @param connection The database connection 
	 * @return Either the feast owner id or zero if the voting phase is over
	 */
	static public int getVoteFinisherUserId(int feastId, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement(SELECT_VOTE_FINISHER_SQL);
        ps.setInt(1, feastId);
        ResultSet resSet = ps.executeQuery();
        if(resSet.next()) return resSet.getInt("id_user");
		return 0;
	}
	
	static String concatenate(String name, String lastName)
	{
		String result = name;
		if (result.length() > 0 && lastName.length() > 0) result += " "; 
		return result + lastName;
	}
	
	/**
	 * @param feastId The id of the feast to look for
	 * @param connection The database connection
	 * @return The feast data
	 */
	static public String getFeastAsString(int feastId, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement(SELECT_FOOD_MEETING_SQL);
        ps.setInt(1, feastId);
        ResultSet resSet = ps.executeQuery();
        if(resSet.next()) 
		{
			return JsonConverter.objectToJSON(new Feast(
					resSet.getInt("food_meeting.id_user"),
					concatenate(resSet.getString("user.name"),
							resSet.getString("user.last_name")),
					resSet.getString("food_meeting.name"),
					resSet.getString("food_meeting.image_link"),
					resSet.getTimestamp("event_date"),
					resSet.getTimestamp("voting_time"),
					resSet.getTimestamp("order_time"),
					resSet.getTimestamp("payment_time")));
		}
		return "";
	}
	/**
	 * Retrieves users votes and transform each vote in a string.
	 * 
	 * Changes:
	 * The query was not retrieving the right vote for each user.
	 * Instead of 2 queries, it was reduced to one, so one call to the DB.
	 *
	 * */
	static public String getUserSuggestionsAsString(int feastId, Connection connection) throws Exception {
        PreparedStatement getVotePerUserStm = connection.prepareStatement(GET_PARTICIPANT_VOTED_PLACE);
        getVotePerUserStm.setInt(1, feastId);
        ResultSet votePerUserResSet = getVotePerUserStm.executeQuery();
        
        List<UserAndPlace> usersAndPlaces = new ArrayList<>();
        while(votePerUserResSet.next()) {
            int userId = votePerUserResSet.getInt("id_user");
            int placeId = votePerUserResSet.getInt("id_place");
            usersAndPlaces.add(new UserAndPlace(
                    userId,
                    placeId,
                    votePerUserResSet.getString("name") + " " + votePerUserResSet.getString("last_name") ));
        }
        
		return JsonConverter.objectToJSON(usersAndPlaces);
	}
	
	static public String getPlacesSuggestionsAsString(int feastId, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement(SELECT_PLACES_BY_MEETING_SQL);
        ps.setInt(1, feastId);
        ResultSet resSet = ps.executeQuery();
        
        List<Place> places = new ArrayList<>();
        while(resSet.next()) {
            int placeId = resSet.getInt("p.id");
            PreparedStatement votesStm = connection.prepareStatement(GET_SUGGESTION_VOTES);
            votesStm.setInt(1, feastId);
            votesStm.setInt(2, placeId);
            ResultSet votesResSet = votesStm.executeQuery();
            votesResSet.next();
            int votesCount = votesResSet.getInt(1);
            places.add(new Place(placeId,
                    resSet.getString("p.name"), 
                    resSet.getString("p.description"), 
                    resSet.getString("p.phone"),
                    resSet.getString("p.direction"),
                    resSet.getString("p.image_link"),
                    votesCount));
        }

        return JsonConverter.objectToJSON(places);
	}
	
	static public int getWinnerPlaceId(int feastId, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement(SELECT_WINNER_PLACE_SQL);
        ps.setInt(1, feastId);
        ResultSet resSet = ps.executeQuery();

        if (resSet.next()){
			int winnerId = resSet.getInt("placeId");
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
				",\"feast\":" +
				getFeastAsString(feastId, connection) +
				"}";
	}

    @Override
    public Out execute(In parameters) throws Exception {
		return OutBuilder.response("application/json", getSuggestionsAsString(parameters));
    }
}
