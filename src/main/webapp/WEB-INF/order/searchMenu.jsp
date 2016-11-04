<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<div class="modal-content">
	<div class="row">
		<p class="col s12 grey-text">Too lazy to look for an image?  You can always pick one of our default ones:<p>
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
</div>

<div class="modal-footer">
	<a class=" modal-action modal-close waves-effect waves-green btn-flat" id="accept_button">Agree</a>
	<a class=" modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
</div>