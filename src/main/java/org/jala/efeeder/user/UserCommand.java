package org.jala.efeeder.user;

import org.jala.efeeder.api.command.AbstractCommandUnit;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.DisplayBean;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 *
 * @author rodrigo_ruiz
 */
@Command
public class UserCommand extends  MockCommandUnit{
	
	UserDisplayBean bean;
	
	
	@Override
	public Out execute() throws Exception {
		Out out = new DefaultOut();
		
		bean = new UserDisplayBean(0,"myemail@xyz.com", "Patty", "hello","empty","","");
		
		out.addResult(DisplayBean.DISPLAY_BEAN_ATTRIBUTE, bean);
		
		//out.addResult("user", new User(0, "", "noname", "", "empty", "", ""));
		//out.addResult("newUser", true);

		return out.forward("user/user.jsp");
	}


	@Override
	public boolean checkParameters() {
		// TODO Auto-generated method stub
		return true;
	}
}
