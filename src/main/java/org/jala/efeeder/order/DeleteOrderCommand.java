package org.jala.efeeder.order;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.user.User;

/**
 *
 * @author Mirko Terrazas
 */
@Command
public class DeleteOrderCommand implements CommandUnit {
    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();           
        Connection connection = parameters.getConnection();
        
        PreparedStatement preparedStatement = connection.prepareStatement("Delete from orders where id_food_meeting= ? and id_user = ?");
        preparedStatement.setInt(1, Integer.valueOf(parameters.getParameter("id_food_meeting")));
        preparedStatement.setInt(2, Integer.valueOf(parameters.getParameter("id_user")));
        preparedStatement.executeUpdate();                
        
//        Order deletedOrder = new Order(
//                Integer.valueOf(parameters.getParameter("id_food_meeting")), 
//                new User(Integer.valueOf(parameters.getParameter("id_user")), "", "", ""), 
//                "", 
//                0.0);
//        
        out.addResult("order", null);
        return out.forward("order/orderJson.jsp"); 
    }    
}
