<%@tag description="Header Tag" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<c:if test="${showNavBar}">  
    <nav class="light-blue lighten-1" role="navigation">
        <div class="nav-wrapper container"><a id="logo-container" href="/" class="brand-logo">Efeeder</a>
            <ul class="right hide-on-med-and-down">
                <li><image id="image-seccion-id" class="circle responsive-img" src="/action/image?file_name=${user.getImage()}&type=user"/></li>
                <li><a href="/action/logout">Logout</a></li>
            </ul>

            <ul id="nav-mobile" class="side-nav">
                <li><a href="#">Navbar Link</a></li>
                <li><a href="/action/logout">Logout</a></li>
            </ul>
            <a href="#" data-activates="nav-mobile" class="button-collapse"><i class="material-icons">menu</i></a>
        </div>
    </nav>
</c:if>    