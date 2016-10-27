<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <jsp:attribute name="javascript">
	<script src="/assets/js/lib/bubble.js"></script> 
	<script>
		var g_feastId = ${feastId};
	</script>
	<script src="/assets/js/place.js"></script>
	<script id="placeTmpl" type="text/x-jsrender">
	    <ul id="collid" class="collection">
		<li id="{{:id}}" class="collection-item avatar">
		    <img src="/assets/img/food.svg" alt="" class="circle">
		    <span class="title">{{:name}}</span>
		    <p class="description">{{:description}}</p>
		    <p class="description"> <span class="phone">Tel.:</span> {{:phone}} </p>
		</li>
	    </ul>
	</script>
    </jsp:attribute>
        
    <jsp:body>
	<div id="mainSideNav" class="side-nav fixed left-nav-bar-prapper">
	    <div class="search-box-container">
		<input id="search" type="text" autocomplete="off" placeholder="Search for ..." >
	    </div>
	    <div id="custom-card" class="card">
		<div class="card-content">
		    <div id="places">
			<c:forEach var="place" items="#{places}">
			    <ul id="collid" class="collection">
				<li id="${place.id}" class="collection-item avatar">
				    <img src="/assets/img/food.svg" alt="" class="circle">
				    <span class="title">${place.name}</span>
				    <p class="description">${place.description}</p>
				    <p class="description"><span class="phone">Tel.:</span>${place.phone}</p>
				</li>
			    </ul>
			</c:forEach>
		    </div>
		    <button id="add-new-place" class="activator btn-floating waves-effect waves-light">
			<i class="material-icons">playlist_add</i> 
		    </button>
		</div>
		<div id="custom-card-level" class="card-reveal">
		    <span class="card-title grey-text text-darken-4">New Place<i class="material-icons right">close</i></span>
		    <form id="place-form" class="col s12">
			<div class="input-field col s12">
			    <input id="id-place" type="text" class="validate">
			    <label for="id-place">Name place:</label>
			</div>
			<div class="input-field col s12">
			    <input id="id-desc" type="text">
			    <label for="id-desc">Short description:</label>
			</div>
			<div class="input-field col s12">
			    <input id="id-telf" type="tel">
			    <label for="id-telf">Phone:</label>
			</div>
			<div class="input-field col s12">
			    <input id="id-address" type="text">
			    <label for="id-address">Address:</label>
			</div>
			<div class="file-field input-field">
			    <div id="float-rigth" class="btn-floating">
				<i class="material-icons">attach_file</i>
				<input type="file">
			    </div>
			    <div class="file-path-wrapper">
				<input id="id-img" class="file-path" type="text">
				<label for="id-img">Image:</label>
			    </div>
			</div>
		    </form>
		    <button id="place-form-sumit-button"class="btn waves-effect waves-light" type="submit">save</button>
		</div>
	    </div>
	</div>
        <div style="height:25px;"> </div>
		<input type="hidden" id="voting_time" value="${votingTime}" />
        <canvas id="mainCanvas" style="width:82.3vw;height:80vh;"/>
    </jsp:body>    
</t:template>
    
<script src="/assets/js/lib/bk.js"></script>
<script src="/assets/js/voting.js"></script>