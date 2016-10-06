<%-- 
    Document   : user
    Created on : Sep 13, 2016, 10:39:45 AM
    Author     : rodrigo_ruiz
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>


<t:template>
    <jsp:attribute name="javascript">
        <script src="/assets/js/createUser.js"></script>
    </jsp:attribute>

    <jsp:body>
        <div class="row" style="margin-top: 10%;">
            <div class="row">
                <div class="col offset-m3 s12 m6">
                    <div class="card">
                        <div class="card-content">
                            <form id="CreateUserForm" role="form" action="CreateUser" method="post" enctype="multipart/form-data">
                                <div class="row center-align">
                                    <div id="image-preview" class="circle responsive-img" name="image1">
                                        <!--<i class="large teal-text material-icons prefix">account_circle</i>-->
                                        <!--<img id="image_id" type="file" class="circle responsive-img col s4" src="http://mainefoodstrategy.org/wp-content/uploads/2015/04/HealthyFood_Icon.jpg">-->
                                        <label for="image-upload" id="image-label" class="center" name="image3">
                                            <!--Choose File-->
                                            <i class="large material-icons">mode_edit</i>
                                        </label>
                                        <input type="file" name="image" id="image-upload" style="display:none;"/>
                                    </div>
                                </div>
                                <div class="row">
                                    <h6 class='center thin grey-text'>Please write in the following fields</h6>
                                </div>
                                <div class="row">
                                    <div class="input-field col s6">
                                        <input class="validate" id="name" type="text" name="name"  autocomplete="off"/>
                                        <label for="name"  >Name.</label>
                                    </div>
                                    <div class="input-field col s6">
                                        <input class="validate" id="last_name" type="text" name="last_name"  autocomplete="off"/>
                                        <label for="last_name">Last Name.</label>
                                    </div>
                                    <div class="input-field col s12">
                                        <input class="validate" id="email" type="email" name="email"  autocomplete="off"/>
                                        <label for="email">Email.</label>
                                    </div>
                                    <div class="input-field col s12">
                                        <input class="validate" id="username" type="text" name="username"  autocomplete="off"/>
                                        <label for="username">User name.</label>
                                    </div>
                                    <div class="input-field col s12">
                                        <input class="validate" id="password" type="password" name="password" />
                                        <label for="pasword">Password.</label>
                                    </div>
                                    <div class="input-field col s12">
                                        <input class="validate" id="confirm_password" type="password" name="confirm_password" />
                                        <label for="confirm_password" >Confirm Password.</label>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="right">
                                        <button id="LoginCancel" class="btn btn-primary" type="button">Cancel</button>
                                        <button class="btn btn-primary" type="submit">Add User</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </jsp:body>
</t:template>
<script>
    $(document).ready(function () {
        var oo = $.uploadPreview({
            input_field: "#image-upload",
            preview_box: "#image-preview",
            label_field: "#image-label"
        });

        console.log("looo oo : " + oo)
    });

</script>