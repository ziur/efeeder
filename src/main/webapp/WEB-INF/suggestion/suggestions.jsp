<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
  <jsp:attribute name="javascript">
    <script>
      $(document).ready(function () {
        $('#suggestions').DataTable();
      });
      $(".see-buyer").click(function() {
        window.location.href = '/action/suggestions?id_food_meeting=' + $(this).data("meetingId");
      });
    </script>
  </jsp:attribute>

  <jsp:body>
    <div class="row sugg-container">
      <form role="form"
            name="suggestion"
            method="post"
            action="/action/suggestions?id_food_meeting=${param.id_food_meeting}" 
            id="suggestion"
            class="col-md-12 go-right">   
        
        <div class="row page-header">
          <div class="col-sm-10 food-meeting-name">Food Meeting name:</div>     
          
          <div class="col-sm-2 add-suggestion">
            <a href="/action/createSuggestion?id_food_meeting=${param.id_food_meeting}" 
               class="btn btn-default" 
               role="button">Add Suggestion</a>
          </div>
        </div>

        <span hidden="hidden" name="id_food_meeting">${param.id_food_meeting}</span>

        <table class="table table-striped sugg-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Place</th>
              <th>Description</th>
              <th>Vote</th>
              <th>Counter</th>
            </tr>
          </thead>
          <tbody>
            <c:forEach var="suggestion" items="#{suggestions}">
              <tr class="sugg-row" data-suggestion-id=${suggestion.id}>
                <td>${suggestion.id}</td>
                <td>${suggestion.place}</td>
                <td>${suggestion.description}</td>
                <td class="sugg-vote">
                  <input type="radio" name="suggestion" value="${suggestion.id}">
                </td>
                <td>${suggestion.vote}</td>
              </tr>
            </c:forEach>
          </tbody>
        </table>

        <div class="row col-sm-2 user-container">
          <select name="user" class="form-control">
            <c:forEach var="user" items="#{users}">
              <option value="${user.id}" >${user.name} ${user.last_name}</option>
            </c:forEach>
          </select>
          
          <button name="save" type="submit" class="btn btn-primary vote-button">Save vote</button>
        </div>
      </form>
      <a href="/action/order?id_food_meeting=${param.id_food_meeting}" class="btn btn-primary order-food" role="button">Order food</a>  
    </div>
  </jsp:body>
</t:template>