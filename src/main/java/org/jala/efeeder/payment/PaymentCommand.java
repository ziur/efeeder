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
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 *
 * @author alexander_castro
 */
@Command
public class PaymentCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();

		return out.forward("payment/payment.jsp");
	}

}
