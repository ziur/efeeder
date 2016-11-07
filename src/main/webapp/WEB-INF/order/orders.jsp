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
		<script src="/assets/js/myOrder.js"></script>
		<script src="/assets/js/searchMenu.js"></script>
	</jsp:attribute>

	<jsp:body>
		<t:foodMeetingInfo foodMeeting="${foodMeeting}"/>

		<div class="row">
			<div id="search-menu-modal" class="modal modal-fixed-footer" >
				<%@include file='searchMenu.jsp'%>
			</div>
			<div class="col-sm-12">
				<ul id="order-list-myorder" class="collection">
					<input type="hidden" id="id-food-meeting" value="${foodMeeting.id}" />
					<input type="hidden" id="order_time" value="${orderTime}" />
					<c:if test="${foodMeeting.status == 'Order'}">
						<t:orderItem/>
					</c:if>
				</ul>
				<ul id="order-list" class="collection">
				</ul>
			</div>
			<c:if test="${foodMeeting.userOwner.id == myUser.id}">
				<div class="col-sm-12">
					<div class="fixed-action-btn horizontal">
						<a id="btn-payment" class="btn-floating btn-large waves-effect waves-light"><i class="material-icons">payment</i></a>
					</div>
				</div>
			</c:if>
		</div>
	</jsp:body>
</t:template>
