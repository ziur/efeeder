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
            <form class="row col s12">
                <div class="row">
                    <div class="input-field col s4">
                        <i class="material-icons prefix">library_add</i>
                        <input id="icon_prefix" type="text" class="validate">
                        <label for="icon_prefix">item name</label>
                    </div>
                    <div class="input-field col s4">
                        <i class="material-icons prefix">comment</i>
                        <input id="icon_telephone" type="text" class="validate">
                        <label for="icon_telephone">description</label>
                    </div>
                    <div class="input-field col s2">
                        <i class="material-icons prefix">payment</i>
                        <input id="icon_pay" type="number" class="validate">
                        <label for="icon_pay">cost</label>
                    </div>
                    <div class="col s2">
                        <a class="btn-floating btn-large waves-effect waves-light green"><i class="material-icons">add</i></a>
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

                    <tbody>
                        <tr>
                            <td>Coca-cola</td>
                            <td>bebida gaseosa</td>
                            <td>$6.87</td>
                        </tr>
                        <tr>
                            <td>Jogo del Valle</td>
                            <td>Jugo natural</td>
                            <td>$11.76</td>
                        </tr>
                        <tr>
                            <td>Cumpleañero Jonathan</td>
                            <td>no paga</td>
                            <td>$20.00</td>
                        </tr>
                    </tbody>
                </table>

                <h5 class="right-align"><b>Additional features : </b> $38.78</h5>

            </div>
        </div>
    </jsp:body>
</t:template>