package org.jala.efeeder.servlets.websocket;

import org.jala.efeeder.servlets.websocket.avro.MessageContext;

import javax.websocket.Session;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.logging.Logger;

/**
 * Created by alejandro on 21-09-16.
 */
public class FoodMeetingRoom {
    private final static Logger LOG = Logger.getLogger(FoodMeetingRoom.class.toString());

    private final Set<FellowDinner> fellowDinners;

    public FoodMeetingRoom() {
        fellowDinners = new CopyOnWriteArraySet<>();
    }

    public FellowDinner addFellowDinner(Session session) {
		FellowDinner fellowDinner = new FellowDinner(session, this);
        fellowDinners.add(fellowDinner);
		return fellowDinner;
    }

    public void sendMessage(MessageContext messageContext) {
        for (FellowDinner client : fellowDinners) {
            if (!client.sendMessage(messageContext)){
                fellowDinners.remove(client);
            }
        }
    }

	/**
	 * Inner class, FellowDinner are members of FoodMeetingRoom
	 */
    public static class FellowDinner {
        private final Session session;
		private final FoodMeetingRoom room;
		
		private FellowDinner (Session session, FoodMeetingRoom room){
			this.session = session;
			this.room = room;
		}

        public FoodMeetingRoom getRoom() {
            return room;
        }

        public Session getSession() {
            return session;
        }

        public boolean sendMessage(MessageContext messageContext) {
            try {
                synchronized (session) {
                    session.getBasicRemote().sendText(MessageContextHelper.serialize(messageContext));
                    return true;
                }
            } catch (IOException|IllegalStateException e) {
                LOG.fine("Failed to send message to client: " + session.getId());
                room.fellowDinners.remove(this);
                try {
                    session.close();
                } catch (IOException e1) {
                    // Ignore
                }
                return false;
            }
        }
    }
}
