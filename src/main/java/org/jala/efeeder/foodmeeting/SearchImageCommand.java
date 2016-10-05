package org.jala.efeeder.foodmeeting;

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
 * Created by alejandro on 09-09-16.
 */
@Command
public class SearchImageCommand implements CommandUnit {

	private static final String SELECT_IMAGE_FOOD_MEETING_SQL = "Select distinct image_link from food_meeting";

	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();

		PreparedStatement stm = parameters.getConnection().prepareStatement(SELECT_IMAGE_FOOD_MEETING_SQL);
		ResultSet resultSet = stm.executeQuery();

		List<String> images = new ArrayList<>();
		while (resultSet.next()) {
			images.add(resultSet.getString(1));
		}
		out.addResult("images", images);
		
		return out.forward("foodmeeting/searchImage.jsp");
	}
}
