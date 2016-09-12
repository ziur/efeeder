<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>


<t:template>
    <jsp:body>     
        <h2>${meetingName} Payment Summary</h2>
        <p>Following the summary of the ${meetingName} food request:</p>
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
        <button type="button" class="btn btn-primary">Guardar</button>  
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