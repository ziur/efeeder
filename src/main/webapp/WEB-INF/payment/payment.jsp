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
        <div class="row">
            <div class="col-sm-12">
                <ul class="collection" >
                    <div id="my-order-container">
                        <c:forEach var="order" items="#{orders}">
                            <li class="collection-item avatar" id="order-${order.idUser}">
                                <i class="material-icons circle">perm_identity</i>
                                <p><b>${order.user.name} ${order.user.lastName}</b></p>
                                <span class="my-order-details" class="title">${order.details}</span>
                                <br/>
                                <input id="user-id" hidden="true" value="${order.idUser}" type="text"/>
                                <p class="my-order-cost">${order.cost} </p> 
                                <p class="partial-by-order"> + ${partialByOrder} = ${partialByOrder + order.cost} </p>                                
                                <c:if test="${buyer.getUserId() == user.getId()}">
                                    <c:if test="${order.payment >= partialByOrder + order.cost}">    
                                        <input style="display: none;" type="number" id="my-order-cost-input" value="${order.payment}" placeholder="Payment" />
                                        <p class="label-payment">${order.payment}</p>
                                        <a href="#" class="btn-edit-my-order btn-edit secondary-content">
                                            <i class="material-icons">done</i>
                                        </a>                                        
                                    </c:if>
                                    <c:if test="${order.payment < partialByOrder + order.cost}">    
                                        <input type="number" id="my-order-cost-input" value="${order.payment}" placeholder="Payment" />
                                        <p class="label-payment" style="display: none;">${order.payment}</p>
                                        <a href="#" class="btn-edit-my-order btn-edit secondary-content">
                                            <i class="material-icons">crop_square</i>
                                        </a>                                        
                                    </c:if>
                                </c:if>
                            </li>
                        </c:forEach>
                    </div>
                </ul>
            </div>
            <c:if test="${foodMeeting.userOwner.id == myUser.id}">
                <div class="col-sm-12">
                    <div class="fixed-action-btn horizontal">
                        <a id="btn-payment" class="btn-floating btn-large waves-effect waves-light"><i class="material-icons">payment</i></a>
                    </div>
                </div>
            </c:if>
        </div>   
        <div class="row">
            <form id="formAddItemId" class="row col s12">
                <div class="row" style="display:${estate}">
                    <div class="input-field col s4">
                        <i class="material-icons prefix">comment</i>
                        <input id="input-item-description-id" type="text" name="item_description" class="validate" required="true">
                        <label for="input-item-description-id">description</label>
                    </div>
                    <div class="input-field col s2">
                        <i class="material-icons prefix">payment</i>
                        <input id="input-item-price-id" type="number" name="item_price" class="validate" required="true" step="any">
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
        
        <div class="col-sm-12">
            <div class="fixed-action-btn horizontal">
                <a id="btn-finished" class="btn-floating btn-large waves-effect waves-light" style="display:${estate}"><i class="material-icons">receipt</i></a>
            </div>
        </div>
    </jsp:body>
</t:template>