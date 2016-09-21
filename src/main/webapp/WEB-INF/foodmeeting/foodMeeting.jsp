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
    </script>
  </jsp:attribute>

  <jsp:body>
    <div class="section no-pad-bot" id="index-banner">
      <div class="container">
        <br><br>
        <div class="row">
          <div class="card">
            <div class="card-content">
              <span class="card-title activator grey-text text-darken-4">Meeting<i
                  class="material-icons right">settings</i></span>
              <div class="input-field">
                <input id="meeting" type="text">
                <button class="btn waves-effect waves-light" type="submit" name="action">Submit
                  <i class="material-icons right">send</i>
                </button>
              </div>
            </div>
            <div class="card-reveal">
              <span class="card-title grey-text text-darken-4">Card Title<i
                  class="material-icons right">close</i></span>
              <p>Here is some more information about this product that is only revealed once clicked on.</p>
            </div>
          </div>
        </div>
        <div class="row center">
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
        <br><br>

      </div>
    </div>
  </jsp:body>
</t:template>