package org.jala.efeeder.user;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 *
 * @author rodrigo_ruiz
 */
@Command
public class UserCommand implements CommandUnit{
	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();

		out.addResult("user", new User(0, "", "", "", "empty", "", ""));
		out.addResult("newUser", true);

		return out.forward("user/user.jsp");
	}
}
