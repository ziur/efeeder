<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>


  <jsp:body>
      <div class="row">
        <form role="form" action="/action/createFoodMeeting" method="post" class="col-md-9 go-right">
          <h2>Create food meeting</h2>
          <div class="form-group">
            <input id="name" name="name" type="text" class="form-control" required>
            <label for="name">Your Name</label>
          </div>
          <div class="form-group">
            <textarea id="message" name="phone" class="form-control" required></textarea>
            <label for="message">Message</label>
          </div>
          <button type="submit">Save</button>
        </form>
    </div>
  </jsp:body>
</t:template>