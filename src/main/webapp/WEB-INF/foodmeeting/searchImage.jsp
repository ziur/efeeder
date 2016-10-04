<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<div class="modal-content" style="height:65%">
	<div class="image-links">
		<c:forEach var="image" items="#{images}">
			<div class="meeting grid-item"
				style="width:200px">
				<div class="card">
					<div class="card-image waves-effect waves-block waves-light">
						<img class="image-link" data-image-link="${image}"
							src="${image}">
					</div>
				</div>
			</div>
		</c:forEach>
	</div>
</div>
<div class="modal-footer" style="height: 35%">
	<div class="row">
		<div class="col m12 l4" style="width: 200px">
			<div class="card">
				<div class="card-image">
					<img id="imageCard"
						src="http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg"
						class="materialboxed">
				</div>
			</div>
		</div>
		<div class="col m12 l8">
			<div class="input-field col s12">
				<input name="image_link" id="imageLink"
					value="http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg"
					type="text" class="validate"> <label for="image_link">ImageLink</label>
			</div>
		</div>
	</div>
</div>