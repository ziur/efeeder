<%-- 
	Document   : settingMeeting
	Created on : Sep 21, 2016, 11:23:14 AM
	Author	 : Danitza Machicado
--%>
<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>
<%@ page import="org.jala.efeeder.foodmeeting.FoodMeetingDisplayBean" %>

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
				<div>
					<h6>Test</h6>					
<%-- 					<% if(request.getAttribute("ErrorMessage").toString().isEmpty()) { %> --%>
<%-- 			            <div style="color: red">${ErrorMessage}</div> --%>
<%-- 			        <% } %> --%>
					
				</div>
				<form action="/action/EditFoodMeeting" role="form" id="edit-meeting" class="col s12"
					  data-event-date="${DisplayBean.eventDate}" data-created-date="${DisplayBean.createdAt}"
					  data-voting-date="${DisplayBean.votingDate}" data-order-date="${DisplayBean.orderDate}" data-payment-date="${DisplayBean.paymentDate}">
<!-- 				TODO	 this is a test  -->
					<div id=created></div>
					
					<input id="meeting-id" name="id-food-meeting" type="hidden" value="${DisplayBean.id}">
					<input id="voting-date" name="voting-date" type="hidden" type="date">
					<input id="order-date" name="order-date" type="hidden" type="date">
					<input id="payment-date" name="payment-date" type="hidden" type="date">
					<div class="row">
						<div class="col s12 l4 center">
							<ul class="collection margin-bottom-0">
								<li class="collection-item avatar" style="min-height: 0px">
									<img src="action/image?file_name=${DisplayBean.userOwner.getImage()}&type=user" alt="" class="circle">
									<p class="title">Owner:</p>
									<p> ${DisplayBean.userOwner}</p>
								</li>
							</ul>	
							<div class="card">								
								<div class="card-image">
									<img  width="350px" src="${DisplayBean.imageLink}" class="materialboxed" data-caption="${DisplayBean.name}" >									
								</div>
							</div>
							
						</div>
						<div class="col m12 l8">
							<div class="input-field col s12">
								<input id="meeting_name" name="meeting_name" type="text" class="validate" value="${DisplayBean.name}" >
								<label for="meeting_name">Meeting Name</label>
							</div>
							<div class="input-field col s12">
								<input name="image_link" id="image_link" value="${DisplayBean.imageLink}" type="text" class="validate" >
								<label for="image_link">Image Link</label>
							</div>							
							<div class="input-field col s7">
								<input id="date-field-id" type="date" name="date" class="datepicker" value="${DisplayBean.date}" >
								<label for="date">Date</label>
							</div>
							<div class="input-field col s5">
								<input id="time-field-id" name="time" class="timepicker" type="time" value="${DisplayBean.time}" >
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

