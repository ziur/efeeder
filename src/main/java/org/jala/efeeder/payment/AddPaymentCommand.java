/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.payment;

import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.utils.JsonConverter;

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
        String details = parameters.getParameter("details");
        String cost = parameters.getParameter("cost");
        String payment = parameters.getParameter("payment");
        
        
        return OutBuilder.response("application/json", JsonConverter.objectToJSON("{}"));
    }
}
