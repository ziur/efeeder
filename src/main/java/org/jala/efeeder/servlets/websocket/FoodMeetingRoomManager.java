package org.jala.efeeder.servlets.websocket;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by alejandro on 21-09-16.
 */
public class FoodMeetingRoomManager {
    private final Map<String, FoodMeetingRoom> rooms;
    public FoodMeetingRoomManager() {
        rooms = new ConcurrentHashMap<>();
    }

    public FoodMeetingRoom getRoom(String id) {
        return rooms.get(id);
    }

    public FoodMeetingRoom registerRoom(String id) {
        FoodMeetingRoom room = new FoodMeetingRoom();
        rooms.put(id, room);
        return room;
    }
}
