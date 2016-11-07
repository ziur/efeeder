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

	private static final String SELECT_USERS_BY_MEETING_SQL =
            "SELECT id_user,user.name,user.last_name,id_place FROM food_meeting_user,user WHERE food_meeting_user.id_food_meeting=? AND food_meeting_user.id_user=user.id";
    private static final String SELECT_PLACES_BY_MEETING_SQL =
            "SELECT places.id,places.name,places.description,places.phone,places.direction,places.image_link,count(food_meeting_user.id_user) AS votes FROM food_meeting_user,places WHERE food_meeting_user.id_food_meeting=? AND food_meeting_user.id_place=places.id GROUP BY places.id";
    private static final String SELECT_WINNER_PLACE_SQL =
			"SELECT id_place,count(*) AS votes FROM food_meeting_user WHERE id_food_meeting=? GROUP BY id_place ORDER BY votes DESC LIMIT 0, 2";
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
	
	static public String getUserSuggestionsAsString(int feastId, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement(SELECT_USERS_BY_MEETING_SQL);
        ps.setInt(1, feastId);
        ResultSet resSet = ps.executeQuery();
        
        List<UserAndPlace> usersAndPlaces = new ArrayList<>();
        while(resSet.next()) {
            usersAndPlaces.add(new UserAndPlace(
                    resSet.getInt("id_user"),
                    resSet.getInt("id_place"),
                    resSet.getString("user.name") + " " + resSet.getString("user.last_name")));
        }
        
		return JsonConverter.objectToJSON(usersAndPlaces);
	}
	
	static public String getPlacesSuggestionsAsString(int feastId, Connection connection) throws Exception {
        PreparedStatement ps = connection.prepareStatement(SELECT_PLACES_BY_MEETING_SQL);
        ps.setInt(1, feastId);
        ResultSet resSet = ps.executeQuery();
        
        List<Place> places = new ArrayList<>();
        while(resSet.next()) {
            places.add(new Place(resSet.getInt("places.id"), 
                    resSet.getString("places.name"), 
                    resSet.getString("places.description"), 
                    resSet.getString("places.phone"),
                    resSet.getString("places.direction"),
                    resSet.getString("places.image_link"),
                    resSet.getInt("votes")));
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
				",\"feast\":" +
				getFeastAsString(feastId, connection) +
				"}";
	}

    @Override
    public Out execute(In parameters) throws Exception {
		return OutBuilder.response("application/json", getSuggestionsAsString(parameters));
    }
}
