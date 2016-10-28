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
			<div id="food-meeting-info" class="col-sm-12">
				<div class="card">
					<div class="card-image">
						<img id="food-meeting-image" src="${foodMeeting.imageLink}" class="activator perfect-fit">
						<span id="food-meeting-title" class="card-title">${foodMeeting.name}</span>
					</div>
					<div class="card-content">
						<p>Place: [NOT DEFINED]</p>
						<h6 id="food-meeting-date" class="quick-view-date grey-text lighten-1 truncate">${foodMeeting.eventDate}</h6>
					</div>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-sm-12">
				<ul id="order-list" class="collection">
					<li class="collection-item avatar">
						<div id="my-order-container">
							<i class="material-icons circle">perm_identity</i>
							<input type="hidden" id="id-food-meeting" value="${foodMeeting.id}" />
							<input type="hidden" id="order_time" value="${orderTime}" />
							<c:if test="${foodMeeting.status == 'Order'}">
								<div class="input-field col s9 m10 l11" id="my-order-details-input" style="display: none;">
									<input type="text" id="my-order-text" placeholder="Details" value="${myOrder.details}" />
								</div>
								<input type="number" id="my-order-cost-input" value="${myOrder.cost}" placeholder="Cost" style="display: none;" />
							</c:if>

							<span id="my-order-details" class="title">${myOrder.details}</span>
							<br />
							<p id="my-order-cost">${myOrder.cost}</p>
							<p id="my-user-order">${myUser.name} ${myUser.lastName}</p>
							<c:if test="${foodMeeting.status == 'Order'}">
								<a href="#" id="btn-edit-my-order" class="btn-edit secondary-content">
									<i class="material-icons">mode_edit</i>
								</a>
							</c:if>
						</div>
					</li>
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
