<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Create a new suggestion</title>
    </head>
    <body>
        <div>
            <h1>Create suggestion</h1>
        </div>

        <div>
            <form action="create" method="post">
                <p>
                    <span>Place:</span>
                    <input placeholder="Restaurant name" name="place" type="text" required/>
                </p>

                <p>
                    <span>Description:</span>
                    <textarea placeholder="Menu/Location/Phone" name="description" required></textarea>
                </p>

                <p>
                    <input value="Create" name="create" type="submit"/>
                </p>
            </form>
        </div>
    </body>
</html>
