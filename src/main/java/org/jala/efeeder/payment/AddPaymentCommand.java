/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.payment;

import java.sql.Connection;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;

/**
 *
 * @author rodrigo_ruiz
 */
@Command
public class AddPaymentCommand implements CommandUnit {

    @Override
    public Out execute(In parameters) throws Exception {
        String idFoodMeeting = parameters.getParameter("id_food_meeting");
        String idUser = parameters.getParameter("id_user");
        int idUserVal = !idUser.equals("") ? Integer.valueOf(idUser) : 0;
        String details = parameters.getParameter("details");
        String cost = parameters.getParameter("cost");
        double costVal = !cost.equals("") ? Double.valueOf(cost) : 0;
        String payment = parameters.getParameter("payment");
        double paymentVal = !payment.equals("")?Double.valueOf(payment):0;
        Connection connection = parameters.getConnection();
        UserManager userManager = new UserManager(connection);
        userManager.updatePayment(Integer.valueOf(idFoodMeeting), idUserVal, paymentVal);
        User user = userManager.getUserById(idUserVal);
        return OutBuilder.response("application/json", JsonConverter.objectToJSON(user));
    }
}
