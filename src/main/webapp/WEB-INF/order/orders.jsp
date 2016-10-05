<%-- 
    Document   : orders
    Created on : Sep 26, 2016, 2:58:45 PM
    Author     : rodrigo_ruiz
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <div class="row">
        <form class="col s12" action="order" method="post" enctype="multipart/form-data">
            <div class="row">
            <input  type="text" name="texto">
            <input  type="file" name="arquivo">
            <input  type="submit" value="Upload">
            </div>
        </form>
        <div class="col s1">
            <img class=" circle responsive-img" src="../assets/img/devil-300x300.jpg">
        </div>
    </div>

    <div class="row">
        <div class="col-sm-12">
            <ul class="collection">
                <li class="collection-item avatar">
                    <i class="material-icons circle">perm_identity</i>
                    <span class="title">Title</span>
                    <p>First Line <br>
                        Second Line
                    </p>
                    <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>
                </li>
                <li class="collection-item avatar">
                    <i class="material-icons circle">perm_identity</i>
                    <span class="title">Title</span>
                    <p>First Line <br>
                        Second Line
                    </p>
                    <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>
                </li>
                <li class="collection-item avatar">
                    <i class="material-icons circle">perm_identity</i>
                    <span class="title">Title</span>
                    <p>First Line <br>
                        Second Line
                    </p>
                    <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>
                </li>
                <li class="collection-item avatar">
                    <i class="material-icons circle">perm_identity</i>
                    <span class="title">Title</span>
                    <p>First Line <br>
                        Second Line
                    </p>
                    <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>
                </li>
            </ul>
        </div>
    </div>
</t:template>
