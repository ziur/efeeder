<%-- 
    Document   : users
    Created on : Sep 13, 2016, 10:39:57 AM
    Author     : rodrigo_ruiz
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
  <jsp:attribute name="javascript">
    <script>
      $(document).ready(function () {
        $('#foodMeeting').DataTable();
      });
    </script>
  </jsp:attribute>

  <jsp:body>
    <div class="page-header">
      <h1>Users</h1>
    </div>
    <div class="row">
      <div><a href="/action/user">Create</a> </div>
      <table id="foodMeeting" class="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Last Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          <c:forEach var="foodUser" items="#{users}">
            <tr>
              <td>${foodUser.id}</td>
              <td>${foodUser.name}</td>
              <td>${foodUser.last_name}</td>
              <td>${foodUser.email}</td>
            </tr>
          </c:forEach>
        </tbody>
      </table>
    </div>
  </jsp:body>
</t:template>