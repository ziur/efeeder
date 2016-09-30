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
                <li class="collection-item avatar">
                    <i class="material-icons circle">perm_identity</i>
                    <span class="title">${myOrder.idFoodMeeting} ${myOrder.idUser}</span>
                    <p>${myOrder.cost}<br>
                        Details
                    </p>
                    <a href="#!" class="btn-edit"><i class="material-icons">mode_edit</i></a>
                    <input class="secondary-content" type="checkbox" id="chk-${user.id}" />
                    <label class="secondary-content" for="chk-${user.id}"></label>
                </li>
                <c:forEach var="order" items="#{orders}">
                    <li class="collection-item avatar">
                        <i class="material-icons circle">perm_identity</i>
                        <span class="title">${order.idFoodMeeting} ${order.idUser}</span>
                        <p>${order.cost}<br>
                            Details
                        </p>

                        <input class="secondary-content" type="checkbox" id="chk-${user.id}" />
                        <label class="secondary-content" for="chk-${user.id}"></label>                        
                    </li>
                </c:forEach>
            </ul>
        </div>
    </div>
</t:template>
