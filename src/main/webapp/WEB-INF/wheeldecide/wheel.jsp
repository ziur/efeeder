<%-- 
    Document   : wheeld
    Created on : Sep 9, 2016, 5:32:35 PM
    Author     : alexander_castro
--%>

<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>


<t:template>
    <jsp:body>
        From Param url: ${chosen}
        <ul>
            <c:forEach var="item" items="#{users1}">
                <li>Item: ${item.name}</li>
            </c:forEach>
        </ul>
    </jsp:body>
</t:template>
