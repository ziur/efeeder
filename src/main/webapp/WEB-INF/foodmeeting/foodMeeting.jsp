<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <jsp:body>
        <div class="meetings-container">
            <div class="row">
                <form id="addMeeting" class="col s12" action="/action/createFoodMeeting">
                    <div class="row ">
                        <h5 class='center-align thin grey-text lighten-5'>You look hungry!.... Let's create a meeting!</h5>
                    </div>
                    <div class="row">
                        <div class="input-field col s6">
                            <input id="meeting_name" name="meeting_name" type="text" class="validate" autocomplete="off">
                            <label for="meeting_name">Meeting Name</label>
                        </div>
                        <div class="input-field col s3">
                            <input id="date" type="date" name="date" class="datepicker">
                            <label for="date">Date</label>
                        </div>
                        <div class="input-field col s2">
                            <input id="timepicker" class="timepicker" type="time" name="time">
                            <label for="timepicker">Time</label>
                        </div>
                        <div class="col s1">
                            <button class="btn-floating btn-large waves-effect waves-light" type="submit">
                                <i class="material-icons" >add</i>
                            </button>
                        </div>
                    </div>
                </form>
            </div>  
            <div class="food-meetings">
                <c:forEach var="foodMeeting" items="#{foodMeetings}">
                    <div class="meeting grid-item" style="width:${foodMeeting.getWidth()}px" data-date="${foodMeeting.eventDate}">
                        <div class="card">
                            <div class="card-image waves-effect waves-block waves-light">
                                <img  class="meeting-img" data-meeting-id=${foodMeeting.id} src="${foodMeeting.imageLink}">
                            </div>
                            <div class="card-content">
                                <span class="card-title activator grey-text text-darken-4">
                                    ${foodMeeting.name}                                    
                                    <i class="material-icons right">more_vert</i>
                                </span>
                                <p class="quick-view-date grey-text lighten-1"></p>                                
                            </div>

                            <div class="card-reveal">
                                <span class="card-title grey-text text-darken-4">${foodMeeting.name}<i class="material-icons right">close</i></span>
                                <p class="detailed-view-date grey-text lighten-1"></p>
                                
                                <div class="fixed-action-btn" style="bottom: 25px; right: 25px;">
                                    <a class="btn-floating btn-small waves-effect waves-light tooltipped" data-position="top" data-delay="50" data-tooltip="Settings">
                                        <i class="material-icons">settings</i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </c:forEach>  
            </div>
        </div>
    </jsp:body>
</t:template>