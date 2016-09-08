<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>


<t:template>
    <jsp:body>
        <ul>
            <c:forEach var="item" items="#{votes}">
                <li>Item: ${item.name}</li>
            </c:forEach>
        </ul>
    </jsp:body>
</t:template>