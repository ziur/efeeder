package org.jala.efeeder.foodmeeting;

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
import org.jala.efeeder.user.UserManager;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class FoodMeetingCommand extends MockCommandUnit {
	
	public static String KEY_FOOD_MEETING_ID = "idFoodMeeting";
	
	private static final String SELECT_IMAGE_FOOD_MEETING_SQL = "Select distinct image_link from food_meeting";
	
	@Override
	public Out execute() throws Exception {
		Out out = new DefaultOut();
		Connection connection = parameters.getConnection();
		
		out.addResult("images", getImageFoodMeeting(connection));

		return out.forward("foodmeeting/foodMeeting.jsp");
	}
	
	private List<String> getImageFoodMeeting(Connection connection) throws SQLException {
		PreparedStatement stm = connection.prepareStatement(SELECT_IMAGE_FOOD_MEETING_SQL);
		ResultSet resultSet = stm.executeQuery();

		List<String> images = new ArrayList<>();
		while (resultSet.next()) {
			images.add(resultSet.getString(1));
		}
		return images;
	}
}
