package org.jala.efeeder.api.command;

import java.util.List;

/**
 * Created by alejandro on 16-09-16.
 */
public class PaginationResult {
    private final List results;

    public PaginationResult(List results) {
        this.results = results;
    }

    public List getResults() {
        return results;
    }
}
