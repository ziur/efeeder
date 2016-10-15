package org.jala.efeeder.api.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonGenerator;
/**
 * Created by alejandro on 16-09-16.
 */
public class JsonConverter {
    public static String objectToJSON(Object object) {
        ObjectMapper mapper = new ObjectMapper();
        try {
			// Otherwise unicode characters will be replaced by '?'
			mapper.getFactory().configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
            return mapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {

            return null;
        }
    }
}
