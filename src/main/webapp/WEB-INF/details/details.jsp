<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <jsp:attribute name="javascript">
        <link rel="stylesheet" type="text/css" href="/assets/css/printDetails.css" media="print">
		<script src="/assets/js/details.js"></script>
    </jsp:attribute>
    <jsp:body>
        <div class="row">
			<input type="hidden" id="payment_time" value="${paymentTime}" />
            <div class="row">
                <h2>Details of "${food_meeting.name}"</h2>
                <div class="col s6">
                    <h5 class="left-align">Lucky Buyer: ${buyer.name} ${buyer.lastName}</h5>
                    <img src="action/image?file_name=${buyer.getImage()}&type=user" width="200" height="200" class="circle">
                </div>
                <div class="col s6">
                    <h5 class="left-align">The place: ${place.name}</h5>
                    <h5 class="left-align">The address place: ${place.direction}</h5>
                    <img src="${place.image_link}" width="200" height="200" class="circle">
                </div>
            </div>
            <div class="row">
                <table class="responsive-table">
                    <thead>
                        <tr>
                            <th data-field="id">Name</th>
                            <th data-field="name">Order</th>
                            <th data-field="price">Cost</th>
                        </tr>
                    </thead>

                    <tbody>
                        <c:forEach var="order" items="#{orders}">
                            <tr>
                                <td>${order.user.name}</td>
                                <td>${order.details}</td>
                                <td>${order.cost}</td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>
                <h5 class="right-align">Total To Pay: ${payment}</h5>
            </div>
        </div>
    </jsp:body>
</t:template>
