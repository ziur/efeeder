<%-- 
	Document   : user
	Created on : Sep 13, 2016, 10:39:45 AM
	Author	 : rodrigo_ruiz
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<%@ page import="org.jala.efeeder.api.command.DisplayBean" %>
<%@ page import="org.jala.efeeder.user.UserDisplayBean" %>
<%@ page import="org.jala.efeeder.user.User" %>


<t:template>
	<jsp:attribute name="javascript">
		<script src="/assets/js/user.js"></script>
	</jsp:attribute>
	
	<jsp:body>
		<!-- Creation of a variable "user" (retrieve from DisplayBean) in order to not impact components already using this variable -->
		<c:set var="user" value="${DisplayBean.user}" />
		
		<div class="row">
			<div class="row">
				<div class="col offset-m3 s12 m6">
					<div class="card">
						<div class="card-content">
							<form id="create-user-form" role="form" action="CreateUpdateUser" method="post" enctype="multipart/form-data">
								<div class="row center-align">
									<div id="image-preview" class="circle responsive-img">
										<label for="image-upload" id="image-label" class="center">
											<image class="circle responsive-img" src="image?file_name=${user.getImage()}&type=user"/>
										</label>
										<input type="file" name="image" id="image-upload" style="display:none;"/>
									</div>
								</div>
								<div class="row center-align">
									<h6 id="message-user" class='center lighten-1 grey-text'>Please write in the following fields</h6>
								</div>
								<div class="row">
									<div class="input-field col s6">
										<input class="validate" id="name" type="text" name="name"  autocomplete="off" value="${user.name}"/>
										<label for="name"  >Name.</label>
									</div>
									<div class="input-field col s6">
										<input class="validate" id="last_name" type="text" name="last_name"  autocomplete="off" value="${user.lastName}"/>
										<label for="last_name">Last Name.</label>
									</div>
									<div class="input-field col s12">
										<input class="validate" id="email" type="email" name="email"  autocomplete="off" value="${user.email}"/>
										<label for="email">Email.</label>
									</div>
									<div class="input-field col s12">
										<input class="validate" id="username" type="text" name="username"  autocomplete="off" value="${user.userName}"/>
										<label for="username">User name.</label>
									</div>
									<div class="input-field col s12">
										<input class="validate" id="password" type="password" name="password"/>
										<label for="pasword">Password.</label>
									</div>
									<div class="input-field col s12">
										<input class="validate" id="confirm_password" type="password" name="confirm_password" />
										<label for="confirm_password" >Confirm Password.</label>
									</div>
								</div>
								<div class="row">
									<div class="right">
										<input type="hidden" id="new-user-hiden" name="inputName" value="${DisplayBean.newUser}">
										<button id="cancel-button" class="btn btn-primary" type="button">Cancel</button>
										<c:choose>
											<c:when test="${DisplayBean.newUser}">
												<button id="create-button" class="btn btn-primary" type="submit">Add User</button>
											</c:when>	
											<c:otherwise>
												<button id="update-button" class="btn btn-primary" type="submit">Update User</button>
											</c:otherwise>
										</c:choose>
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
