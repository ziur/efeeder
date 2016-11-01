
package org.jala.efeeder.places;


import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 * 
 * @author Roger Ayaviri
 *
 */
@Command
public class ImportPlacePageCommand implements CommandUnit {

	@Override
	public Out execute(In parameters) throws Exception {
		Out out = new DefaultOut();
		
		return out.forward("place/importPlace.jsp");
	}
}