package org.jala.efeeder.api.command.impl;

import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletContext;

import lombok.Getter;
import lombok.Setter;

import org.jala.efeeder.api.command.In;
import org.jala.efeeder.servlets.websocket.avro.MessageContext;
import org.jala.efeeder.user.User;

/**
 * Created by alejandro on 07-09-16.
 */
public class DefaultIn implements In {
	private Connection connection;
	private final Map<String, List<String>> parameters;
	@Setter
	@Getter
	private User user;
	@Setter
	@Getter
	private MessageContext messageContext;
	@Setter
	@Getter
	private ServletContext context;
        

	public DefaultIn() {
		parameters = new HashMap<>();
	}

	@Override
	public void addParameter(String key, List<String> values) {
		parameters.put(key, values);
	}

	@Override
	public void addParameter(Map<String, List<String>> newParameters) {
		parameters.putAll(newParameters);
	}

	@Override
	public Map<String, List<String>> getAllParameters() {
		return parameters;
	}

	@Override
	public String getParameter(String key) {
		if(!parameters.containsKey(key)) {
			return null;
		}
		String value = parameters.get(key).get(0);
		value = new String(value.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
		return value;
	}

	@Override
	public List<String> getParameters(String key) {
		return parameters.get(key);
	}

	@Override
	public void setConnection(Connection connection) {
		this.connection = connection;
	}

	@Override
	public Connection getConnection() {
		return connection;
	}
}
