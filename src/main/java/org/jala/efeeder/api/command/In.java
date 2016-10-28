package org.jala.efeeder.api.command;

import java.sql.Connection;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;

import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.user.User;

/**
 * Created by alejandro on 07-09-16.
 */
public interface In {
	void addParameter(String key, List<String> values);
	void addParameter(Map<String, List<String>> newParameters);
	String getPathEfeederImages();
	void setPathEfeederImages(String pathEfeederImages);
	Map<String, List<String>> getAllParameters();
	String getParameter(String key);
	List<String> getParameters(String key);

	void setConnection(Connection connection);
	Connection getConnection();
	User getUser();
	void setUser(User user);
	ServletContext getContext();
	void setContext(ServletContext context);
	MessageContext getMessageContext();
	void setMessageContext(MessageContext messageContext);
}
