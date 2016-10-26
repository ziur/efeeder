/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.payment;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
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
public class DeletePaymentItemCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) {
		try {
			Connection connection = parameters.getConnection();
			int index = Integer.parseInt(parameters.getParameter("index"));
			PreparedStatement preparedStatement = connection.prepareStatement("delete from payment where id=?");
			preparedStatement.setInt(1, index);
			preparedStatement.executeUpdate();
			return OutBuilder.response("text/plain", "ya se hizo lo nesesario");
		} catch (SQLException ex) {
			return OutBuilder.newError(ex);
		}
	}
	
}
