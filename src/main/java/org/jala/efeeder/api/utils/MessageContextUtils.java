package org.jala.efeeder.api.utils;

import java.util.List;
import org.apache.avro.specific.SpecificRecordBase;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;

/**
 *
 * @author amir_aranibar
 */
public class MessageContextUtils {

	public static <T extends SpecificRecordBase> T getEvent(MessageContext context, Class<T> eventClass) {
		T resultEvent = null;
		List<MessageEvent> events = context.getEvents();
		for (MessageEvent event : events) {
			Object subEvent = event.getEvent();
			if (subEvent.getClass() == eventClass) {
				resultEvent = (T) subEvent;
				break;
			}
		}

		return resultEvent;
	}
}
