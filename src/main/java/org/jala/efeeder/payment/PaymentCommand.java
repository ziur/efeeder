package org.jala.efeeder.payment;

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

/**
 *
 * @author Mirko Terrazas
 */
@Command
public class PaymentCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {

        List<Payment> payments = new ArrayList<>();

        Out out = new DefaultOut();
        Connection connection = parameters.getConnection();
        PreparedStatement preparedStatement = connection.prepareStatement("Select o.id_food_meeting, u.name, o.order_name, o.cost from orders o, users u where o.id_food_meeting = ?");
        preparedStatement.setInt(1, Integer.valueOf(parameters.getParameter("id_food_meeting")));
        ResultSet resultSet = preparedStatement.executeQuery();

        while (resultSet.next()) {
            payments.add(new Payment(resultSet.getString(1), resultSet.getString(2), resultSet.getString(3), resultSet.getDouble(4)));
        }

        out.addResult("meetingName", parameters.getParameter("meeting_name"));
        out.addResult("payments", payments);
        out.forward("payment/payment.jsp");

        return out;
    }
}