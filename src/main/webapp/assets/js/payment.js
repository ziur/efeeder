$(document).ready(function () {
    $("#formAddItemId").submit(function (event) {
        var createUserData = new FormData($("#formAddItemId")[0]);
                createUserData.append("id_food_meeting", $("#input-food-meeting-id").val());
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
            event.preventDefault();
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
                 Materialize.toast('You delete' + result, 2000);
            }
        });
    };

    var updatePayDeleted = function (numWrapper) {
        var num = numWrapper.children[2].textContent;
        var numAux = parseFloat(totalItemsPrice.text()) - parseFloat(num);
        totalItemsPrice.text(numAux);
    };
});
