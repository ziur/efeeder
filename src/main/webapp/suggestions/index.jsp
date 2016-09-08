<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<jsp:useBean id="sb" class="org.jala.efeeder.servlets.models.SuggestionBean" scope="application"/>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Suggestions</title>
    </head>
    <body>
        <div>
            <h1>Suggestions</h1>
        </div>

        <div>
            <p>
                <a href="new.jsp">Add Suggestion</a>
            </p>
        </div>

        <div>
            <table border="1">
                <thead>
                    <tr>
                        <th>Suggestion</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <c:forEach var="suggestion" items="${sb.suggestions}">
                        <tr>
                            <td>${suggestion.place}</td>
                            <td>${suggestion.description}</td>
                        </tr>
                    </c:forEach>
                </tbody>
            </table>
        </div>
    </body>
</html>
