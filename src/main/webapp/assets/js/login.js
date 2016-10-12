$(document).ready(function () {
	var login = new Login($('#login-form'));
	login.init();
});

var Login = function(form) {
	this.form = form;
	var selft = this;

	var addEventClick= function () {
		selft.form.submit(function (event) {
			login(event);
		})
	};

	var login = function(event) {
		event.preventDefault();

		var username = selft.form.find( "input[name='username']" ).val();
		var password = selft.form.find( "input[name='password']" ).val();

		var url = selft.form.attr( "action" );

		// Send the data using post
		var posting = $.post( url, {username: username, password: password} );

		// Put the results in a div
		posting.done(function( data ) {
			location.href = "/action/foodMeeting"; 
		});
	};

	return {
		init: function(){
			addEventClick();
		},
	};
};