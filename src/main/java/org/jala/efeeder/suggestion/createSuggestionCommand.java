package org.jala.efeeder.suggestion;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.command.PaginationResult;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.api.utils.JsonConverter;

/**
 *
 * @author Amir
 */
@Command
public class createSuggestionCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {
        Connection connection = parameters.getConnection();
        PreparedStatement stm;
        int idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
        int idPlace = Integer.parseInt(parameters.getParameter("id_place"));
        int idUser = Integer.parseInt(parameters.getParameter("id_user"));
        
        if (idPlace <= 0) {
            stm = connection.prepareStatement("delete from food_meeting_user where id_user=? and id_food_meeting=?");
            stm.setInt(1, idUser);
            stm.setInt(1, idFoodMeeting);
            stm.executeQuery();
            return OutBuilder.response("text/plain", "Its out of the suggestions");
        }

        stm = connection
                .prepareStatement("insert into food_meeting_user(id_food_meeting, id_user, id_place) values(?, ?, ?)");
        stm.setInt(1, idFoodMeeting);
        stm.setInt(2, idUser);
        stm.setInt(3, idPlace);
        stm.executeUpdate();

        return OutBuilder.response("text/plain", "Its insert into food_meeting_user a new data");
    }
}
