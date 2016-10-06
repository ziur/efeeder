<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
	<jsp:attribute name="javascript">
		<script src="/assets/js/foodMeetings.js"></script>
		<script src="/assets/js/searchImage.js"></script>
	</jsp:attribute>

	<jsp:body>
		<div class="meetings-container">
			<div class="row">
				<button  id="AddNewMeeting" class="btn-floating btn-small waves-effect waves-light"><i class="material-icons" >add</i></button>
			</div>

			<div id="search-image-modal-id" class="modal modal-fixed-footer" >
			</div>
			
			<div class="food-meetings">
				<div id="new-meeting-card-id" class="grid-item" style="width:500px;display: none;">
					<div class="card">
						<div class="card-image waves-effect waves-block waves-light">
							<img id="new-image-card-id" class="new-meeting-img" data-target="modal1"
							 	src="http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg">
						</div>
						<div class="card-content">
							<form id="add-meeting-form-id" role="form" action="/action/createFoodMeeting">
								<span class="card-title activator grey-text text-darken-4">
									<i class="material-icons right">more_vert</i>
								</span>
								<div class="row">
									<div class="input-field col s12">
										<input class="validate" id="meeting_name" type="text" name="meeting_name" autocomplete="off" />
										<label for="meeting_name">Meeting Name</label>
									</div>
									<div class="input-field col s8">
										<input id="date" type="text" name="date" class="datepicker validate">
										<label for="date">Date</label>
									</div>
									<div class="input-field col s4">
										<input id="time" type="text" name="time" class="validate">
										<label for="time">Time</label>
									</div>
									<div class="row right col"><br><br>
										<button id="cancelCreateMeeting" class="waves-effect waves-light btn" type="button">Cancel</button>
										<button type="submit" id="createMeeting" class="waves-effect waves-light btn">Create</button>
									</div>
								</div>
							</form>
						</div>
						<div class="card-reveal">
							<form id="add-meeting-form-2-id" role="form">
								<span class="card-title activator grey-text text-darken-4">
									<i class="material-icons right">close</i>
								</span>
							</form>
						</div>
					</div>
				</div>				
			</div>	
			<div id="preloader" class="col s12 center-align">
				<div class="valign preloader-wrapper big active">
					<div class="valign spinner-layer spinner-blue-only">
					  <div class="circle-clipper left">
						<div class="circle"></div>
					  </div><div class="gap-patch">
						<div class="circle"></div>
					  </div><div class="circle-clipper right">
						<div class="circle"></div>
					  </div>
					</div>
				</div>
				<h5 class="lighten-1 grey-text">We are loading your meetings right now!</h5>				
			</div>
		</div>			
	</jsp:body>
</t:template>