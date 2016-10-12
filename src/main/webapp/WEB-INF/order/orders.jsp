<%-- 
    Document   : orders
    Created on : Sep 26, 2016, 2:58:45 PM
    Author     : rodrigo_ruiz
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags"%>

<t:template>
	<jsp:attribute name="javascript">
        <script src="/assets/js/orders.js"></script>
    </jsp:attribute>

	<jsp:body>
        <div class="row">
        </div>

        <div class="row">
            <div class="col-sm-12">
                <ul class="collection">
                    <li class="collection-item avatar">
                        <div id="my-order-container">
                            <i class="material-icons circle">perm_identity</i>
                            <input type="hidden" id="id-food-meeting" value="${foodMeeting.id}" />
                            <c:if test="${foodMeeting.status == 'Order'}">
                            	<div class="input-field col s9 m10 l11" id="my-order-details-input" style="display: none;">
                                	<input type="text" id="my-order-text" placeholder="Details" value="${myOrder.details}" />
                            	</div>
                            	<input type="number" id="my-order-cost-input" value="${myOrder.cost}" placeholder="Cost" style="display: none;" />
                            </c:if>

                            <span id="my-order-details" class="title">${myOrder.details}</span>
                            <br />
                            <p id="my-order-cost">${myOrder.cost}</p>
                            <p>${myUser.name} ${myUser.last_name} - ${myUser.email}</p>
                            <c:if test="${foodMeeting.status == 'Order'}">
                            	<a href="#!" id="btn-edit-my-order" class="btn-edit secondary-content">
                            		<i class="material-icons">mode_edit</i>
                            	</a>
                            </c:if>
                            <c:if test="${foodMeeting.status == 'Payment'}">
                            	<input class="secondary-content" type="checkbox" id="chk-${user.id}" />
                            	<label class="secondary-content" for="chk-${user.id}"></label>
                            </c:if>
                        </div>
                    </li>

                    <c:forEach var="order" items="#{orders}">
                        <li class="collection-item avatar">
                            <i class="material-icons circle">perm_identity</i>
                            <span class="title">${order.details}</span>
                            <br/>
                            <p>${order.cost}</p>
                            <p>${order.user.name} ${order.user.last_name} - ${order.user.email}</p>
							<c:if test="${foodMeeting.status == 'Payment'}">
                            	<input class="secondary-content" type="checkbox" id="chk-${order.user.id}" />
                            	<label class="secondary-content" for="chk-${order.user.id}"></label>
                            </c:if>
                        </li>
                    </c:forEach>
                </ul>
            </div>
        </div>
    </jsp:body>
</t:template>
