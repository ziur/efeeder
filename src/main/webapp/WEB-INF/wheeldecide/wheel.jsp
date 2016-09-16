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
        <div class="row">
            <div class="col-md-12">
                <canvas id="mainCanvas"/>
            </div>
        </div>
        <div class="row">
            <div class="col-md-12">
                <button type="submit" id="comeBackId" class="btn btn-default"> <==Come Back </button> 
            </div>
        </div>    
        <script>
            canvas = document.getElementById('mainCanvas');
            canvas.style.height = window.innerHeight * 0.85 + "px";
            canvas.style.width = "100%";
            
            var JsonConfigurationText =${jsonData};
        </script>		
        <script src="/assets/js/bubble.js">
        </script>
    </jsp:body>        
</t:template>

<script>
    $("#comeBackId").click(function() {
        window.location.href = '/action/FoodMeeting'
    });
        
</script>