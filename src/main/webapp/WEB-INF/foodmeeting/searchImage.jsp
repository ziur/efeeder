<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<div class="modal-content">
	<div class="row">
		<div class="col s3">
			<div class="card">
				<div class="card-image">
					<img id="image-card-id" 
						 src="http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg">
				</div>
			</div>
		</div>
		<div class="col s9">
			<p class="grey-text col s12">Please provide a url:<p>
			<div class="input-field col s12">
				<input name="image-link" id="image-link-id" 
					   value="http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg" 
					   type="text" class="validate" autofocus="autofocus"> <label for="image-link">Image Link</label>
			</div>
		</div>				
	</div>
	<hr/>
	<div class="row">
		<p class="col s12 grey-text">Too lazy to look for an image?  You can always pick one of our default ones:<p>
		<div class="image-links col s12">			
			<c:forEach var="image" items="#{images}">
				<div class="grid-item" style="width:200px">
					<div class="card">
						<div class="card-image waves-effect waves-block waves-light">
							<img class="image-link" data-image-link="${image}" src="${image}">
						</div>
					</div>
				</div>
			</c:forEach>
		</div>
	</div>	
</div>

<div class="modal-footer">
	<a class=" modal-action modal-close waves-effect waves-green btn-flat" id="accept_button">Agree</a>
	<a class=" modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
</div>