perfilCardFocusOn = function(id){
    $(id).find('.container-img').css("background-size"," 115%");
};
perfilCardFocusOff = function (id){
    $(id).find('.container-img').css("background-size"," 100%");
};

$(document).ready( function () {
    jQuery.fn.extend ({
        frameworkPlaceCard: function () {
            $(this).each(function (index, element) {
                var idCard = "idPlaceCard" + index;
                var name    = $(element).attr('name');
                var data    = $(element).attr('data');
                var img   = $(element).attr('image');
                var phone   = $(element).attr('phone');
                var cardBody = ''+
                        '<div class="card-container" id="'+idCard+'"onmouseout="frameworkObject.perfilCardFocusOff(this);" onmouseover="frameworkObject.perfilCardFocusOn(this);">'+
                            '<div class="border-gray">'+
                                '<div class="container-img"></div>'+
                            '</div>'+
                            '<div class="containerinformation">'+
                                '<span class="card-name">'+name+'</span><br>'+
                                '<span class="card-data">'+data+'</span><br>'+
                                '<span class="card-phone">'+phone+'</span>'+
                            '</div>'+
                        '</div>';
                $(element).append(cardBody);
                if (img !== "") {
                    $('#'+idCard).find('.container-img').css('backgroundImage', 'url('+img+')');
                }
            }); 
        }
    });
});