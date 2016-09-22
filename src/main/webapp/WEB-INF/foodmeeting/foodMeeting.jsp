<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <jsp:attribute name="javascript">
      <script>
        $(document).ready(function () {
          $('#foodMeeting').DataTable();
        });

        $(".meeting-row").click(function () {
          window.location.href = '/action/suggestions?id_food_meeting=' +
              $(this).data("meetingId");
        });
        
        
        $('.datepicker').pickadate({
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 15 // Creates a dropdown of 15 years to control year
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
                <form class="col s12" action="/action/createFoodMeeting" method="post">
                    <div class="row">
                        <div class="input-field col s5">
                            <input placeholder="You look hungry!...Let's add a new meeting!" id="meeting_name" name="meeting_name" type="text" class="validate">
                            <label for="meeting_name">New Meeting Name</label>
                        </div>
                        <div class="input-field col s3">
                            <input id="date" type="date" name="date" class="datepicker">
                        </div>
                        <div class="input-field col s2">
                            <input id="timepicker" class="timepicker" type="time" name="time">
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
                    <div class="meeting grid-item" style="width:${foodMeeting.getWidth()}px" data-date=${foodMeeting.eventDate.toString()}>
                        <div class="card">
                            <div class="card-image waves-effect waves-block waves-light">
                                <img  src="${foodMeeting.imageLink}">
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
                                    <a href="action/SettingMeeting?id_food_meeting=${foodMeeting.id}" class="btn-floating btn-small waves-effect waves-light"><i class="material-icons">settings</i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </c:forEach>  
            </div>
        </div>
    </jsp:body>
</t:template>