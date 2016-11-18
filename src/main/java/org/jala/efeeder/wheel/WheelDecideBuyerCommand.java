/* Deprecated 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.wheel;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.user.User;

/**
 *
 * @author alexander_castro
 */
@Command
@Deprecated
public class WheelDecideBuyerCommand implements CommandUnit{

    @Override
    public Out execute(In parameters) throws Exception {
        Out out = new DefaultOut();           
        Connection connection = parameters.getConnection();
        
        PreparedStatement preparedStatement = connection.prepareStatement("select * from buyer where id_food_meeting= ?");
        preparedStatement.setInt(1, Integer.valueOf(parameters.getParameter("id_food_meeting")));
        ResultSet rSet = preparedStatement.executeQuery();
        Buyer buyer = null;
        
        if (rSet.next()) {
            buyer =new Buyer(rSet.getInt(1), rSet.getInt(2));
        }
        
        preparedStatement = connection.prepareStatement("Select id, email, name, last_name from user where id=?");
        preparedStatement.setInt(1, buyer.getUserId());
        rSet = preparedStatement.executeQuery();
        User user = null;

        if (rSet.next()) {
            user =new User(rSet.getInt(1), rSet.getString(2), rSet.getString(3), rSet.getString(4));
        }
        
        out.addResult("userDecide", user);
        return out.forward("order/buyerJson.jsp");
    }
    
}
