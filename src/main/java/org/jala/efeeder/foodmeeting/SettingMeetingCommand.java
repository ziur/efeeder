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
import org.jala.efeeder.user.UserManager;

/**
 *
 * @author Danitza Machicado
 */
@Command
public class SettingMeetingCommand implements CommandUnit {	

	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();
		Connection connection = parameters.getConnection();

		FoodMeeting foodMeeting = new FoodMeeting();
		String id = parameters.getParameter("id_food_meeting");
		FoodMeetingManager meetingManager = new FoodMeetingManager(connection);
		foodMeeting = meetingManager.getFoodMeetingById(Integer.parseInt(id));
		boolean isMeetingOwner = foodMeeting.getUserOwner().equals(parameters.getUser());
		
		out.addResult("foodMeeting", foodMeeting);
		out.addResult("edit", !isMeetingOwner);
		
		if(isMeetingOwner) {
			out.forward("foodmeeting/settingMeeting.jsp");
		} else {
			out.redirect("/action/FoodMeeting");
		}
		
		return out;
	}
}