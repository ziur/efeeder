<%-- 
    Document   : settingMeeting
    Created on : Sep 21, 2016, 11:23:14 AM
    Author     : Danitza Machicado
--%>
<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <jsp:attribute name="javascript">
        <script>
			$(function() {
				$('.datepicker').pickadate({
					selectMonths: true,
					selectYears: 15,
					closeOnSelect: true,
					onSet: function(arg) {
						if ('select' in arg) {
							this.close();
						}
					}
				});
				$('#timepicker').pickatime({
					autoclose: true,
					twelvehour: false,
					vibrate: true
				});
				//Format date
				var time = moment($("#date").val()).format("HH:mm");
				$("#timepicker").val(time);
				var value = moment($("#date").val()).format("D MMMM, YYYY");
				$("#date").val(value);

				// Initialization Select component
				$('select').material_select();
			});
			

        </script>
		<script src="/assets/js/settingMeeting.js"></script>
    </jsp:attribute>
    <jsp:body>		
        <div class="meetings-container">
			<br/><br/><br/>
			<div class="row">
				
				<div class="col s12">
					<div id="noUiSlider"></div>
				</div>
			</div>
			<br/><br/><br/>
            <div class="row">
                <form action="/action/EditFoodMeeting" method="post" role="form" id="edit-meeting" class="col s12" 
					  data-event-date="${foodMeeting.eventDate}" data-created-date="${foodMeeting.createdAt}">
                    <input id="meeting-id" name="id-food-meeting" type="hidden" value=${foodMeeting.id}>
                    <div class="row">
                        <div class="col m12 l4">
                            <div class="card">
                                <div class="card-image">
                                    <img  width="350px" src="${foodMeeting.imageLink}" class="materialboxed" data-caption="${foodMeeting.name}" >
                                </div>                                
                            </div>                            
                        </div>
                        <div class="col m12 l8">
                            <div class="input-field col s12">
                                <label for="meeting_name">Meeting Name</label>
                                <input id="meeting_name" name="meeting_name" type="text" class="validate" value="${foodMeeting.name}">
                            </div>
                            <div class="input-field col s12">
                                <input name="image_link" id="image_link" value="${foodMeeting.imageLink}" type="text" class="validate">
                                <label for="image_link">Image Link</label>
                            </div>
                            <div class="input-field col s12">
                                <select name="status" id="status">
                                    <option value="Voting" ${foodMeeting.status == 'Voting' ? 'selected' : ''} >Voting</option>
                                    <option value="Order" ${foodMeeting.status == 'Order' ? 'selected' : ''} >Order</option>
                                    <option value="Finish" ${foodMeeting.status == 'Finish' ? 'selected' : ''} >Finish</option>
                                </select>
                                <label>Status</label>
                            </div>
                            <div class="input-field col s7">
                                <input id="date" type="date" name="date" class="datepicker" value="${foodMeeting.eventDate}">
                                <label for="date">Date</label>
                            </div>
                            <div class="input-field col s5">
                                <input name="time" id="timepicker" class="timepicker" type="time">
                                <label for="timepicker">Schedule</label>
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
                        <button type="submit" id="edit-meeting" class="waves-effect waves-light btn">Save</button> 
                    </div>
                </form>
            </div>  
        </div>		
		
		
		

    </jsp:body>
</t:template>

