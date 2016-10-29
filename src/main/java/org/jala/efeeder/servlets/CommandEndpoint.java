package org.jala.efeeder.servlets;

import org.jala.efeeder.api.command.CommandExecutor;
import org.jala.efeeder.api.command.CommandFactory;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.database.DatabaseManager;
import org.jala.efeeder.servlets.support.InBuilder;
import org.jala.efeeder.servlets.websocket.FoodMeetingRoom;
import org.jala.efeeder.servlets.websocket.FoodMeetingRoomManager;
import org.jala.efeeder.servlets.websocket.GetHttpSessionConfigurator;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.servlets.websocket.avro.WelcomeEvent;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpSession;
import org.jala.efeeder.user.User;


/**
 * Created by alejandro on 16-09-16.
 */

@ServerEndpoint(value = "/ws", configurator = GetHttpSessionConfigurator.class)
public class CommandEndpoint {
    private final static Logger LOG = Logger.getLogger(CommandEndpoint.class.toString());
    private static final Object ROOM_LOCK = new Object();
    private static volatile FoodMeetingRoomManager roomManager = null;
    private CommandFactory commandFactory;
    private FoodMeetingRoom.FellowDinner fellowDinner;


    public static FoodMeetingRoomManager getRoomManager() {
		FoodMeetingRoomManager result = roomManager;
        if (result == null) {
			synchronized (ROOM_LOCK) {
				result = roomManager;
				if (result == null) {
					roomManager = result = new FoodMeetingRoomManager();
				}
			}
		}
        return result;
    }

    @OnOpen
    public void onOpen(Session session, EndpointConfig config) throws IOException {
        String roomId = session.getRequestParameterMap().get("roomId").get(0);
		
        HttpSession httpSession = (HttpSession)config.getUserProperties().get(HttpSession.class.getName());
		session.getUserProperties().put("user", httpSession.getAttribute("user"));

        commandFactory = (CommandFactory) config.getUserProperties().get(CommandFactory.class.getName());

        LOG.log(Level.INFO, "Start connection" + session.getId());
        FoodMeetingRoom room = getRoomManager().getRoom(roomId);
        if (room == null) {
            room = getRoomManager().registerRoom(roomId);
        }
        fellowDinner = room.addFellowDinner(session);

        List<MessageEvent> events = new ArrayList<>();
        events.add(MessageEvent.newBuilder().setEvent(new WelcomeEvent()).build());
        MessageContext messageContext = MessageContext.newBuilder()
                                                .setRoom(roomId)
                                                .setUser(0)
                                                .setEvents(events)
                                                .build();
        fellowDinner.sendMessage(messageContext);
    }

    @OnClose
    public void onClose(Session session) {
        LOG.log(Level.INFO, "Stop connection" + session.getId());
    }

    @OnMessage
    public void onMessage(String message, Session session) {


        DatabaseManager databaseManager = new DatabaseManager();
        CommandExecutor executor = new CommandExecutor(databaseManager);
        In in = InBuilder.createIn(message);
		in.setUser((User)session.getUserProperties().get("user"));
		
        Out out = executor.executeCommand(in, commandFactory.getInstance(in.getMessageContext().getCommand().toString()));
        fellowDinner.getRoom().sendMessage(out.getMessageContext());
    }

    @OnError
    public void onError(Throwable t) {
        t.printStackTrace(System.out);
    }
	
	public static boolean sendMessage(MessageContext message) {
		boolean isRoomEmpty = true;
		
		FoodMeetingRoom foodMeetingRoom = CommandEndpoint.getRoomManager().getRoom(message.getRoom());
		isRoomEmpty = (foodMeetingRoom == null);
		if(!isRoomEmpty) {
			foodMeetingRoom.sendMessage(message);
		}
		
		return isRoomEmpty;		
	}
}
