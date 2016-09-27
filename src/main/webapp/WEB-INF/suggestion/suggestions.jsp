<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="t" tagdir="/WEB-INF/tags" %>

<t:template>
    <jsp:attribute name="javascript">
        <script>
            $(document).ready(function () {
                $('#suggestions').DataTable();
            });
            $(".see-buyer").click(function () {
                window.location.href = '/action/suggestions?id_food_meeting=' + $(this).data("meetingId");
            });
        </script>
    </jsp:attribute>

    <jsp:body>

        <div class="side-nav fixed left-nav-bar-prapper">

            <div class="place-toggle-container">
                <div class="add-new-place">
                    <label class="plus-icon">+</label>
                </div>
            </div>

            <div class="form-place-container">
                <form class="col s12">
                    <div class="input-field col s12">
                        <input id="id-place" type="text" class="validate">
                        <label for="id-place">Place:</label>
                    </div>
                    <div class="input-field col s12">
                        <input id="id-desc" type="text">
                        <label for="id-desc">Address:</label>
                    </div>
                    <div class="input-field col s12">
                        <input id="id-telf" type="tel">
                        <label for="id-telf">Telephone:</label>
                    </div>
                    <button id="save_id" class="btn waves-effect waves-light submit-place-button" type="submit">Save</button>
                </form>
            </div>


            <div class="places-container">

                <div class="card-place" 
                     name="Coffe Logitech" 
                     data="Address" 
                     image="https://image.freepik.com/free-icon/hot-coffee-rounded-cup-on-a-plate-from-side-view_318-54143.png" 
                     phone="Tef: 7775425425"></div>
            </div>
        </div>

        <script type="text/javascript">
            $(document).ready(function () {
                $.get("/action/getallplaces").done(function (result) {
                    $.each(result, function (i, obj) {
                        //use obj.id and obj.name here, for example:
                        console.log(obj);
                        //$('places-container').append(obj.frameworkPlaceCard());
                        
                        var card = $('<div>', {
                            class: 'card-place',
                            name: obj.name,
                            data: obj.direction,
                            phone: obj.phone,
                            image: obj.image_link
                        });
                        console.log(card);        
                        card.appendTo('.places-container');
                        
                    });
                    $('.card-place').frameworkPlaceCard();
                });
            });
            
            $(document).ready(function () {
               $("#save_id").click(function () {
                   var sendInfo = { "name": $("#id-place").valueOf(), "discription": $("#id-desc").valueOf(), "tefl": $("#id-telf").valueOf() };
                   
                   $.ajax( {
                      type: 'POST',
                      url: "/action/createplace",
                      dataType: 'json',
                      data: sendInfo
                   });
                           
               }); 
            });
        </script>              

    </jsp:body>
</t:template>