package org.jala.efeeder.user;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

@Command
public class UserMeetingsCommand extends MockCommandUnit{
    @Override
    public Out execute() throws Exception {
        Out out = new DefaultOut();
        return out.forward("user/history.jsp");
    }
}
