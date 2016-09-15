package org.jala.efeeder.suggestion;

import java.sql.Date;
import java.sql.PreparedStatement;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 *
 * @author Amir
 */
@Command
public class createSuggestionCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();
        int idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
        if (parameters.getParameter("place") == null && idFoodMeeting > 0) {
            return out.forward("suggestion/createSuggestion.jsp");
        }

        PreparedStatement stm = parameters.getConnection()
                .prepareStatement("insert into suggestions(id_food_meeting, id_user, place, description, created_at) values(?, ?, ?, ?, ?)");
        stm.setInt(1, idFoodMeeting);
        stm.setInt(2, 1);
        stm.setString(3, parameters.getParameter("place"));
        stm.setString(4, parameters.getParameter("description"));
        stm.setDate(5, new Date(System.currentTimeMillis()));
        stm.executeUpdate();

        return out.redirect("action/suggestions?id_food_meeting=" + idFoodMeeting);
    }
}
