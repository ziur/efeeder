/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.user;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 *
 * @author rodrigo_ruiz
 */
@Command
public class UpdateUserPageCommand extends MockCommandUnit{
	@Override
	public Out execute() throws Exception {
		Out out = new DefaultOut();

		out.addResult("user", parameters.getUser());
		out.addResult("new", false);

		return out.forward("user/user.jsp");
	}
}
