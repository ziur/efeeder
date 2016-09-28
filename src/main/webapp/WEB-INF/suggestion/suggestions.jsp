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
    <p>Food meeting id: ${id}</p>
    <input id="ss"type="submit" value="postAjax"/>
    <input id="raffle" type="submit" value="Start raffle"/>
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

      var foodMeeting = 4;
      communicationService.connect('ws://localhost:8080/ws', foodMeeting);

      $("#raffle").click(function () {
        communicationService.sendMessage({user:1, room: 4, command:"Wheeldecide", events:[]});
      });
    });

</script>