/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.user;

import java.sql.PreparedStatement;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;
import org.jala.efeeder.util.Encrypt;

/**
 *
 * @author rodrigo_ruiz
 */
@Command
public class CreateUserCommand implements CommandUnit{

	private static final String CREATE_USER_SQL = "insert into user(name, last_name, email, username, password)" + " values(?, ?, ?, ?, ?)";
	private static final String JSON_RESPONSE = "";

	@Override
	public Out execute(In parameters) throws Exception {

		PreparedStatement stm = parameters.getConnection().prepareStatement(CREATE_USER_SQL);

		stm.setString(1, parameters.getParameter("name"));
		stm.setString(2, parameters.getParameter("last_name"));
		stm.setString(3, parameters.getParameter("email"));
		stm.setString(4, parameters.getParameter("username"));
		stm.setString(5, Encrypt.getPasswordEncrypt(parameters.getParameter("password")));
		stm.executeUpdate();

		return OutBuilder.response("application/json", JsonConverter.objectToJSON(JSON_RESPONSE));
	}
}
