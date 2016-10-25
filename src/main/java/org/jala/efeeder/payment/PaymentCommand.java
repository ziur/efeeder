/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.payment;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.user.User;

/**
 *
 * @author alexander_castro
 */
@Command
public class PaymentCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();
		Connection connection = parameters.getConnection();
		int foodMeetingId = Integer.parseInt(parameters.getParameter("id_food_meeting"));
		int buyerId = Integer.parseInt(parameters.getParameter("id_buyer"));
		User user = parameters.getUser();
		String isBuyer = (buyerId==user.getId()) ? "block" : "none";
		List<PaymentItem> itemList = getExtraItems(foodMeetingId, connection);
		
		out.addResult("items", itemList);
		out.addResult("estate", isBuyer);
		out.addResult("id_food_meeting", foodMeetingId);
		out.addResult("total_item_price", getTotalExternalItemPrice(itemList));
		return out.forward("payment/payment.jsp");
	}
	
	private List<PaymentItem> getExtraItems(int foodMeetingId, Connection connection) throws Exception{
		List<PaymentItem> resultItemsList = new ArrayList<>();
		
		try {
			PreparedStatement preparedStatement = connection.prepareStatement("select * from payment where id_food_meeting=?");
			preparedStatement.setInt(1, foodMeetingId);
			ResultSet result = preparedStatement.executeQuery();
			
			while(result.next()){
				resultItemsList.add(new PaymentItem(foodMeetingId, 
						result.getString("item_name"), 
						result.getString("item_description"), 
						result.getFloat("price")));
			}
		} catch (SQLException ex) {
			Logger.getLogger(PaymentCommand.class.getName()).log(Level.SEVERE, null, ex);
			throw new Exception("Throw a problem when we wont work with payments table : " + ex.getMessage());
		}
		
		return resultItemsList;
	}

	private double getTotalExternalItemPrice(List<PaymentItem> itemList) {
		double resp = 0;
		
		for (PaymentItem paymentItem : itemList) {
			resp += paymentItem.getPrice();
		}
		
		return resp;
	}

}
