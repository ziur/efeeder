
package org.jala.efeeder.places;


import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.impl.DefaultOut;

/**
 * 
 * @author Roger Ayaviri
 *
 */
@Command
public class ImportPlacePageCommand extends MockCommandUnit{

	@Override
	public Out execute() throws Exception {
		Out out = new DefaultOut();
		
		return out.forward("place/importPlace.jsp");
	}
}