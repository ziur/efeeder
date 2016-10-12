/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package org.jala.efeeder.foodmeeting;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserUtilDataBase;

/**
 *
 * @author Danitza Machicado
 */
@Command
public class SettingMeetingCommand implements CommandUnit {

	private static final String SELECT_FOOD_MEETING_SQL = "Select name, image_link, status, event_date, created_at, id_user from food_meeting where id = ?";

	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();
		Connection connection = parameters.getConnection();

		FoodMeeting foodMeeting = new FoodMeeting();
		String id = parameters.getParameter("id_food_meeting");
		PreparedStatement preparedStatement = connection.prepareStatement(SELECT_FOOD_MEETING_SQL);
		preparedStatement.setInt(1, Integer.valueOf(id));
		ResultSet resultSet = preparedStatement.executeQuery();

		if (resultSet.next()) {

			User userOwner = UserUtilDataBase.getUser(parameters, resultSet.getInt(6));

			foodMeeting = (new FoodMeeting(Integer.valueOf(id), resultSet.getString(1), resultSet.getString(2),
					resultSet.getString(3), resultSet.getTimestamp(4), resultSet.getTimestamp(5), userOwner));
		}

		out.addResult("foodMeeting", foodMeeting);
		out.addResult("edit", !foodMeeting.getUserOwner().equals(parameters.getUser()));
		out.forward("foodmeeting/settingMeeting.jsp");

		return out;
	}
}