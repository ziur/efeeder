<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<div class="modal-content">
	<div class="row">
		<p class="col s12 grey-text">Please select your orders.<p>
		<div class="image-links col s12">
			<c:forEach var="placeItem" items="#{place.placeItems}">
				<div class="grid-item" style="width:200px">
					<div class="card">
						<div class="card-image waves-effect waves-block waves-light">
							<img class="image-link" src="${placeItem.imageLink}"
								data-image-link="${placeItem.imageLink}"
								data-id="${placeItem.id}"
								data-name="${placeItem.name}"
								data-price="${placeItem.price}">
						</div>
						<div class="card-content">
							<p>${placeItem.name}</p>
							<p>Price: ${placeItem.price} Bs.</p>
						</div>
					</div>
				</div>
			</c:forEach>
		</div>
	</div>
	<hr/>
	<div class="row">
		<div class="col s3">
			<div class="card">
				<div class="card-image">
					<img id="image-card-id" 
						 src="http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg">
				</div>
			</div>
		</div>
		<form id="create-place-item-form" role="form" action="CreatePlaceItem" method="post">
			<div class="col s9">
				<p class="grey-text col s12">Add new item:<p>
				<div class="input-field col s10">
					<input name="item-name" id="item-name" type="text"  autofocus="autofocus"/>
					<label for="item-name">Name:</label>
				</div>
				<div class="input-field col s2">
					<input name="item-price" id="item-price" type="number"  autofocus="autofocus"/>
					<label for="item-price">Cost:</label>
				</div>
				<div class="input-field col s12">
					<input name="item-description" id="item-description" type="text" autofocus="autofocus"/>
					<label for="item-description">Description:</label>
				</div>
				<div class="input-field col s12">
					<input name="image-link" id="image-link-id" 
							value="http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg" 
							type="text" class="validate" autofocus="autofocus"> <label for="image-link">Image Link</label>
				</div>
			</div>
		</form>
	</div>
	
</div>

<div class="modal-footer">
	<a class=" waves-effect waves-green btn-flat" id="add_new_item_button">Add New Item</a>
	<a class=" modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
</div>