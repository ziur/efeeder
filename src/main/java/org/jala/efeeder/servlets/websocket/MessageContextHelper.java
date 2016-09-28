package org.jala.efeeder.servlets.websocket;

import org.apache.avro.io.*;
import org.apache.avro.specific.SpecificDatumReader;
import org.apache.avro.specific.SpecificDatumWriter;
import org.codehaus.plexus.util.StringOutputStream;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;

import java.io.IOException;
import java.util.logging.Logger;

/**
 * Created by alejandro on 21-09-16.
 */
public class MessageContextHelper {
    private final static Logger log = Logger.getLogger(MessageContextHelper.class.toString());

    public static String serialize(MessageContext messageContext) {
        try {
            StringOutputStream out = new StringOutputStream();
            JsonEncoder encoder = EncoderFactory.get().jsonEncoder(MessageContext.getClassSchema(), out);
            DatumWriter<MessageContext> writer = new SpecificDatumWriter<>(MessageContext.getClassSchema());

            writer.write(messageContext, encoder);
            encoder.flush();
            out.close();
            return out.toString();
        } catch (IOException e) {
            log.severe("Error serializing Avro" + e.getMessage());
        }
        return null;
    }

    public static MessageContext deserialize(String message) {
        try {
            SpecificDatumReader<MessageContext> reader = new SpecificDatumReader<>(MessageContext.getClassSchema());
            Decoder decoder = DecoderFactory.get().jsonDecoder(MessageContext.getClassSchema(), message);
            return reader.read(null, decoder);
        } catch (IOException e) {
            log.severe("Error deserialing Avro: " + e.getMessage());
        }
        return null;
    }
}
