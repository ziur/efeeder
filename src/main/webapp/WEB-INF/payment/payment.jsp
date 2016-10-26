<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <jsp:attribute name="javascript">
    </jsp:attribute>
    <jsp:body>
        <div class="row">
            Rodri's block
        </div>
        <div class="row">
            <form id="formAddItemId" class="row col s12">
                <div class="row"style="display:${estate}">
                    <div class="input-field col s4">
                        <i class="material-icons prefix">library_add</i>
                        <input id="icon_prefix" type="text" name="item_name" class="validate">
                        <label for="icon_prefix">item name</label>
                    </div>
                    <div class="input-field col s4">
                        <i class="material-icons prefix">comment</i>
                        <input id="icon_telephone" type="text" name="item_description" class="validate">
                        <label for="icon_telephone">description</label>
                    </div>
                    <div class="input-field col s2">
                        <i class="material-icons prefix">payment</i>
                        <input id="icon_pay" type="number" name="item_price" class="validate">
                        <label for="icon_pay">price</label>
                    </div>
                    <div class="col s2">
                        <a id="addItemId" class="btn-floating btn-large waves-effect waves-light green"><i class="material-icons">add</i></a>
                    </div>
                </div>
            </form>
            <div class="row">
                <table id="items_id">
                    <thead>
                        <tr>
                            <th data-field="id">Item Name</th>
                            <th data-field="name">Description</th>
                            <th data-field="price">Item Price</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        <c:forEach var="item" items="#{items}">
                        <label hidden="true">${item.id}</label>
                        <tr id="${item.id}">
                            <td>${item.name}</td>
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
            <div class="row">
                <ul class="collection">
                    <li class="collection-header"><h4>Extra Items</h4></li>
                    <li class="collection-item avatar">
                        <i class="material-icons circle green">shopping_basket</i>
                        <span class="title">taxi</span>
                        <p>12.5</p>
                        <a href="#!" class="secondary-content"><i class="material-icons">delete</i></a>
                    </li>
                    <li class="collection-item avatar">
                        <i class="material-icons circle green">shopping_basket</i>
                        <span class="title">coca-cola</span>
                        <p>10.5</p>
                        <a href="#!" class="secondary-content"><i class="material-icons">delete</i></a>
                    </li>
                    <li class="collection-item avatar">
                        <i class="material-icons circle green">shopping_basket</i>
                        <span class="title">vasos</span>
                        <p>5.0</p>
                        <a href="#!" class="secondary-content"><i class="material-icons">delete</i></a>
                    </li>
                </ul>
            </div>
        </div>
    </jsp:body>
</t:template>
<script>
    $(document).ready(function () {
        $("#addItemId").click(function () {
            var createUserData = new FormData($("#formAddItemId")[0]);
            createUserData.append("id_food_meeting", ${id_food_meeting});
            $.ajax({
                url: "addPaymentItem",
                type: "post",
                data: createUserData,
                processData: false,
                contentType: false,
                cache: false,
                success: function (data) {
                    var button = "<td><a class='btn-floating btn-small waves-effect waves-light red delete-item'><i class='material-icons'>delete</i></a></td>";
                    $("#items_id tr:last").after("<tr id='" + data.id + "'><td>" + data.name + "</td><td>" + data.description + "</td><td>" + data.price + "</td>" + button + "</tr>");
                    updatePay(parseFloat(data.price));
                    $(".delete-item").click(function () {
                        var d = this.parentNode.parentNode.rowIndex;
                        var aa = this;
                        document.getElementById('items_id').deleteRow(d);
                        deletePayItem(this.parentNode.parentNode.id);
                        updatePayDeleted(this.parentNode.parentNode);
                    });
                },
                error: function (data) {
                    errorMessage(data.responseJSON.message);
                }
            });
        });

        var totalItemsPrice = $("#total_items_price_id");

        var updatePay = function (num) {
            $(".validate").val("");
            var numAux = parseFloat(totalItemsPrice.text()) + num;
            totalItemsPrice.text(numAux);
        };

        $(".delete-item").click(
                function () {
                    var d = this.parentNode.parentNode.rowIndex;
                    var aa = this;
                    document.getElementById('items_id').deleteRow(d);
                    deletePayItem(this.parentNode.parentNode.id);
                    updatePayDeleted(this.parentNode.parentNode);
                });

        var functionDeleteRow = function () {
            var d = this.parentNode.parentNode.rowIndex;
            var aa = this;
            document.getElementById('items_id').deleteRow(d);
            deletePayItem(this.parentNode.parentNode.id);
            updatePayDeleted(this.parentNode.parentNode);
        };

        var deletePayItem = function (index) {
            var index_value = {"index_key": "index"};
            $.ajax({
                url: '/action/deletePaymentItem?index=' + index,
                success: function (result) {
                    console.log("resultt : " + result);
                }
            });
        };

        var updatePayDeleted = function (numWrapper) {
            var num = numWrapper.children[2].textContent;
            var numAux = parseFloat(totalItemsPrice.text()) - parseFloat(num);
            totalItemsPrice.text(numAux);
        };
    });
</script>