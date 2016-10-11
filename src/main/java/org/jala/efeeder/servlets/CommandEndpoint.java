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
import org.jala.efeeder.servlets.websocket.avro.CloseVotingEvent;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.servlets.websocket.avro.MessageEvent;
import org.jala.efeeder.servlets.websocket.avro.WelcomeEvent;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;


/**
 * Created by alejandro on 16-09-16.
 */

@ServerEndpoint(value = "/ws", configurator = GetHttpSessionConfigurator.class)
public class CommandEndpoint {
    private final static Logger log = Logger.getLogger(CommandEndpoint.class.toString());
    private static final Object roomLock = new Object();
    private static volatile FoodMeetingRoomManager roomManager = null;
    private CommandFactory commandFactory;
    private FoodMeetingRoom.FellowDinner fellowDinner;


    public static FoodMeetingRoomManager getRoomManager() {
        if (roomManager == null) {
            synchronized (roomLock) {
                if (roomManager == null) {
                    roomManager = new FoodMeetingRoomManager();
                }
            }
        }
        return roomManager;
    }

    @OnOpen
    public void onOpen(Session session, EndpointConfig config) throws IOException {
        String roomId = session.getRequestParameterMap().get("roomId").get(0);
        commandFactory = (CommandFactory) config.getUserProperties().get(CommandFactory.class.getName());

        log.log(Level.INFO, "Start connection" + session.getId());
        fellowDinner = new FoodMeetingRoom.FellowDinner();
        fellowDinner.setSession(session);
        FoodMeetingRoom room = getRoomManager().getRoom(roomId);
        if (room == null) {
            room = getRoomManager().registerRoom(roomId);
        }
        room.addFellowDinner(fellowDinner);

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
        log.log(Level.INFO, "Stop connection" + session.getId());
    }

    @OnMessage
    public void onMessage(String message, Session session) {


        DatabaseManager databaseManager = new DatabaseManager();
        CommandExecutor executor = new CommandExecutor(databaseManager);
        In in = InBuilder.createIn(message);
        Out out = executor.executeCommand(in, commandFactory.getInstance(in.getMessageContext().getCommand().toString()));
        fellowDinner.getRoom().sendMessage(out.getMessageContext());
    }

    @OnError
    public void onError(Throwable t) {
        t.printStackTrace();

    }
}
