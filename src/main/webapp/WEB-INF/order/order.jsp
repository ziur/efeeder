<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>


<t:template>
    <jsp:body>     
        <legend>
            <h2>${meetingName} Payment Summary</h2>        
        </legend>
        <p>Following the summary of the ${meetingName} food request, please add your order now!:</p>
        
        <form action="/action/addOrder" method="post" role="form" id="addForm" class="col-xs-12">
            <input id="meetingId" name="id_food_meeting" type="hidden" value=${id_food_meeting}></input>
            <div class="col-xs-3">
                <select name="id_user" id="users" class="form-control">
                    <option selected disabled>-- Select User --</option>
                    <c:forEach var="user" items="#{users}">  
                        <option value="${user.id}">${user}</option>
                    </c:forEach>
                </select>
                <h6 hidden id="invalid-user-text" class="text-danger">This user is already in the order, <strong>it cannot eat twice!</strong></h6>
            </div>
            <div class="col-xs-5">
                <input name="order" type="text" class="form-control" placeholder="Order" required></input>
            </div>            
            <div class="col-xs-2">
                <input name="cost" type="number" class="form-control" placeholder="Price" required></input>
            </div>
            <div class="col-xs-2">
                <button disabled type="submit" id="add-order" class="btn btn-primary">Add</button> 
            </div>
        </form>
        
        <table class="table table-striped">
          <thead>
              <tr>
                <th>User</th>
                <th>Order</th>
                <th>Cost [Bs]</th>
                <th>Delete</th>
              </tr> 
          </thead>
          <tbody>
            <c:forEach var="order" items="#{orders}">  
                <tr>
                  <td>${order.user}</td>
                  <td>${order.details}</td>
                  <td class="number">${order.cost}</td>
                  <td>
                      <button class="delete-order btn btn-danger btn-xs" data-user-id=${order.user.id} data-meeting-id=${order.idFoodMeeting}>Delete</button>
                  </td>
                </tr>
            </c:forEach>            
          </tbody>
        </table>
        
        <form action="/action/wheeldecide" method="post" role="form" id="wheeldecideactionForm" class=".col-xs-6 .col-md-4">
            <input name="id_food_meeting2" type="hidden" value=${id_food_meeting}></input>
            <div class="col-xs-12">
                <button type="submit" id="wheeldbutton" class="btn btn-primary">who bought?</button> 
            </div>
        </form>    
             
            
        <div class="row">
            <h1 id="goToBuyId" class="col-md-3">The lucky buyer is: </h1>
            <h2 id="nameUserDecide" class="col-md-4"></h2>
        </div>    
    </jsp:body>
</t:template>

<script>   
    var orderUsers = [
        <c:forEach items="${orders}" var="order" varStatus="loop">
        {
            "id": "${order.user.id}",
            "name": "${order.user}"
        }<c:if test="${!loop.last}">,</c:if>
        </c:forEach>
    ];    

    $(".delete-order").click(function() {
       var url = "/action/deleteOrder?id_food_meeting=" + $(this).data("meetingId") +"&id_user=" + $(this).data("userId");
       var deleteButton = $(this);
       $.post(url)
        .done(function(deletedOrder) {
            deleteButton.closest('tr').remove();
            _.remove(orderUsers, function(user){
                return user.id == deletedOrder.user.id;
            });
        })
        .fail(function(err) {
            console.log('Error when deleting the order');
            console.log(err);
        });
    });
    
    $("#users").change(function(){
        var isInvalidUser = _.some(orderUsers, {'id': $(this).val()});
        
        if(isInvalidUser) {
            $("#invalid-user-text").show();
            $("#add-order").prop("disabled",true);
        }
        else {
            $("#invalid-user-text").hide();
            $("#add-order").prop("disabled",false);
        }

    });
   
   $( document ).ready(function() {
      var url2 = "/action/wheeldecideBuyer?id_food_meeting=" + $("#meetingId").val();
      $.post(url2)
       .done(function(userDecide){
           $("#nameUserDecide").text(userDecide.nameBuyer + " " + userDecide.lastNameBuyer);
           $("#wheeldbutton").hide();
       })
       .fail(function(err) {
           console.log('Error when deleting the order');
           console.log(err);
           $("#goToBuyId").hide();
       });
   });
</script>    