<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
  <jsp:attribute name="javascript">
    <script>
      $(document).ready(function () {
        $('#foodMeeting').DataTable();
      });
      
      $(".meeting-row").click(function() {
        window.location.href = '/action/order?id_food_meeting=' +  
                $(this).data("meetingId");
      });
    </script>
  </jsp:attribute>

  <jsp:body>
    <div class="page-header">
      <h1>Foot Meetings</h1>
    </div>
    <div class="row">
      <div><a href="/action/createFoodMeeting">Create</a> </div>
      <table id="foodMeeting" class="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          <c:forEach var="foodMeeting" items="#{foodMeetings}">
            <tr class="meeting-row" data-meeting-id=${foodMeeting.id}>
              <td>${foodMeeting.id}</td>
              <td>${foodMeeting.name}</td>
              <td>${foodMeeting.createdAt}</td>
            </tr>
          </c:forEach>
        </tbody>
      </table>
    </div>
  </jsp:body>
</t:template>