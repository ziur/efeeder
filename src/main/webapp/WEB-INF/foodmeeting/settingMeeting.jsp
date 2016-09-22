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
            $('.datepicker').pickadate({
                selectMonths: true,
                selectYears: 15
            });
            $('#timepicker').pickatime({
                autoclose: false,
                twelvehour: false
            });
        </script>
    </jsp:attribute>
    <jsp:body>
        <div class="meetings-container">
            <div class="row">
                <form action="/action/EditFoodMeeting" method="post" role="form" id="edit-meeting" class="col s12">
                    <input id="meetingId" name="id_food_meeting" type="hidden" value=${foodMeeting.id}>
                    <div style="display: table; width:100%;">
                        <div style="display: table-cell; border: 1px solid gray; vertical-align: middle; height: 250px">
                            <img width="300px" src="${foodMeeting.imageLink}" style="vertical-align:middle; display: block; margin: auto;">
                        </div>
                        <div style="display: table-cell; width: 70%; padding-left: 25px">
                            <div style="margin-bottom: 2px;">
                                <label for="meeting_name">Meeting Name</label>
                                <input id="meeting_name" name="meeting_name" type="text" class="validate" value="${foodMeeting.name}">
                            </div>
                            <div class="row">
                                <div class="input-field col s12">
                                    <input name="image_link" id="image_link" value="${foodMeeting.imageLink}" type="text" class="validate">
                                    <label for="image_link">Image Link</label>
                                </div>
                            </div>
                            <div class="row">
                                <div class="input-field col s5">
                                    <input id="date" type="date" name="date" class="datepicker" value="${foodMeeting.eventDate}">
                                    <label for="date">Date</label>
                                </div>
                                <div class="input-field col s3">
                                    <input id="timepicker" class="timepicker" type="time" name="time">
                                    <label for="schedule">Schedule</label>
                                </div>
                            </div
                            <div class="row">
                                <div class="col s6 push-s3">
                                    <input name="type" class="with-gap" type="radio" id="public" checked />
                                    <label for="public">Public</label>
                                </div>
                                <div>
                                    <input name="type" class="with-gap" type="radio" id="private" />
                                    <label for="private">Private</label>
                                </div><br>
                            </div>
                        </div>
                        <div class="row" align="center"><br><br>
                            <button type="submit" id="edit-meeting" class="waves-effect waves-light btn">Save</button> 
                        </div>
                </form>
            </div>  
        </div
    </jsp:body>
</t:template>

