package org.jala.efeeder.home;

import org.jala.efeeder.api.command.AbstractCommandUnit;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.PageCommand;
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class HomeCommand extends PageCommand{
    @Override
    public Out execute() throws Exception {
        return new DefaultOut().forward("home/home.jsp");
    }

	@Override
	public boolean checkParameters() { 
		return true;
	}	
}
