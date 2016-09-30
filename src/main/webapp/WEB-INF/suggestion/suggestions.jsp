<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
  <jsp:attribute name="javascript">
        <script src="/assets/js/lib/bubble.js">
        </script> 
  </jsp:attribute>

    
<jsp:body>

<div id="mainSideNav" class='side-nav fixed' >
    <div style='text-align:center;'>
        <p style='text-align:center;'>Food meeting id: ${id}</p>
        <input id="raffle" type="submit" value="Start raffle"/>
        <br>
        <br>
        <div id='debugDiv'></div>
    </div>  
</div>

<div style="height:25px;"> </div>
<canvas id="mainCanvas" style="width:82.3vw;height:80vh;"/>

</jsp:body>
</t:template>
<script src="/assets/js/lib/bk.js">
</script>
<script>
    var g_idFoodMeeting = '${id}';
</script>
<script src="/assets/js/voting.js">
</script>
<script>
    $(function () {
      var communicationService = new CommunicationService();

      communicationService.onMessage(function (event) {

        $.each(event.events, function(index, item) {
          var eventType = Object.getOwnPropertyNames(item.event)[0];
          var eventMessage = item.event[eventType];
          switch (eventType) {
            case "org.jala.efeeder.servlets.websocket.avro.WelcomeEvent":
              document.getElementById('debugDiv').innerHTML = 'WebSockets connected';
              break;
            case "org.jala.efeeder.servlets.websocket.avro.RaffleEvent":
              document.getElementById('debugDiv').innerHTML = 'Starting raffle';
              _startBubble(eventMessage);
              break;
          }
        });
      });

      var foodMeeting = ${id};
      communicationService.connect('ws://' + location.host + '/ws', foodMeeting);

      $("#raffle").click(function () {
        communicationService.sendMessage({user:1, room: 4, command:"Wheeldecide", events:[]});
      });
    });

</script>