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
                <table>
                    <thead>
                        <tr>
                            <th data-field="id">Item Name</th>
                            <th data-field="name">Description</th>
                            <th data-field="price">Item Price</th>
                        </tr>
                    </thead>

                    <tbody id="tbodyid">
                        <c:forEach var="item" items="#{items}">
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.description}</td>
                                <td>${item.price}</td>
                            </tr>
                        </c:forEach>
                    </tbody>
                </table>
                <h5 class="right-align"><b>Additional features : </b> ${total_item_price}</h5>
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
//                    location.href = "/action/login";
                    $("#tbodyid").append("<tr><td>olaaa</td><td>otra</td><td>100</td></tr>");
//                    alert("llego el dato" + data);
                },
                error: function (data) {
//                    errorMessage(data.responseJSON.message);
                    alert("No se completo el error");
                }
            });
        });
    });
</script>