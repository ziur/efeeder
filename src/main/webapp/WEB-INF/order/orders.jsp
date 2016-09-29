<%-- 
    Document   : orders
    Created on : Sep 26, 2016, 2:58:45 PM
    Author     : rodrigo_ruiz
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <div class="row">
    </div>

    <div class="row">
        <div class="col-sm-12">
            <ul class="collection">
                <c:forEach var="user" items="#{users}">  
                    <li class="collection-item avatar">
                        <i class="material-icons circle">perm_identity</i>
                        <span class="title">${user.name} ${user.last_name}</span>
                        <p>${user.email}<br>
                            Details
                        </p>
                        <a href="#!" class="btn-edit"><i class="material-icons">mode_edit</i></a>
                        <input class="secondary-content" type="checkbox" id="chk-${user.id}" />
                        <label class="secondary-content" for="chk-${user.id}"></label>
                        
                    </li>                
                </c:forEach>
            </ul>
        </div>
    </div>
</t:template>
