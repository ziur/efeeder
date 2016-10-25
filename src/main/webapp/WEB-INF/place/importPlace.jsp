<%@ page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags"%>

<t:template>
	<jsp:attribute name="javascript">
		<script src="/assets/js/importPlace.js"></script>
	</jsp:attribute>
	<jsp:body>
		<div class="row">
			<form class="col s12" id="import-form" role="form" action="ImportPlace" method="post" enctype="multipart/form-data">
				<div class="row">
					<label  id="file-label">File  to import</label>
					<div class="file-field input-field">
						<div id="file-preview" class="btn">
							<span>Browse</span>
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
		<div class="row">
			<form class="col s12">
				<div class="row">
					<label  id="file-label">Log Message:</label>
					<div class="input-field col s12">
						<textarea id="textarea-log" class="materialize-textarea" ></textarea>
					</div>
				</div>
			</form>
		</div>
	</jsp:body>
</t:template>