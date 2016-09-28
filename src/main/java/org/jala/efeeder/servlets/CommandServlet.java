package org.jala.efeeder.servlets;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.jala.efeeder.api.command.CommandExecutor;
import org.jala.efeeder.api.command.CommandFactory;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.ExitStatus;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MessageType;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.ResponseAction;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.api.database.DatabaseManager;
import org.jala.efeeder.servlets.support.InBuilder;

import org.jala.efeeder.user.User;

/**
 * Created by alejandro on 07-09-16.
 */
public class CommandServlet extends HttpServlet {

    private static final long serialVersionUID = 5585317604797123555L;

    private static Pattern COMMAND_PATTERN = Pattern.compile(".*/action/(\\w*)");

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException,
                                                                                                      IOException {
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
            request.getRequestDispatcher("/WEB-INF/home/login.jsp").forward(request, response);

        } else if (!request.getRequestURI().equals("/action/login") && !request.getRequestURI().equals("/action/user")
                && !request.getRequestURI().equals("/action/CreateUser")
            && session.getAttribute("user") == null) {

            request.getRequestDispatcher("/WEB-INF/home/login.jsp").forward(request, response);

        } else {
            DatabaseManager databaseManager = new DatabaseManager();
            CommandExecutor executor = new CommandExecutor(databaseManager);
            In parameters = InBuilder.createIn(request);
            parameters.setUser(User.class.cast(session.getAttribute("user")));
            Out out = executor.executeCommand(parameters, getCommand(request)); 
            if (!request.getRequestURI().equals("/action/login") && !request.getRequestURI().equals("/action/user")
                    && !request.getRequestURI().equals("/action/CreateUser"))
            {
                out.addResult("showNavBar", true);
            }
                        
            if(out.getUser()!=null && session.getAttribute("user")==null)
            {                                
                session.setAttribute("user", out.getUser());
            }

            if (out.getExitStatus() == ExitStatus.ERROR) {
                for(String msg: out.getMessages(MessageType.ERROR)){
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
                for(Map.Entry<String, String> header : out.getHeaders().entrySet()) {
                    response.addHeader(header.getKey(), header.getValue());
                }
                response.setContentType(contentType);
                response.getWriter().write(out.getBody());
        }

    }
    

    private CommandUnit getCommand(HttpServletRequest req) {
        CommandFactory commandFactory =
                (CommandFactory) getServletContext().getAttribute(CommandFactory.COMMAND_FACTORY_KEY);
        Matcher matcher = COMMAND_PATTERN.matcher(req.getRequestURI());

        if (!matcher.matches()) {
            return null;
        }
        String command = matcher.group(1);
        return commandFactory.getInstance(command);
    }
}
