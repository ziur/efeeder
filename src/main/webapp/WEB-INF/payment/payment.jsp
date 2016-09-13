<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>


<t:template>
    <jsp:body>     
        <legend>
            <h2>${meetingName} Payment Summary</h2>        
        </legend>
        <p>Following the summary of the ${meetingName} food request, please add your order now!:</p>
        
        <form role="form" id="addForm" class="col-xs-12">
            <div class="col-xs-3">
                <input name="user" type="text" class="form-control" placeholder="User" required></input>
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
              </tr> 
          </thead>
          <tbody>
            <c:forEach var="payment" items="#{payments}">  
                <tr>
                  <td>${payment.user}</td>
                  <td>${payment.order}</td>
                  <td class="number">${payment.cost}</td>
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
   
</script>    