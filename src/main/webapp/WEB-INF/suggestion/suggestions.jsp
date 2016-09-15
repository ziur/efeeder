<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
  <jsp:attribute name="javascript">
    <script>
      $(document).ready(function () {
        $('#suggestions').DataTable();
      });
    </script>
  </jsp:attribute>

  <jsp:body>
    <div class="page-header">
      <h1>Suggestions</h1>
    </div>
    <div class="row">
      <div><a href="/action/createSuggestion?id_food_meeting=${param.id_food_meeting}" class="btn btn-primary" role="button">Add Suggestion</a></div>
      <span hidden="hidden" name="id_food_meeting">${param.id_food_meeting}</span>
      <table id="suggestions" class="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Place</th>
            <th>Description</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          <c:forEach var="suggestion" items="#{suggestions}">
            <tr class="suggestion-row" data-suggestion-id=${suggestion.id}>
              <td>${suggestion.id}</td>
              <td>${suggestion.place}</td>
              <td>${suggestion.description}</td>
              <td>${suggestion.createdAt}</td>
            </tr>
          </c:forEach>
        </tbody>
      </table>
    </div>
  </jsp:body>
</t:template>