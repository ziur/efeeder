<%@tag description="Food Meeting Information" pageEncoding="UTF-8" %>
<%@taglib prefix="t" tagdir="/WEB-INF/tags" %>
<%@taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<jsp:directive.attribute name="foodMeeting" type="org.jala.efeeder.foodmeeting.FoodMeeting" required="true" rtexprvalue="true"/>
<jsp:directive.attribute name="place" type="java.lang.String" required="true" />

<%@tag import="org.jala.efeeder.util.DateFormatter" %>

<div class="row">
	<div id="food-meeting-info" class="col-sm-12">
		<div class="card">
			<input id="input-collapse-card" type="checkbox" ></input>
			<label id="label-collpase-card" for="input-collapse-card"><i class="material-icons">menu</i></label>
			<div class="content-card-collapsable">
				<div class="card-image">
					<img id="food-meeting-image" src="${foodMeeting.imageLink}" class="activator perfect-fit">
					<span id="food-meeting-title" class="card-title">${foodMeeting.name} at ${place}</span>
				</div>
				<div class="card-content">
					<div id="food-meeting-card-content" class="row">
						<div class="col s12">
							<ul id="food-meeting-info-tabs" class="tabs">
								<li class="tab col s4"><a class="active" href="#test1">Information</a></li>
								<li class="tab col s4"><a href="#test2">State dates</a></li>
								<li class="tab col s4"><a href="#test3">Participants</a></li>
							</ul>
						</div>
						<div id="test1" class="col s12">
							<h5>Place: ${place}</h5>
							<p id="food-meeting-date" class="quick-view-date lighten-1 truncate">${foodMeeting.eventDate}</p>
						</div>
						<div id="test2" class="col s12">
							<table class="striped">
								<thead>
									<tr>
										<th data-field="id">State</th>
										<th data-field="name">End date</th>
									</tr>
								</thead>

								<tbody>
									<tr>
										<td>Voting</td>
										<td><fmt:formatDate value="${foodMeeting.votingDate}" pattern="dd/MM/yyyy HH:mm:ss" /></td>
									</tr>
									<tr>
										<td>Order</td>
										<td><fmt:formatDate value="${foodMeeting.orderDate}" pattern="dd/MM/yyyy HH:mm:ss" /></td>
									</tr>
									<tr>
										<td>Payment</td>
										<td><fmt:formatDate value="${foodMeeting.paymentDate}" pattern="dd/MM/yyyy HH:mm:ss" /></td>
									</tr>
									<tr>
										<td>Event</td>
										<td><fmt:formatDate value="${foodMeeting.eventDate}" pattern="dd/MM/yyyy HH:mm:ss" /></td>
									</tr>
								</tbody>
							</table>
						</div>
						<div id="test3" class="col s12">
							<p>[Under construction]</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>