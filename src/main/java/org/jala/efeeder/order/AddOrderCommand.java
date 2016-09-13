package org.jala.efeeder.order;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

import java.sql.*;

/**
 * Created by alejandro on 09-09-16.
 */
@Command
public class AddOrderCommand implements CommandUnit {
    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();

        PreparedStatement stm = parameters.getConnection()
                                        .prepareStatement("insert into orders(id_food_meeting, id_user, order_name, cost) values(?, ?, ?, ?)");

        stm.setInt(1, Integer.valueOf(parameters.getParameter("id_food_meeting")));
        stm.setInt(2, Integer.valueOf(parameters.getParameter("id_user")));
        stm.setString(3, parameters.getParameter("order"));
        stm.setDouble(4, 0.00);
        stm.executeUpdate();

        return out.redirect("action/order?id_food_meeting="+parameters.getParameter("id_food_meeting"));
    }
}
