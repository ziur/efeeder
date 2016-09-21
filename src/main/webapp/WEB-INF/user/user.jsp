<%-- 
    Document   : user
    Created on : Sep 13, 2016, 10:39:45 AM
    Author     : rodrigo_ruiz
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>


  <jsp:body>
      <div class="row">
        <form role="form" action="/action/user" method="post" class="col-md-9 go-right">
          <h2>Create User</h2>
          <div class="form-group">
            <input id="name" name="email" type="text" class="form-control" required>
            <label for="email">Email</label>
          </div>
          <div class="form-group">
            <input id="name" name="name" type="text" class="form-control" required>
            <label for="name">Name</label>
          </div>
          <div class="form-group">
            <input id="name" name="last_name" type="text" class="form-control" required>
            <label for="last_name">Last Name</label>
          </div> 
          <div class="form-group">
            <input id="name" name="nick_name" type="text" class="form-control" required>
            <label for="nick_name">Nick Name</label>
          </div> 
          <div class="form-group">
            <input id="pass" name="password" type="password" class="form-control" required>
            <label for="password">Password</label>
          </div> 
          <div class="form-group">
            <input id="namecpass" name="confirm_password" type="password" class="form-control" required>
            <label id="cpass">Confirm Password</label>
            <div id="iddd" class="alert alert-danger" hidden="hidden">
                <strong>Danger!</strong> Your password not is the same.
            </div>
          </div> 
          
          <button id="buttonSub" type="submit">Save</button>
        </form>
    </div>
  </jsp:body>
</t:template>
<script>
    $("#namecpass").keyup(function() {
        var match = $('#pass').val() == $('#namecpass').val();
        if(match){
            $("#iddd").hide();
        }else{
            $("#iddd").slideDown("slow");
        }
    });
</script>    
