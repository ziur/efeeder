<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:stoolb/>
<t:templateList>
	<jsp:attribute name="javascript">
			<script type="text/javascript" src="/assets/js/registerPlaceItem.js"></script> 
	</jsp:attribute>
	<jsp:attribute name="modal">
		<!-- Modal Structure -->
		  <div id="modal1" class="modal">
		    <div class="modal-content">
		    	<div class="row" id="container-form-create">
					<h6 class="center-align">Register Place Item</h6>
					<input type="hidden" value="${place.id}" id="idPlace" />
					<form id="create-place-item-form" role="form" action="CreatePlaceItem" method="post">
					<div class="col s12">
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
		    	<div class="row">
		    		 <a id="btn-action-cancel" href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
				     <a id="btn-action-add" href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat modal-close">Save</a>
				</div>
		    </div>
		  </div>
	</jsp:attribute>
	<jsp:body>
		<div class="row body-content layout-list">
			<div class="col s10">
				<table class="highlight">
			        <thead>
			          <tr>
			              <th data-field="image"></th>
			              <th data-field="name">Name</th>
			              <th data-field="description">Description</th>
			              <th data-field="phone">Precio</th>
			          </tr>
			        </thead>
			        <tbody id="table-place-item">
			          <c:forEach var="placeItem" items="#{placeItems}">
			          <tr id="${placeItem.id}" class="row-item">
			          	  <td><img src="${placeItem.imageLink}" alt="" class="circle responsive-img valign table-image"></td>
			              <td>${placeItem.name}</td>
			              <td>${placeItem.description}</td>
			              <td>${placeItem.price}</td>
			          </tr> 
			          </c:forEach> 
			        </tbody>
      			</table>
			</div>
			<div class="col s2 blue-grey lighten-5 right-container">
				<div class="header-left-content">
					<img id="d-place-item-imageLink" src="/assets/img/food.svg" alt="" class="card-header img-card-left-side">
				</div>
				<div class="divider"></div>
				<div id="info">
					<p class="title-section">Info</p>
					<div class="row field">
						<div class="col s4 valign-wrapper label-field">
							<label class="label valign">Name</label>
						</div>
						<div class="col s8 value">
							<input id="d-place-item-name"  class="clear-field" type="text" name="place-item-name" value="Donald" disabled>
						</div>
					</div>
					<div class="row field">
						<div class="col s4 valign-wrapper label-field">
							<label class="label valign">Description</label>
						</div>
						<div class="col s8 value">
							<textarea id="d-place-item-description" class="clear-field" name="d-place-item-description" value="Description" disabled></textarea>
						</div>
					</div>
				</div>
				<div class="divider"></div>
				<div id="cost">
					<p class="title-section">Cost</p>
					<div class="row field">
						<div class="col s4 valign-wrapper label-field">
							<label class="label-field label valign">Price</label>
						</div>
						<div class="col s8 value">
							<input id="d-place-item-price" type="text" name="d-place-item-price" class="clear-field" value="4578" disabled>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div  id="log-message-container" class="row" hidden="true">
			<form class="col s12">
				<div class="row">
					<h5  id="file-label">Log Message:</h5>
					<div class="input-field col s12">
						<textarea id="textarea-log" class="materialize-textarea" ></textarea>
					</div>
				</div>
			</form>
		</div>
	</jsp:body>
</t:templateList>
