package org.jala.efeeder.payment;

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
        
        String meetingName = "Chicken Kingdom";
        payments.add(new Payment("1", "Roger Ayaviri", "Pierna de poyo", 10.0));
        payments.add(new Payment("1", "Mirko Terrazas", "Hamburguesa", 0.0));
        payments.add(new Payment("1", "Ricardo Ruiz", "Papas y refresco", 10.0));
        payments.add(new Payment("1", "Rodrigo Ruiz", "Ensalada", 15.0));
        payments.add(new Payment("1", "Alejandro Ruiz", "Todo lo anterior", 5.0));
        Out out = new DefaultOut();
        
        out.addResult("meetingName", meetingName);
        out.addResult("payments", payments);
        out.forward("payment/payment.jsp");
        return out;
    }    
}