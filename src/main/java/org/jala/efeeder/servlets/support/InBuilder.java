package org.jala.efeeder.servlets.support;

import java.util.Arrays;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.impl.DefaultIn;
import org.jala.efeeder.user.User;

/**
 * Created by alejandro on 08-09-16.
 */
public class InBuilder {
    public static In createIn(HttpServletRequest request) {
        DefaultIn in = new DefaultIn();
        for(Map.Entry<String, String[]> parameter: request.getParameterMap().entrySet()) {
            in.addParameter(parameter.getKey(), Arrays.asList(parameter.getValue()));
            in.setUser((User)request.getSession().getAttribute("User"));
        }

        return in;

    }
}
