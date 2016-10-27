<%@tag description="Header Tag" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<c:if test="${showNavBar}">
	<nav class="light-blue lighten-1" role="navigation">
		<div class="nav-wrapper container">
			<a id="logo-container" href="/" class="brand-logo left">Efeeder</a>
			<div class="countdown input-field col s12 right" style="font-size: 16pt" data-date=""></div>
        </div>		
	</nav>
</c:if>