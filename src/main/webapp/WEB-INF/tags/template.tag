<%@tag description="Page template" pageEncoding="UTF-8" %>
<%@taglib prefix="t" tagdir="/WEB-INF/tags" %>
<%@attribute name="javascript" fragment="true" %>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="favicon.ico">

    <title>Efeeder</title>

    <link href="/assets/css/bootstrap.css" rel="stylesheet">
    <link href="/assets/css/datatables.min.css" rel="stylesheet">
    <link href="/assets/css/select2.min.css" rel="stylesheet">
    <link href="/assets/css/app.css" rel="stylesheet">
    <link href="/assets/css/form.css" rel="stylesheet">
</head>

<body>

<t:header/>

<div class="container-fluid">
    <div class="row">
        <div class="col-sm-3 col-md-2 sidebar">
            <t:navigation/>
        </div>
        <div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
            <jsp:doBody/>
        </div>
    </div>
</div>

<script src="/assets/js/jquery.js"></script>
<script src="/assets/js/bootstrap.js"></script>
<script src="/assets/js/datatables.min.js"></script>
<script src="/assets/js/editable-table.js"></script>
<script src="/assets/js/lodash.js"></script>
<script src="/assets/js/select2.js"></script>
<script src="/assets/js/jsrender.js"></script>

<jsp:invoke fragment="javascript"/>

</body>
</html>
