package org.jala.efeeder.servlets;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import org.jala.efeeder.api.command.CommandExecutor;
import org.jala.efeeder.api.command.CommandFactory;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.ExitStatus;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MessageType;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.ResponseAction;
import org.jala.efeeder.api.command.SettingsManager;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.api.database.DatabaseManager;
import org.jala.efeeder.api.utils.ImageResourceManager;
import org.jala.efeeder.servlets.support.InBuilder;
import org.jala.efeeder.user.User;

/**
 * Created by alejandro on 07-09-16.
 */
public class CommandServlet extends HttpServlet {

	private static final long serialVersionUID = 5585317604797123555L;

	private static Pattern COMMAND_PATTERN = Pattern.compile(".*/action/(\\w*)");

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		processRequest(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		processRequest(request, response);
	}

	protected void processRequest(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		HttpSession session = request.getSession(true);

		if (request.getRequestURI().equals("/action/logout")) {
			session.invalidate();
			response.addCookie(new Cookie("userId", ""));
			request.getRequestDispatcher("/WEB-INF/home/login.jsp").forward(request, response);

		} else if (!request.getRequestURI().equals("/action/login") && !request.getRequestURI().equals("/action/user")
				&& !request.getRequestURI().equals("/action/image") && !request.getRequestURI().equals("/action/CreateUpdateUser")
				&& session.getAttribute("user") == null) {

			request.getRequestDispatcher("/WEB-INF/home/login.jsp").forward(request, response);

		} else {
			boolean isMultipart = ServletFileUpload.isMultipartContent(request);
			In parameters;
			if (isMultipart) {
				ImageResourceManager sourceImageM = new ImageResourceManager(getServletContext());
				parameters = sourceImageM.saveImage(request);
			} else {
				parameters = InBuilder.createIn(request);
			}
			DatabaseManager databaseManager = new DatabaseManager();

			CommandExecutor executor = new CommandExecutor(databaseManager);

			parameters.setUser(User.class.cast(session.getAttribute("user")));
			parameters.setContext(getServletContext());
			parameters.addParameter("image_path", Arrays.asList(getImagePath()));

			Out out = executor.executeCommand(parameters, getCommand(request));

			if (!request.getRequestURI().equals("/action/login") && !request.getRequestURI().equals("/action/user")
					&& !request.getRequestURI().equals("/action/CreateUpdateUser")) {
				out.addResult("showNavBar", true);
			}

			if (out.getUser() != null) {
				session.setAttribute("user", out.getUser());
				response.addCookie(new Cookie("userId", String.valueOf(out.getUser().getId())));
			}

			if (out.getExitStatus() == ExitStatus.ERROR) {
				for (String msg : out.getMessages(MessageType.ERROR)) {
					System.out.println("ERROR:" + msg);
				}
			}

			processResponse(out, request, response);
		}
	}

	private void processResponse(Out out, HttpServletRequest request, HttpServletResponse response)
			throws IOException, ServletException {
		ResponseAction action = out.getResponseAction();

		switch (action.getResponseType()) {
			case REDIRECT:
				response.sendRedirect(action.getUrl());
				break;
			case FORWARD:
				for (Map.Entry<String, Object> result : out.getResults()) {
					request.setAttribute(result.getKey(), result.getValue());
				}
				request.getRequestDispatcher(action.getFordwarUrl()).forward(request, response);
				break;
			case MESSAGE:
				String contentType = out.getHeaders().remove(DefaultOut.CONTENT_TYPE);
				for (Map.Entry<String, String> header : out.getHeaders().entrySet()) {
					response.addHeader(header.getKey(), header.getValue());
				}
				if (ExitStatus.FAIL == out.getExitStatus()) {
					response.setStatus(400);
				}
				response.setContentType(contentType);
				response.getWriter().write((String) out.getBody());
				break;
			case MESSAGE_BYTES:
				String contentType1 = out.getHeaders().remove(DefaultOut.CONTENT_TYPE);
				for (Map.Entry<String, String> header : out.getHeaders().entrySet()) {
					response.addHeader(header.getKey(), header.getValue());
				}
				byte[] bytes = (byte[]) out.getBody();
				response.setContentType(contentType1);
				response.setContentLength(bytes.length);
				response.getOutputStream().write(bytes);
		}
	}

	private CommandUnit getCommand(HttpServletRequest req) {
		CommandFactory commandFactory = (CommandFactory) getServletContext()
				.getAttribute(CommandFactory.COMMAND_FACTORY_KEY);
		Matcher matcher = COMMAND_PATTERN.matcher(req.getRequestURI());

		if (!matcher.matches()) {
			return null;
		}
		String command = matcher.group(1);
		return commandFactory.getInstance(command);
	}

	private String getImagePath() {
		SettingsManager settings = (SettingsManager) getServletContext()
				.getAttribute(SettingsManager.SETTINGS_FACTORY_KEY);

		String startPath = "" + settings.getData("image_folder_path");
		return Paths.get(startPath, ImageResourceManager.ASSETS_FILE, ImageResourceManager.IMG_FILE).toString();
	}
}
