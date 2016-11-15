<%--
	Document   : tyche
	Created on : Nov 5, 2016, 2:38:57 PM
	Author     : 0x3
--%>
<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>
<t:template>
	<jsp:attribute name="javascript">
	<script>
		var g_feastId = ${feastId};
		var g_buyerId = ${buyerId};
		var g_feastJson = ${feastJson};
		var g_placeJson = ${placeJson};
		var g_drawnLotsJson = ${drawnLotsJson};
	</script>
	<script src="/assets/js/lib/bk.js"></script>
	<script src="/assets/js/tyche.js"></script>
	</jsp:attribute>
	<jsp:body>
	<div id="preloader" class="col s12 center-align">
		<div style="height:30vh"></div>
		<div class="valign preloader-wrapper big active">
			<div class="valign spinner-layer spinner-blue-only">
				<div class="circle-clipper left"><div class="circle"></div></div>
				<div class="gap-patch"><div class="circle"></div></div>
				<div class="circle-clipper right"><div class="circle"></div></div>
			</div>
		</div>
		<div style="text-align:center;color:#9e9e9e;font-weight:400;font-family:sans-serif;font-size:1.64rem;">Loading...</div>
	</div>
	<canvas id="mainCanvas"/>
	</jsp:body>
</t:template>