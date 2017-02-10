/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.wheel;

import org.jala.efeeder.api.command.*;


/**
 * @author alexander_castro
 */
@Command
@Deprecated
public class WheeldecideCommand extends MockCommandUnit{

	@Override
	public Out execute(In context) throws Exception {
		return OutBuilder.response("text/plain", "Deprecated");
	}
}