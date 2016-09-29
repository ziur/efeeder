package org.jala.efeeder.servlets.websocket;

import org.jala.efeeder.servlets.websocket.avro.MessageContext;

import javax.websocket.Session;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.logging.Logger;

/**
 * Created by alejandro on 21-09-16.
 */
public class FoodMeetingRoom {
    private final static Logger log = Logger.getLogger(FoodMeetingRoom.class.toString());

    private Set<FellowDinner> fellowDinners;

    public FoodMeetingRoom() {
        fellowDinners = new CopyOnWriteArraySet<>();
    }

    public void addFellowDinner(FellowDinner fellowDinner) {
        fellowDinners.add(fellowDinner);
        fellowDinner.setRoom(this);
    }

    public void sendMessage(MessageContext messageContext) {
        for (FellowDinner client : fellowDinners) {
            if (!client.sendMessage(messageContext)){
                fellowDinners.remove(client);
            }

        }
    }

    public static class FellowDinner {
        private FoodMeetingRoom room;
        private Session session;

        public FoodMeetingRoom getRoom() {
            return room;
        }

        public void setRoom(FoodMeetingRoom room) {
            this.room = room;
        }

        public Session getSession() {
            return session;
        }

        public void setSession(Session session) {
            this.session = session;
        }

        public boolean sendMessage(MessageContext messageContext) {
            try {
                synchronized (session) {
                    session.getBasicRemote().sendText(MessageContextHelper.serialize(messageContext));
                    return true;
                }
            } catch (IOException|IllegalStateException e) {
                log.fine("Failed to send message to client: " + session.getId());
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
