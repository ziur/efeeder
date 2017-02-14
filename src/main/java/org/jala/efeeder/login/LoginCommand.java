package org.jala.efeeder.login;

import org.jala.efeeder.api.command.AbstractCommandUnit;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.PageCommand;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.common.ErrorMessage;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;
import org.jala.efeeder.util.Encrypt;

/**
 * Created by roger on 09-09-19.
 */
@Command
public class LoginCommand extends PageCommand{

	@Override
	public Out execute() throws Exception {

		Out out = new DefaultOut();

		if (parameters.getParameter("username") == null || parameters.getParameter("password") == null) 
		{
			return out.redirect("logout");
		}

		UserManager userManager = new UserManager(parameters.getConnection());
		User user = userManager.getUserByUserNamePassword(parameters.getParameter("username"),
				Encrypt.getPasswordEncrypter(parameters.getParameter("password")));

		if (user != null) {
			out.setUser(user);
			out.addResult("user_name", user.toString());

			return out.redirect("FoodMeeting");
		} else {
			ErrorMessage errorMessage = new ErrorMessage("Your user name and password are not correct");
			out.addResult(ErrorMessage.KEY_ERROR_MESSAGE, errorMessage);			
			return out.forward("home/login.jsp");
		}
	}

	@Override
	public boolean checkParameters() {
		// TODO Auto-generated method stub
		return true;
	}
	
}
