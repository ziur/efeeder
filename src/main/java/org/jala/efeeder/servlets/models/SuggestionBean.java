package org.jala.efeeder.servlets.models;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author amir_aranibar
 */
public class SuggestionBean {

    private final List<Suggestion> suggestions;

    public SuggestionBean() {
        this.suggestions = new ArrayList<Suggestion>();
    }

    public List<Suggestion> getSuggestions() {
        return suggestions;
    }

    public void addSuggestion(Suggestion suggestion) {
        if (!existSuggestion(suggestion)) {
            suggestions.add(suggestion);
        }
    }

    private boolean existSuggestion(Suggestion suggestion) {
        String place = suggestion.getPlace();
        boolean exist = false;
        for (Suggestion sg : suggestions) {
            if (sg.getPlace().equalsIgnoreCase(place)) {
                exist = true;
            }
        }

        return exist;
    }
}
