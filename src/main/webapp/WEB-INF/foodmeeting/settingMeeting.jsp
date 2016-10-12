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
			<div class="row">
				<form action="/action/EditFoodMeeting" method="post" role="form" id="edit-meeting" class="col s12">
					<input id="meeting-id" name="id-food-meeting" type="hidden" value="${foodMeeting.id}">
					<div class="row">
						<div class="col m12 l4">
							<div class="card">
								<div class="card-image">
									<img  width="350px" src="${foodMeeting.imageLink}" class="materialboxed" data-caption="${foodMeeting.name}" >
									<ul class="collection">
										<li class="collection-item avatar">
											<img src="${foodMeeting.userOwner.image}" alt="" class="circle">
											<span class="title">Owner:</span>
											<p> ${foodMeeting.userOwner}
											</p>
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div class="col m12 l8">
							<div class="input-field col s12">
								<label for="meeting_name">Meeting Name</label>
								<input id="meeting_name" name="meeting_name" type="text" class="validate" value="${foodMeeting.name}" >
							</div>
							<div class="input-field col s12">
								<input name="image_link" id="image_link" value="${foodMeeting.imageLink}" type="text" class="validate" >
								<label for="image_link">Image Link</label>
							</div>
							<div class="input-field col s12">
								<select name="status" id="status" >
									<option value="Voting" ${foodMeeting.status == 'Voting' ? 'selected' : ''} >Voting</option>
									<option value="Order" ${foodMeeting.status == 'Order' ? 'selected' : ''} >Order</option>
									<option value="Finish" ${foodMeeting.status == 'Finish' ? 'selected' : ''} >Finish</option>
								</select>
								<label>Status</label>
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
							</div><br>	 
						</div>
					</div>
					<div class="row right"><br><br>
						<button class="waves-effect waves-light btn">
							<a href="/action/FoodMeeting" class="white-text">Cancel</a>
						</button> 
						<button type="submit" id="edit-meeting" class="waves-effect waves-light btn" >Save</button> 
					</div>
				</form>
			</div>  
		</div>
	</jsp:body>
</t:template>

