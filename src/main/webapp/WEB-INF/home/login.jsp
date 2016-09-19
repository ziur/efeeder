<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>


<t:template>
    <jsp:body>
        <form action="login" method="post">  
            Name:<input type="text" name="nick_name"><br>  
            Password:<input type="password" name="password"><br>  
        <input type="submit" value="login">  
        </form>
    </jsp:body>
</t:template>