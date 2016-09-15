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
            <input name="id_food_meeting" type="hidden" value=${id_food_meeting}></input>
            <div class="col-xs-3">
                <select name="id_user" id="users" class="form-control">
                    <c:forEach var="user" items="#{users}">  
                        <option value="${user.id}">${user}</option>
                    </c:forEach>
                </select>
            </div>
            <div class="col-xs-5">
                <input name="order" type="text" class="form-control" placeholder="Order" required></input>
            </div>            
            <div class="col-xs-2">
                <input name="cost" type="number" class="form-control" placeholder="Price" required></input>
            </div>
            <div class="col-xs-2">
                <button type="submit" id="add" class="btn btn-primary">Add</button> 
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
                
    </jsp:body>
</t:template>

<script>
   $( document ).ready(function() {
       $('table').editableTableWidget(); 
       
       $('table .number').on('validate', function(evt, newValue) {  
          return false;         
        });
   });
   
   $(".delete-order").click(function() {
       var url = "/action/deleteOrder?id_food_meeting=" + $(this).data("meetingId") +"&id_user=" + $(this).data("userId");
       var deleteButton = $(this);
       $.post(url)
        .done(function(order) {
            deleteButton.closest('tr').remove();
        })
        .fail(function(err) {
            console.log('Error when deleting the order');
            console.log(err);
        });
    });
   
</script>    