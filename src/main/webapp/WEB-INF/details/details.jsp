<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <jsp:attribute name="javascript">
        <link rel="stylesheet" type="text/css" href="/assets/css/printDetails.css" media="print">
    </jsp:attribute>
    <jsp:body>
        <legend class="background:blue">
            <div class="row">
                <h2>Details of "${food_meeting.name}"</h2>
                <div class="col s6">
                    <h5 class="left-align">Lucky Buyer: ${buyer.name}</h5>
                    <img src="action/image?file_name=${buyer.getImage()}&type=user" width="200" height="200" class="circle responsive-img">
                </div>
                <div class="col s6">
                    <h5 class="left-align">The place: ${place.name}</h5>
                    <h5 class="left-align">The place: ${place.direction}</h5>
                    <img src="${place.image_link}" width="200" height="200" class="circle responsive-img">
                </div>
            </div>
            <div class="row">
                <table class="responsive-table">
                    <thead>
                        <tr>
                            <!--<th data-field="image"/>-->
                            <th data-field="id">Name</th>
                            <th data-field="name">Order</th>
                            <th data-field="price">Cost</th>
                        </tr>
                    </thead>

                    <tbody>
                        <c:forEach var="order" items="#{orders}">
                            <tr>
                                <!--<tb><img src="action/image?file_name=empty&type=user" class="circle responsive-img"></tb>-->
                                <td>${order.user.name}</td>
                                <td>${order.details}</td>
                                <td>${order.cost}</td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>
                <h5 class="right-align">Total To Pay: ${payment}</h5>
            </div>
        </legend>
    </jsp:body>
</t:template>
