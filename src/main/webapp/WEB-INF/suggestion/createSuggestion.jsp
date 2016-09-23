<!-- TODO: delete this -->
<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>


  <jsp:body>
      <div class="row">
        <form role="form" action="/action/createSuggestion" method="post" class="col-md-9 go-right">
          <input name="id_food_meeting" type="hidden" value=${param.id_food_meeting}></input>
          <h2>Add Suggestion</h2>
          <div class="form-group">
            <input id="place" name="place" type="text" class="form-control" required>
            <label for="place">Place</label>
          </div>
          <div class="form-group">
            <textarea id="description" name="description" class="form-control" required></textarea>
            <label for="description">Description</label>
          </div>
          <button type="submit">Post</button>
        </form>
    </div>
  </jsp:body>
</t:template>