<%-- 
	Document   : settingMeeting
	Created on : Sep 21, 2016, 11:23:14 AM
	Author	 : Danitza Machicado
--%>
<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
	<jsp:attribute name="javascript">
		<script src="/assets/js/settingMeeting.js"></script>
	</jsp:attribute>
	<jsp:body>
		<div class="meetings-container">
			<br/><br/><br/>
			<div class="row">				
				<div class="offset-s1 col s10">
					<div id="noUiSlider"></div>
				</div>
			</div>
			<br/><br/><br/>
			<div class="row">
				<form action="/action/EditFoodMeeting" method="post" role="form" id="edit-meeting" class="col s12"
					  data-event-date="${foodMeeting.eventDate}" data-created-date="${foodMeeting.createdAt}"
					  data-voting-date="${foodMeeting.votingDate}" data-order-date="${foodMeeting.orderDate}" data-payment-date="${foodMeeting.paymentDate}">
					<input id="meeting-id" name="id-food-meeting" type="hidden" value="${foodMeeting.id}">
					<input id="voting-date" name="voting-date" type="hidden" type="date">
					<input id="order-date" name="order-date" type="hidden" type="date">
					<input id="payment-date" name="payment-date" type="hidden" type="date">
					<div class="row">
						<div class="col m12 l4">
							<ul class="collection margin-bottom-0">
								<li class="collection-item avatar" style="min-height: 0px">
									<img src="action/image?file_name=${foodMeeting.userOwner.getImage()}&type=user" alt="" class="circle">
									<span class="title">Owner:</span>
									<p> ${foodMeeting.userOwner}</p>
								</li>
								<li class="collection-item">
									<div>
										Status<a href="#!" class="secondary-content"><span id="status" class="new badge" data-badge-caption="">${foodMeeting.status}</span></a>
									</div>
								</li>
							</ul>	
							<div class="card">								
								<div class="card-image">
									<img  width="350px" src="${foodMeeting.imageLink}" class="materialboxed" data-caption="${foodMeeting.name}" >									
								</div>
							</div>
							
						</div>
						<div class="col m12 l8">
							<div class="input-field col s12">
								<input id="meeting_name" name="meeting_name" type="text" class="validate" value="${foodMeeting.name}" >
								<label for="meeting_name">Meeting Name</label>
							</div>
							<div class="input-field col s12">
								<input name="image_link" id="image_link" value="${foodMeeting.imageLink}" type="text" class="validate" >
								<label for="image_link">Image Link</label>
							</div>
							<div class="input-field col s7">
								<input id="date-field-id" type="date" name="date" class="datepicker" value="${foodMeeting.eventDate}" >
								<label for="date">Date</label>
							</div>
							<div class="input-field col s5">
								<input id="time-field-id" name="time" class="timepicker" type="time" >
								<label for="timer-id">Schedule</label>
							</div>
							<div class="col s6 push-s3">
								<input name="type" class="with-gap" type="radio" id="public" checked />
								<label for="public">Public</label>
							</div>
							<div class="col s6">
								<input name="type" class="with-gap" type="radio" id="private" />
								<label for="private">Private</label>
							</div>
							<div class="right"><br><br>
								<button class="waves-effect waves-light btn">
									<a href="/action/FoodMeeting" class="white-text">Cancel</a>
								</button> 
								<button type="submit" id="edit-meeting" class="waves-effect waves-light btn" >Save</button> 
							</div>
						</div>
					</div>					
				</form>
			</div>  
		</div>
	</jsp:body>
</t:template>

