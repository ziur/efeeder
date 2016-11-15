$(document).ready(function () {
    initChronometer();
});

function initChronometer() {
	$(".countdown").attr("data-date", $('#payment_time').val());
	$('.countdown').countdown({
		refresh: 1000,
		offset: 0,
		onEnd: function() {
			return;
		},
		render: function(date) {
			if (date.days !== 0) {
				this.el.innerHTML = date.days + " DAYS";
			} else {
				this.el.innerHTML = this.leadingZeros(date.hours) + ":" +
				this.leadingZeros(date.min) + "." +
				this.leadingZeros(date.sec);
				if (date.min <= 30 && date.hours === 0){
					$(".countdown").css('color', 'red');
				}
			}
		}
	});
}