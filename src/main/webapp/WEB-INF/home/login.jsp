<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>


<t:template>
    <jsp:body>
        <div class="container" style="margin-top: 5%;">
            <div class="col-md-4 col-md-offset-4">
                <div class="panel panel-primary">
                    <div class="panel-heading">Login</div>
                        <div class="panel-body">
                        
                            <!-- Login Form -->
                            <form role="form" action="login" method="post">
                            
                            <!-- Username Field -->
                                <div class="row">
                                    <div class="form-group col-xs-12">
                                    <label for="username"><span class="text-danger" style="margin-right:5px;"></span></label>
                                        <div class="input-group">
                                            <input class="form-control" id="username" type="text" name="username" placeholder="Username" required/>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Content Field -->
                                <div class="row">
                                    <div class="form-group col-xs-12">
                                        <label for="password"><span class="text-danger" style="margin-right:5px;"></span></label>
                                        <div class="input-group">
                                            <input class="form-control" id="password" type="password" name="password" placeholder="Password" required/>
                                        </div>
                                    </div>
                                </div>

                                <!-- Login Button -->
                                <div class="row">
                                    <div class="form-group col-xs-4">
                                        <button class="btn btn-primary" type="submit">Submit</button>
                                    </div>
                                </div>

                            </form>
                      </div>
                </div>
            </div>
        </div>
    </jsp:body>
</t:template>