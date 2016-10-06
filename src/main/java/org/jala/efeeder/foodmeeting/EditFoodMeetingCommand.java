/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.foodmeeting;

import java.sql.PreparedStatement;
import java.sql.Timestamp;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

/**
 *
 * @author Danitza Machicado
 */
@Command
public class EditFoodMeetingCommand implements CommandUnit {

	private static final String UPDATE_FOOD_MEETING_SQL = "UPDATE food_meeting SET name= ?, image_link= ?, status=?, event_date=? WHERE id= ?;";

	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();

		PreparedStatement stm = parameters.getConnection()
				.prepareStatement(UPDATE_FOOD_MEETING_SQL);

		DateTimeFormatter formatter = DateTimeFormat.forPattern("dd MMMM, yyyy HH:mm");
		DateTime dateTime = formatter.parseDateTime(parameters.getParameter("date") + " " + parameters.getParameter("time"));
		Timestamp eventDate = new Timestamp(dateTime.getMillis());

		try {
			stm.setString(1, parameters.getParameter("meeting_name"));
			stm.setString(2, parameters.getParameter("image_link"));
			stm.setString(3, parameters.getParameter("status"));
			stm.setTimestamp(4, eventDate);
			stm.setInt(5, Integer.valueOf(parameters.getParameter("id-food-meeting")));
			stm.executeUpdate();
		} catch (Exception e) {
		}

		return out.redirect("/action/FoodMeeting");
	}
}
