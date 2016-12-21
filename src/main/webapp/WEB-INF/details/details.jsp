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
                    <br/>
                    <img src="action/image?file_name=${buyer.getImage()}&type=user" width="200" height="200" class="circle">
                </div>
                <div class="col s6">
                    <h5 class="left-align">Place: ${place.name}</h5>
                    <h5 class="left-align">Address Place: ${place.direction}</h5>
                    <img src="${place.image_link}" width="200" height="200" class="circle">
                </div>
            </div>
                
            <div class="row">
                <div class="col s12 m5">
                    <div class="card-panel teal">
                          <h5 class="left-align white-text">Total To Pay: ${food_meeting_totalCost}</h5>
                          <h5 class="left-align white-text">Current Payment: ${payment}</h5>
                          <h5 class="left-align white-text">Extra Items Details: ${total_extra_item_price} / ${usersWithOrders.size()} = ${extra_items_by_users}</h5>
                    </div>
                </div>
                
            </div>    
            
            <div class="row">
              <div class="col s12">
                <ul class="tabs">
                  <li class="tab col s3"><a href="#prinsipal_details_id">General Details</a></li>
                  <li class="tab col s3"><a href="#buyer_details_id">Buyer Details</a></li>
                </ul>
              </div>
              <div id="prinsipal_details_id" class="row">
                  <br/>
                  <br/>
                  <br/>
                    <table class="responsive-table">
                        <thead>
                            <tr>
                                <th data-field="id" class="center-align">Name</th>
                                <th data-field="order" class="center-align">Order</th>
                                <th data-field="order_detais" class="center-align">Order Details</th>
                                <th data-field="quantity" class="center-align">Quantity</th>
                                <th data-field="unity" class="center-align">Unity Price</th>
                                <th data-field="extra_item" class="center-align">Extra items</th>
                                <th data-field="price" class="center-align">Total Cost</th>
                                <th data-field="current_payment" class="center-align">Current payment</th>
                                <th data-field="debt" class="center-align">Debt</th>
                            </tr>
                        </thead>

                        <tbody>
                            <c:forEach var="user" items="#{usersWithOrders}">
                                <tr class="grey lighten-3">
                                    <td>${user.name} ${user.lastName}</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td class="right-align number">${user.getTotalOrders() + extra_items_by_users}</td>
                                    <td class="right-align number">${user.payment}</td>
                                    <td class="right-align number" style="color:${((user.getTotalOrders() + extra_items_by_users) < user.payment) ? "green":"red"}">${user.payment - (user.getTotalOrders() + extra_items_by_users)}</td>
                                </tr>
                                <c:forEach var="order" items="#{user.orders}">
	                                <tr>
	                                    <td>&nbsp;</td>
	                                    <td>${order.placeItem.name}, ${order.placeItem.description}</td>
	                                    <td>${order.details}</td>
	                                    <td class="center-align number">${order.quantity}</td>
	                                    <td class="right-align number">${order.cost}</td>
	                                    <td>&nbsp;</td>
	                                    <td class="right-align number">${order.totalCost}</td>
	                                    <td>&nbsp;</td>
	                                    <td>&nbsp;</td>
	                                </tr>
	                            </c:forEach>
	                            <tr>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td class="right-align">${extra_items_by_users}</td>
                                    <td class="right-align">${extra_items_by_users}</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                </tr>
                            </c:forEach>
                        </tbody>
                    </table>
                </div>
                <div id="buyer_details_id" class="row">
                    <br/>
                    <br/>
                    <br/>
                    <table class="responsive-table">
                        <thead>
                            <tr>
                                <th data-field="place_item_name">Name</th>
                                <th data-field="place_item_price">Price</th>
                                <th data-field="place_item_quantity">Quantity</th>
                                <th data-field="place_item_details">Details</th>
                                <th data-field="place_item_total">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach var="buyer_detail" items="#{buyer_details}">
                                <tr>
                                    <td>${buyer_detail.name}</td>
                                    <td>${buyer_detail.price}</td>
                                    <td>${buyer_detail.quantity}</td>
                                    <td>${buyer_detail.listOfDetails}</td>
                                    <td>${buyer_detail.price * buyer_detail.quantity}</td>
                                </tr>
                            </c:forEach>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </jsp:body>
</t:template>
