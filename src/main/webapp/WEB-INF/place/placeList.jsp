<%@ page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags"%>
<t:stoolb/>
<t:templateList>
	<jsp:attribute name="javascript">
		<script src="/assets/js/placeList.js"></script>
	</jsp:attribute>
	<jsp:attribute name="modal">
		<!-- Modal Structure -->
		  <div id="modal1" class="modal">
		    <div class="modal-content">
		    	<h6 class="center-align">Register Place</h6>
		    	<form id="place-form" role="form" class="col s12" action="CreatePlace" method="post">
				<div class="col s12">
					<div class="input-field col s12">
					    <input id="id-place" name="name" type="text" autofocus="autofocus">
					    <label for="id-place" class="">Name place:</label>
					</div>
					<div class="input-field col s12">
					    <input id="id-desc" name="description" type="text" autofocus="autofocus">
					    <label for="id-desc">Short description:</label>
					</div>
					<div class="input-field col s12">
					    <input id="id-telf" name="phone" type="tel" autofocus="autofocus">
					    <label for="id-telf">Phone:</label>
					</div>
					<div class="input-field col s12">
					    <input id="id-address" name="address" type="text" autofocus="autofocus">
					    <label for="id-address">Address:</label>
					</div>
					<div class="file-field input-field">
					    <div id="float-rigth" class="btn-floating">
						<i class="material-icons">attach_file</i>
						<input type="file" name="image-link">
					    </div>
					    <div class="file-path-wrapper">
						<input id="id-img" class="file-path" type="text">
						<label for="id-img">Image:</label>
					    </div>
					</div>
					<div id="tag-chip" class="chips-placeholder chips"><input name="tags" class="input" placeholder="+Tag"></div>
				</div>
			    </form> 
		    </div>
		    <div class="modal-footer">
		      <a id="btn-action-cancel" href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Cancel</a>
		      <a id="btn-action-add" href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat modal-close">Save</a>
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
			              <th data-field="phone">Phone</th>
			              <th data-field="options"></th>
			          </tr>
			        </thead>
			        <tbody id="list-place-body">
			          <c:forEach var="place" items="#{places}">
			          <tr id="${place.id}" class="row-item">
			          	  <td><img src="/assets/img/food.svg" alt="" class="circle responsive-img valign table-image"></td>
			              <td>${place.name}</td>
			              <td>${place.description}</td>
			              <td>${place.phone}</td>
			              <td>
			              	<a class='dropdown-button secondary-content' data-beloworigin="true" href='#' data-activates='dropdown-${place.id}'><i class="material-icons">more_vert</i></a>
			              	<!-- Dropdown Structure -->
							  <ul id='dropdown-${place.id}' class='dropdown-content'>
							    <li><a href="/action/placeProfile?id=${place.id}">List Items</a></li>
							  </ul>
			              </td>
			          </tr>
			          </c:forEach>
			        </tbody>
      			</table>
			</div>
			<div class="col s2 blue-grey lighten-5 right-container">
				<div class="header-left-content">
					<img id="d-place-image-link" src="/assets/img/food.svg" alt="" class="card-header img-card-left-side">
				</div>
				<div class="divider"></div>
				<div id="info">
					<p class="title-section">Info</p>
					<div class="row field">
						<div class="col s4 valign-wrapper label-field">
							<label class="label valign">Name</label>
						</div>
						<div class="col s8 value">
							<input id="d-place-name"  class="clear-field" type="text" name="place-name" value="Donald" disabled>
						</div>
					</div>
					<div class="row field">
						<div class="col s4 valign-wrapper label-field">
							<label class="label valign">Description</label>
						</div>
						<div class="col s8 value">
							<textarea id="d-place-description" class="clear-field" name="d-place-description" value="Description" disabled></textarea>
						</div>
					</div>
				</div>
				<div class="divider"></div>
				<div id="cost">
					<p class="title-section">Contact</p>
					<div class="row field">
						<div class="col s4 valign-wrapper label-field">
							<label class="label-field label valign">Phone</label>
						</div>
						<div class="col s8 value">
							<input id="d-place-phone" type="text" name="d-place-phone" class="clear-field" value="4578" disabled>
						</div>
					</div>
					<div class="row field">
						<div class="col s4 valign-wrapper label-field">
							<label class="label-field label valign">Address</label>
						</div>
						<div class="col s8 value">
							<input id="d-place-address" type="text" name="d-place-adress" class="clear-field" value="4578" disabled>
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