<%@tag description="Page template" pageEncoding="UTF-8" %>
<%@taglib prefix="t" tagdir="/WEB-INF/tags" %>
<%@attribute name="javascript" fragment="true" %>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="icon" href="favicon.ico">

    <title>Efeeder</title>

    <link href="/assets/css/select2.min.css" rel="stylesheet">
    <link href="/assets/css/app.css" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/materialize.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  </head>

  <body>

    <t:header/>

    <div class="container">
      <jsp:doBody/>
    </div>

    <t:footer/>

    <script src="/assets/js/jquery.js"></script>
    <script src="/assets/js/bootstrap.js"></script>
    <script src="/assets/js/datatables.min.js"></script>
    <script src="/assets/js/lodash.js"></script>
    <script src="/assets/js/select2.js"></script>
    <script src="/assets/js/jsrender.js"></script>
    <script src="/assets/js/materialize.js"></script>

    <jsp:invoke fragment="javascript"/>

  </body>
</html>
