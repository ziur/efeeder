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
        <div class="row" style="margin-top: 10%;">
            <div class="row">
                <div class="col offset-m3 s12 m6">
                    <div class="card">
                        <div class="card-content">
                            <form role="form" action="CreateUser" method="post">
                                <div class="row center-align">
                                    <i class="large teal-text material-icons prefix">account_circle</i>
                                </div>
                                <div class="row">
                                    <h6 class='center thin grey-text'>Please write in the following fields</h6>
                                </div>
                                <div class="row">
                                    <div class="input-field col s6">                                        
                                        <input class="form-control" id="name" type="text" name="name" required autocomplete="off"/>
                                        <label for="name">Name.</label>
                                    </div>
                                    <div class="input-field col s6">                                        
                                        <input class="form-control" id="last_name" type="text" name="last_name" required autocomplete="off"/>
                                        <label for="last_name">Last Name.</label>
                                    </div>
                                    <div class="input-field col s12">                                        
                                        <input class="form-control" id="email" type="text" name="email" required autocomplete="off"/>
                                        <label for="email">Email.</label>
                                    </div>
                                    <div class="input-field col s12">                                        
                                        <input class="form-control" id="username" type="text" name="username" required autocomplete="off"/>
                                        <label for="username">User name.</label>
                                    </div>
                                    <div class="input-field col s12">
                                        <input class="form-control" id="password" type="password" name="password" required/>
                                        <label for="pasword">Password.</label>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="right">
                                        <button id="LoginCancel" class="btn btn-primary" type="button">Cancel</button>      
                                        <button class="btn btn-primary" type="submit">Add User</button>                                    
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
          </div>
    </jsp:body>
</t:template>
