<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
  <jsp:attribute name="javascript">
    <script>
        
        var mainSideNav = document.getElementById('mainSideNav');
        mainSideNav.style.transition = 'visibility 1s, left 1s'
        var mainCanvas = document.getElementById('mainCanvas');
        var fullscreen = false;
        
        mainCanvas.addEventListener("mousedown",
		function() {
                        if (!fullscreen) return;
                        var list = document.getElementsByTagName("footer");
                        for (var i = 0; i < list.length; ++i)
                        {
                            list[i].style.visibility = 'visible';
                        }
                        var list = document.getElementsByTagName("nav");
                        for (var i = 0; i < list.length; ++i)
                        {
                            list[i].style.visibility = 'visible';
                        }                        
                    
                        var w = mainSideNav.offsetWidth;
			mainSideNav.style.visibility = 'visible';
                        mainSideNav.style.left = '0px';
                        
                        mainCanvas.style = "width:82.5vw;height:65vh;";
                        _resizeCanvas();
                        fullscreen = false;
                },
		false);

	mainSideNav.addEventListener("mousedown",
		function() {
                        if (fullscreen) return;
                        var list = document.getElementsByTagName("footer");
                        for (var i = 0; i < list.length; ++i)
                        {
                            list[i].style.visibility = 'hidden';
                        }
                        var list = document.getElementsByTagName("nav");
                        for (var i = 0; i < list.length; ++i)
                        {
                            list[i].style.visibility = 'hidden';
                        }                        
                    
                        var w = mainSideNav.offsetWidth;
                        mainSideNav.style.visibility = 'hidden';
			//mainSideNav.style.visibility = 'visible';
                        mainSideNav.style.left = '-' + w + 'px';
                        
                        mainCanvas.style = "position:fixed;padding:0;margin:0;top:0;left:0;width:100%;height:100%;";
                        _resizeCanvas();
                        fullscreen = true;
		},
		false);
      
      
        var JsonConfigurationText ='{"chosen":0,"items":["test","test2"]}';
        window.addEventListener("load",
            function() {
                _startBubble();
            },
            false);        
        
        </script>		
        <script src="/assets/js/lib/bubble.js">
        </script>        
    </script>
  </jsp:attribute>

    
<jsp:body>

<div id="mainSideNav" class='side-nav fixed' >
    <p>${id} ooo</p>
    <input id="ss"type="submit" value="postAjax"/>
</div>

<div style="height:25px;"> </div>
<canvas id="mainCanvas" style="width:82.3vw;height:75vh;"/>

</jsp:body>
</t:template>
<script>
    $("#ss").click(function (){
        var sendInfo = {name: "ñoño",description: "ñels",phone: "564654",direction:"c/ñoooo"};
        $.ajax({
           type: "POST",
           url: "/action/createplace",
           dataType: "json",
           success: function (msg) {
               if (msg) {
                   alert(" was added in list !");
               } else {
                   alert("Cannot add to list !");
               }
           },
           data: sendInfo
       });
    });
</script>