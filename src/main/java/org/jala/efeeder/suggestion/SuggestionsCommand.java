package org.jala.efeeder.suggestion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.foodmeeting.FoodMeetingManager;
import org.jala.efeeder.places.Place;

/**
 *
 * @author Amir
 */
@Command
public class SuggestionsCommand extends MockCommandUnit {
	private static final String TOP_FIVE_PLACES_QUERY = "SELECT * FROM places ORDER BY created_at DESC limit 10";

	@Override
	public Out execute() throws Exception {
		Connection connection = parameters.getConnection();
		PreparedStatement preparedStatement = connection.prepareStatement(TOP_FIVE_PLACES_QUERY);
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
		out.addResult("feastId", id);
		out.addResult("votingTime", getSuggestionTime(connection, Integer.parseInt(id)));
		
		return out.forward("suggestion/suggestions.jsp");
	}
	
	private Timestamp getSuggestionTime(Connection connection, int idFoodMeeting) throws SQLException {
		FoodMeetingManager foodMeetingManager = new FoodMeetingManager(connection);
		return foodMeetingManager.getFoodMeetingById(idFoodMeeting).getVotingDate();
	}
}