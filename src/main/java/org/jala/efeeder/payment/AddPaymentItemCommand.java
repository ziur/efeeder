/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.payment;

import java.sql.Connection;
import java.sql.PreparedStatement;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;

/**
 *
 * @author alexander_castro
 */
@Command
public class AddPaymentItemCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		String itemName = parameters.getParameter("item_name");
		String itemDescription = parameters.getParameter("item_description");
		double itemPrice = Double.parseDouble(parameters.getParameter("item_price"));
		int idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
		Connection connection = parameters.getConnection();
		System.out.println("id food meeting : " + idFoodMeeting);
		PreparedStatement prepareStatement = connection.
				prepareStatement("INSERT INTO efeeder.payment (id_food_meeting, item_name, item_description, price)	VALUES (?, ?, ?, ?)");
		prepareStatement.setInt(1, idFoodMeeting);
		prepareStatement.setString(2, itemName);
		prepareStatement.setString(3, itemDescription);
		prepareStatement.setDouble(4, itemPrice);
		prepareStatement.executeUpdate();
		
		System.out.println("ya estubo");
		return OutBuilder.response("application/json", new PaymentItem(idFoodMeeting, itemName, itemDescription, itemPrice).toString());
	}
	
}
