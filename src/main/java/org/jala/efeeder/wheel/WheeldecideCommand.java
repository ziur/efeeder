/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.wheel;

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
 * @author alexander_castro
 */
@Command
public class WheeldecideCommand implements CommandUnit{

    @Override
    public Out execute(In context) throws Exception {    
        int choseIndex = 0;
        PreparedStatement pStatement = context.getConnection()
                .prepareStatement("select id,name from user,orders where id_food_meeting=? and id=id_user");
        
        pStatement.setInt(1, Integer.valueOf(context.getParameter("id_food_meeting2")));
        
        ResultSet resultSet = pStatement.executeQuery();
                
        int count = 0;
        List<User> users = new ArrayList<>();
        StringBuilder jsonData = new StringBuilder(0xFF);
        jsonData.append("'{\"items\":[");
        while (resultSet.next()) {
            if (count > 0) jsonData.append(",");
            int idUser = resultSet.getInt(1);
            String nameUser = resultSet.getString(2);
            jsonData.append(escapeJsonString(nameUser));
            users.add(new User(idUser, nameUser));
            ++count;
        }
        choseIndex = getRandomIndexPerson(count);
	jsonData.append("],\"chosen\":");
        jsonData.append(choseIndex);
        jsonData.append("}'");
        
        insertNewBuyer(context, users.get(choseIndex).getId());
	
	Out out = new DefaultOut();
        out.addResult("jsonData", jsonData.toString());
        out.forward("wheeldecide/wheel.jsp");
        return out;
    }
    
    private static int insertNewBuyer(In context, int choseUserId) throws Exception{
        PreparedStatement stm = context.getConnection()
                                        .prepareStatement("insert into buyer(id_food_meeting, id_user) values(?, ?)");

        stm.setInt(1, Integer.valueOf(context.getParameter("id_food_meeting2")));
        stm.setInt(2, choseUserId);
        return stm.executeUpdate();
    }
    
    
    private static int getRandomIndexPerson(int numberOfPersons){
        return (int)Math.floor(Math.random() * numberOfPersons);
    }
    
    private static String escapeJsonString(String string) {
        if (null == string || 0 == string.length()) {
            return "\"\"";
        }

        final int len = string.length();
        StringBuilder sb = new StringBuilder(len + 8);
        sb.append('"');

        final String escapeInput = "\\\"/\b\t\n\f\r";
        final String escapeOutput = "\\\"/btnfr";
        for (int i = 0; i < len; ++i) {
            final char c = string.charAt(i);
            final int index = escapeInput.indexOf(c);
            if (index != -1)
            {
                sb.append('\\');
                sb.append(escapeOutput.charAt(index));
            }
            else if (c < ' ') {
                sb.append(String.format("\\u%04x", c));
            } else {
                sb.append(c);
            }
        }
        sb.append('"');
        return sb.toString();
    }

    
}
