/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package org.jala.efeeder.foodmeeting;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jala.efeeder.api.command.AbstractCommandUnit;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.DisplayBean;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.PageCommand;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.order.OrdersDisplayBean;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;

/**
 *
 * @author Danitza Machicado
 */
@Command
public class SettingMeetingCommand extends PageCommand{	
	
	private static final String URL_PATTERN = "^(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]";
//	private static final String URL_PATTERN = ".*http://.*";
	
	private Pattern pattern;
	private Matcher matcher;	
	
	
	@Override
	public Out execute() throws Exception {
		Out out = new DefaultOut();
		Connection connection = parameters.getConnection();

		FoodMeeting foodMeeting = new FoodMeeting();
		String id = parameters.getParameter("id_food_meeting");
		FoodMeetingManager meetingManager = new FoodMeetingManager(connection);
		foodMeeting = meetingManager.getFoodMeetingById(Integer.parseInt(id));
		boolean isMeetingOwner = foodMeeting.getUserOwner().equals(parameters.getUser());
		
		FoodMeetingDisplayBean foodMeetingDisplayBean = new FoodMeetingDisplayBean();
		
		foodMeetingDisplayBean.setEventDate(foodMeeting.getEventDate());
		foodMeetingDisplayBean.setId(foodMeeting.getId());
		foodMeetingDisplayBean.setName(foodMeeting.getName());				
		foodMeetingDisplayBean.setImageLink(foodMeeting.getImageLink());
		foodMeetingDisplayBean.setDate(foodMeeting.getDate());
		foodMeetingDisplayBean.setTime(foodMeeting.getTime());
		foodMeetingDisplayBean.setStatus(foodMeeting.getStatus());
		foodMeetingDisplayBean.setEventDate(foodMeeting.getEventDate());
		foodMeetingDisplayBean.setVotingDate(foodMeeting.getVotingDate());
		foodMeetingDisplayBean.setOrderDate(foodMeeting.getOrderDate());
		foodMeetingDisplayBean.setPaymentDate(foodMeeting.getPaymentDate());
		foodMeetingDisplayBean.setUserOwner(foodMeeting.getUserOwner());
		foodMeetingDisplayBean.setCreatedAt(foodMeeting.getCreatedAt());
		foodMeetingDisplayBean.setBuyerId(foodMeeting.getBuyerId());
							
		out.addResult(DisplayBean.DISPLAY_BEAN_ATTRIBUTE, foodMeetingDisplayBean);

		if(isMeetingOwner) {
			out.forward("foodmeeting/settingMeeting.jsp");
		} else {
			out.redirect("/action/FoodMeeting");
		}

		return out;
	}
	
	@Override
	public boolean checkParameters(){								
		return true;
	}	   

	public DisplayBean getDisplayBean(){
		FoodMeetingDisplayBean dp = new FoodMeetingDisplayBean();
		return dp;
		
	}	
}