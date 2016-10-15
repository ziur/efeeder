package org.jala.efeeder.servlets.websocket;

import org.jala.efeeder.api.command.CommandFactory;

import javax.servlet.http.HttpSession;
import javax.websocket.HandshakeResponse;
import javax.websocket.server.HandshakeRequest;
import javax.websocket.server.ServerEndpointConfig;

public class GetHttpSessionConfigurator extends ServerEndpointConfig.Configurator
{
    @Override
    public void modifyHandshake(ServerEndpointConfig config,
                                HandshakeRequest request,
                                HandshakeResponse response)
    {
        HttpSession httpSession = (HttpSession)request.getHttpSession();
        CommandFactory commandFactory =
                (CommandFactory) httpSession.getServletContext().getAttribute(CommandFactory.COMMAND_FACTORY_KEY);

        config.getUserProperties().put(CommandFactory.class.getName(),
                commandFactory);
		config.getUserProperties().put(HttpSession.class.getName(), httpSession);
    }
}