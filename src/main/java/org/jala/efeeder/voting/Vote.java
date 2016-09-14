package org.jala.efeeder.voting;

/**
 * Created by alejandro on 08-09-16.
 */
public class Vote {
    private String id;
    private String name;

    public Vote(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
