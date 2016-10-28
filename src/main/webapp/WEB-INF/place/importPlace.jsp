<%@ page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags"%>

<t:template>
	<jsp:attribute name="javascript">
		<script src="/assets/js/importPlace.js"></script>
	</jsp:attribute>
	<jsp:body>
		<div class="container">
			<h2 class="center">IMPORT PLACES &amp; MENUS</h2>
			<div class="row">
				<form class="col s12" id="import-form" role="form" action="ImportPlace" method="post" enctype="multipart/form-data">
					<div class="row">
						<h5  id="file-label" >File  to import</h5>
						<div class="file-field input-field">
							<div id="file-preview" class="btn">
								<span>SELECT A FILE</span>
								<input type="file" name="image" id="file-upload" />
							</div>
							<div class="file-path-wrapper">
								<input id="file-text" class="file-path validate" type="text">
							</div>
						</div>
						<div class="row">
							<div class="right">
								<button id="import-button" class="btn btn-primary" type="button">Import</button>
							</div>
						</div>
					</div>
				</form>
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
		</div>
	</jsp:body>
</t:template>