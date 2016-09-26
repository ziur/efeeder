package org.jala.efeeder.api.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Created by alejandro on 16-09-16.
 */
public class JsonConverter {
    public static String objectToJSON(Object object) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {

            return null;
        }
    }
}
