<%-- 
    Document   : wheeld
    Created on : Sep 9, 2016, 5:32:35 PM
    Author     : alexander_castro
--%>

<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>


<t:template>
    <jsp:body>
        <canvas id="mainCanvas"/>
        <script>
            var JsonConfigurationText =${jsonData};
        </script>		
        <script type="text/javascript" src="/assets/js/bubble.js"></script>
        <script type="text/javascript">
                start();
        </script>
    </jsp:body>
</t:template>
