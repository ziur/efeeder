<%@tag description="Header Tag" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<c:if test="${showNavBar}">
	<div class="navbar-fixed">
		<nav class="light-blue lighten-1" role="navigation">
			<div class="nav-wrapper container">
				<a id="logo-container" href="/" class="brand-logo center">Efeeder</a>
				<div class="countdown right" style="font-size: 16pt" data-date=""></div>
                <ul id="slide-out" class="side-nav" style="margin: 0;">
                    <li><div class="userView">
							<img class="background" src="/assets/img/background-image.jpg">
							<a><img class="circle" src="action/image?file_name=${user.getImage()}&type=user"></a>
							<a><span class="white-text name">${user.getUserName()}</span></a>
							<a><span class="white-text email">${user.getEmail()}</span></a>
						</div></li>
                    <li><a href="/">Home</a></li>
                    <li><a href="/action/updateuserpage">Profile</a></li>
                    <li><a href="/action/usermeetings">History</a></li>
                    <li><div class="divider"></div></li>
                    <li><a class="waves-effect" href="/action/logout"><i class="material-icons">power_settings_new</i>Log Out</a></li>
                </ul>
                <a href="#" data-activates="slide-out" class="menu-navbar"><i class="material-icons">menu</i></a>
			</div>
		</nav>
	</div>	
</c:if>
