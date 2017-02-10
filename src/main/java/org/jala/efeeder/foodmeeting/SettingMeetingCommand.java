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

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.DisplayBean;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.order.OrdersDisplayBean;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;

/**
 *
 * @author Danitza Machicado
 */
@Command
public class SettingMeetingCommand extends MockCommandUnit{	

	@Override
	public Out execute() throws Exception {
		Out out = new DefaultOut();
		Connection connection = parameters.getConnection();

		FoodMeeting foodMeeting = new FoodMeeting();
		String id = parameters.getParameter("id_food_meeting");
		FoodMeetingManager meetingManager = new FoodMeetingManager(connection);
		foodMeeting = meetingManager.getFoodMeetingById(Integer.parseInt(id));
		boolean isMeetingOwner = foodMeeting.getUserOwner().equals(parameters.getUser());
		
		FoodMeetingDisplayBean FoodMeetingDisplayBean = new FoodMeetingDisplayBean();
		
		FoodMeetingDisplayBean.setEventDate(foodMeeting.getEventDate());
		FoodMeetingDisplayBean.setId(foodMeeting.getId());
		FoodMeetingDisplayBean.setName(foodMeeting.getName());				
		FoodMeetingDisplayBean.setImageLink(foodMeeting.getImageLink());
		FoodMeetingDisplayBean.setDate(foodMeeting.getDate());
		FoodMeetingDisplayBean.setTime(foodMeeting.getTime());
		FoodMeetingDisplayBean.setStatus(foodMeeting.getStatus());
		FoodMeetingDisplayBean.setEventDate(foodMeeting.getEventDate());
		FoodMeetingDisplayBean.setVotingDate(foodMeeting.getVotingDate());
		FoodMeetingDisplayBean.setOrderDate(foodMeeting.getOrderDate());
		FoodMeetingDisplayBean.setPaymentDate(foodMeeting.getPaymentDate());
		FoodMeetingDisplayBean.setUserOwner(foodMeeting.getUserOwner());
		FoodMeetingDisplayBean.setCreatedAt(foodMeeting.getCreatedAt());
		FoodMeetingDisplayBean.setBuyerId(foodMeeting.getBuyerId());
		
		out.addResult("foodMeeting", foodMeeting);				
		out.addResult(DisplayBean.DISPLAY_BEAN_ATTRIBUTE, FoodMeetingDisplayBean);

		if(isMeetingOwner) {
			out.forward("foodmeeting/settingMeeting.jsp");
		} else {
			out.redirect("/action/FoodMeeting");
		}

		return out;
	}
	
	public void setIn(In parameters){
		
	}
	
	
	public boolean checkParameters(In parameters){
		return true;
	}	   

	public DisplayBean getDisplayBean(){
		FoodMeetingDisplayBean dp = new FoodMeetingDisplayBean();
		return dp;
		
	}
}