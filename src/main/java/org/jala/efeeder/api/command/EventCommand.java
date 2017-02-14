/**
 * 
 */
package org.jala.efeeder.api.command;

import java.util.ArrayList;
import java.util.List;

import org.apache.avro.specific.SpecificRecordBase;
import org.jala.efeeder.common.ErrorMessage;
import org.jala.efeeder.servlets.websocket.avro.ErrorEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;

/**
 * Command that process an incoming event
 * 
 * @author Patricia Escalera
 *
 */
public abstract class EventCommand extends AbstractCommandUnit {

	//protected int foodMeetingId;

	/**
	 * 
	 */
	public EventCommand() {
		super();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see org.jala.efeeder.api.command.CommandUnit#checkParameters()
	 */
	protected MessageContext outMessageContext;

	public Out getErrorResponse() {

		List<MessageEvent> events = new ArrayList<>();
		StringBuilder messageText = new StringBuilder();
		for (ErrorMessage errorMsg : this.errorManager.getAllErrorMessages()) {
			messageText.append(errorMsg.getMessage()).append("\n");
		}
		events.add(MessageEvent.newBuilder()
				.setEvent(
						ErrorEvent.newBuilder()
								.setErrorMessage(messageText.toString())
								.setIdUser(this.userId)
								.build())
				.build());

		MessageContext messageContext = MessageContext.newBuilder()
				.setRoom(Integer.toString(this.idFoodMeeting))
				.setUser(this.userId)
				.setEvents(events)
				.build();

		return OutBuilder.response(messageContext);

	}
}
