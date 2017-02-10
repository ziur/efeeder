package org.jala.efeeder.voting;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by alejandro on 08-09-16.
 */
@Command
public class VotingCommand extends MockCommandUnit{
    @Override
    public Out execute() throws Exception {
        String a = parameters.getParameter("a") + "- Param";
        Connection connection = parameters.getConnection();
        Statement statement = connection.createStatement();
        ResultSet resultSet = statement.executeQuery("Select * from items");
        Out out = new DefaultOut();
        List<Vote> votes = new ArrayList<Vote>();
        while (resultSet.next()) {
            votes.add(new Vote(resultSet.getString(1), resultSet.getString(2)));
        }
        out.addResult("votes", votes);
        out.addResult("a", a);
        out.forward("voting/vote.jsp");
        return out;
    }
}
