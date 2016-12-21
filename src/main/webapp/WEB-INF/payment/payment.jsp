<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <jsp:attribute name="javascript">
        <script src="/assets/js/payment.js"></script>
    </jsp:attribute>
    <jsp:body>
        <input id="food-meeting-id" hidden="true" value="${id_food_meeting}" type="text"/>
        <input id="input-food-meeting-id" hidden="true" value="${id_food_meeting}" type="text"/>
        <input id="input-state-id" hidden="true" value="${estate}" type="text"/>
        <t:foodMeetingInfo foodMeeting="${foodMeeting}"/>
        <div class="row">
            <div class="col-sm-12">
                <ul class="collection" >
                    <div id="my-order-container">
                    	<c:forEach var="userWithOrders" items="#{usersWithOrders}">
                    		<li class="collection-item avatar" id="order-${userWithOrder.id} }">
                    			<i class="material-icons circle">perm_identity</i>
                                <p><b>${userWithOrders.name} ${userWithOrders.lastName}</b></p>
                                <div class="row" style="margin-bottom: 0px;">
                                	<div class="col s12 m12 l12">
                                		<div class="col s1">
                                        	<label>Quantity</label>
                                        </div>
                                        <div class="col s2">
                                        	<label>Item</label>
                                        </div>
                                        <div class="col s4">
                                        	<label>Details</label>
                                        </div>
                                        <div class="col s2">
                                        	<label>Unit Cost</label>
                                        </div>
                                        <div class="col s2">
                                        	<label>Cost</label>
                                        </div>
                                	</div>
                                </div>
                                <c:forEach var="order" items="#{userWithOrders.orders}">
                                	<div class="row" style="margin-bottom: 0px;">
	                                	<div class="col s12 m12 l12">
	                                		<div class="col s1">
	                                        	<label>${order.quantity}</label>
	                                        </div>
	                                        <div class="col s2">
	                                        	<label>${order.placeItem}</label>
	                                        </div>
	                                        <div class="col s4">
	                                        	<label>${order.details}</label>
	                                        </div>
	                                        <div class="col s2">
	                                        	<label>Bs.- ${order.cost}</label>
	                                        </div>
	                                        <div class="col s2">
	                                        	<label>Bs.- ${order.getTotalCost()}</label>
	                                        </div>
	                                	</div>
	                                </div>
                                </c:forEach>
                                <br/>
                                <input id="user-id" hidden="true" value="${userWithOrders.id}" type="text"/>
                                <div class="row" style="margin-bottom: 0px;">
                                    <div class="col s12 m12 l12">
                                        <div class="row">
                                            <div class="input-field col s1" style="margin-top: 27px;">
                                                <span style="padding-left: 60px;">Bs.-</span>
                                            </div>                                            
                                            <div class="input-field col s3">
                                                <input id="ipt-cost${userWithOrders.id}" disabled type="number" type="text" class="validate" value="${userWithOrders.getTotalOrders()}">
                                                <label for="ipt-cost">Cost</label>
                                            </div>
                                            <div class="input-field col s1" style="margin-top: 27px;">
                                                <span style="padding-left: 60px;">Bs.-</span>
                                            </div>                                                
                                            <div class="input-field col s3">
                                                <input id="ipt-extra-pay${userWithOrders.id}" type="number" disabled type="text" class="validate" value="${partialByOrder}">
                                                <label for="ipt-extra-pay">Extra pay</label>
                                            </div>
                                            <div class="input-field col s1" style="margin-top: 27px;">
                                                <span style="padding-left: 60px;">Bs.-</span>
                                            </div>                                                
                                            <div class="input-field col s3">
                                                <input id="ipt-total${userWithOrders.id}" class="ipt-number" type="number" disabled type="text" class="validate" value="${partialByOrder + userWithOrders.getTotalOrders()}">
                                                <label for="ipt-total">Total</label>
                                            </div>                                            
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col s12 m12 l12">
                                        <div class="input-field col s1" style="margin-top: 27px;">
                                            <span style="padding-left: 60px;">Bs.-</span>
                                        </div> 
                                        <div class="input-field col s5">
                                            <input id="ipt-shortage${userWithOrders.id}" disabled type="number" class="ipt-number" value="${userWithOrders.payment > 0 ? userWithOrders.payment - (partialByOrder + userWithOrders.getTotalOrders()) : 0.0}"
                                                   style="color:${(userWithOrders.payment >= (partialByOrder + userWithOrders.getTotalOrders())) || userWithOrders.payment == 0  ? "green":"red"}"/>
                                            <label for="ipt-shortage">Shortage</label>
                                        </div>
                                        <div class="input-field col s1" style="margin-top: 27px;">
                                            <span style="padding-left: 60px;">Bs.-</span>
                                        </div>                                                                                    
                                        <div class="input-field col s5">
                                            <input id="ipt-payment${userWithOrders.id}" ${buyer.getUserId() != user.getId() ? "disabled":""} type="number" id="my-order-cost-input" value="${userWithOrders.payment}" placeholder="Payment" />                                                
                                            <label for="ipt-payment${userWithOrders.id}">Payment</label>

                                        </div>                                        
                                    </div>
                                </div>
                                
                                <c:if test="${foodMeeting.buyerId == user.getId()}">
                                    <a href="#" id="lnk-check${userWithOrders.id}" class="secondary-content" style="padding-right:35px">
                                        <i class="material-icons">${userWithOrders.payment >= (partialByOrder + userWithOrders.getTotalOrders()) ? "done":"crop_square"}</i>
                                    </a>      
                                    <a href="#" class="lnk-save secondary-content">
                                        <i class="material-icons">save</i>
                                    </a>                                      
                                </c:if>
                    		</li>
                    	</c:forEach>
                    </div>
                </ul>
            </div>
            <c:if test="${foodMeeting.buyerId == myUser.id}">
                <div class="col-sm-12">
                    <div class="fixed-action-btn horizontal">
                        <a id="btn-details" class="btn-floating btn-large waves-effect waves-light"><i class="material-icons">view_list</i></a>
                    </div>
                </div>
            </c:if>
        </div>   
        <div class="row">
            <form id="formAddItemId" class="row col s12">
                <div class="row" style="display:${estate}">
                    <div class="input-field col s4">
                        <i class="material-icons prefix">comment</i>
                        <input id="input-item-description-id" type="text" name="item_description" class="ipt-item" required="true">
                        <label for="input-item-description-id">description</label>
                    </div>
                    <div class="input-field col s2">
                        <i class="material-icons prefix">payment</i>
                        <input id="input-item-price-id" type="number" name="item_price" class="ipt-item" required="true" step="any">
                        <label for="input-item-price-id">price</label>
                    </div>
                    <div class="col s2">
                        <button id="addItemId" class="btn waves-effect waves-light" type="submit">ADD
                            <i class="material-icons right">add</i>
                        </button>

                    </div>
                </div>
            </form>
            <div class="row">
                <table id="items_id">
                    <thead>
                        <tr>
                            <th data-field="name">Description</th>
                            <th data-field="price">Item Price</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        <c:forEach var="item" items="#{items}">
                        <label hidden="true">${item.id}</label>
                        <tr id="${item.id}">
                            <td>${item.description}</td>
                            <td>${item.price}</td>
                            <td>
                                <a class="btn-floating btn-small waves-effect waves-light red delete-item" style="display:${estate}"><i class="material-icons">delete</i></a>
                            </td>
                        </tr>
                    </c:forEach>
                    </tbody>
                </table>
                <h5 id="total_items_price_id" class="right-align">${total_item_price}</h5>
            </div>
        </div>
    </jsp:body>
</t:template>