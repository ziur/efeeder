/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.user;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.ExitStatus;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;
import org.jala.efeeder.util.Encrypt;
import org.jala.efeeder.util.JsonMessage;

/**
 *
 * @author rodrigo_ruiz
 */
@Command
public class CreateUpdateUserCommand extends MockCommandUnit{

	@SuppressWarnings("finally")
	@Override
	public Out execute(In parameters) throws Exception {
		ExitStatus status = ExitStatus.SUCCESS;
		String result = "";
		JsonMessage jsonMessage = new JsonMessage("The user was created correctly");

		boolean isNew = Boolean.valueOf(parameters.getParameter("isNew"));

		User user = new User(isNew? -1 : parameters.getUser().getId(),
				parameters.getParameter("email"),
				parameters.getParameter("name"),
				parameters.getParameter("last_name"),
				parameters.getParameter("image"),
				parameters.getParameter("username"),
				Encrypt.getPasswordEncrypter(parameters.getParameter("password")));
		try {
			UserManager userManager = new UserManager(parameters.getConnection());

			if (isNew){
				userManager.insertUser(user);
			}
			else{
				if("empty".equals(parameters.getParameter("image"))) {
					user.setImage(parameters.getUser().getImage());
				}

				userManager.updateUser(user);
			}

			result = JsonConverter.objectToJSON(jsonMessage);
		}
		catch (Exception e) {
			jsonMessage.setMessage(e.getMessage());
			status = ExitStatus.FAIL;
			result = JsonConverter.objectToJSON(jsonMessage);
		}
		finally {
			return OutBuilder.response("application/json", result, status);
		}
	}
}
