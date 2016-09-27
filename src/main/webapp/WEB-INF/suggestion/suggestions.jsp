<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
  <jsp:attribute name="javascript">
    <script src="/assets/js/lib/bubble.js"></script>
    <script>
/*
      var mainSideNav = document.getElementById('mainSideNav');
      mainSideNav.style.transition = 'visibility 1s, left 1s'
      var mainCanvas = document.getElementById('mainCanvas');
      var fullscreen = true;
*/
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
                break;
              case "org.jala.efeeder.servlets.websocket.avro.RaffleEvent":
                _startBubble(eventMessage);
                break;
            }
          });


        });

        $("#connect").click(function () {
          var foodMeeting = 2;
          communicationService.connect('ws://localhost:8080/ws', foodMeeting);
        });

        $("#raffle").click(function () {
          communicationService.sendMessage({user:1, room: 2, command:"Wheeldecide", events:[]});
        });
      });
    </script>
  </jsp:attribute>
  <jsp:body>

      <p>${id} ooo</p>
      <input id="connect" type="submit" value="Connect"/>
      <input id="raffle" type="submit" value="Start Raffle"/>

    <div style="height:25px;"></div>
    <canvas id="mainCanvas" style="width:82.3vw;height:75vh;"/>

  </jsp:body>


</t:template>
