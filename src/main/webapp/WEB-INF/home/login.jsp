<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
	<jsp:attribute name="javascript">
		<script src="/assets/js/login.js"></script>
	</jsp:attribute>
	<jsp:body>
		<input type="hidden" id="hidden-field" name="inputName" value="hdnSalt">
		<div class="row" style="margin-top: 10%;">
			<div class="row">
				<div class="col offset-m3 s12 m6">
					<div class="card">
						<div class="card-content">
							<form id="login-form" role="form" action="login" >
								<div class="row center-align">
									<i class="large teal-text material-icons prefix">account_circle</i>
								</div>
								<div class="row">
									<h6 class='center lighten-1 grey-text'>Welcome to Efeeder!... wanna eat something?</h6>
								</div> 
								<div class="row">
									<div class="form-group col-xs-12 center-align">
										<div class="input-field col s8 offset-s2">
											<input class="form-control" id="username" type="text"
													name="username" required autocomplete="off" />
											<label for="username">User name.</label>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="form-group col-xs-12">
										<div class="input-field col s8 offset-s2">
											<input class="form-control" id="password" type="password"
													name="password" required />
											<label for="pasword">Password.</label>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="form-group col-xs-4 right">
										<button class="btn btn-primary" type="submit">Login</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				<div class="row">
					<h6 class='right lighten-5 grey-text'>Don't you have an account yet??
						<a href="user">Let's create one!</a>
					</h6> 
				</div>
			</div>
		</div>
	</div>
	</jsp:body>
</t:template>