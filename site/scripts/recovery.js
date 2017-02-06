/**
 * Password Recovery JavaScript
 * Aley dafna site
 *
 * Copyright (c) 2016. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

$(function() {
	var dialog = new Dialog();
	var content = $('<div>');
	content.css('padding', 20);

	$('form.recovery').submit(function(event) {
		var form = $(this);
		var overlay = form.find('div.overlay');
		var fields = form.find('input');
		var data = {};

		// prevent default behavior
		event.preventDefault();

		// collect data
		fields
			.removeClass('invalid')
			.each(function(index) {
				var field = $(this);

				data[field.attr('name')] = field.val();
				if (field.data('required') && field.val() == '')
					field.addClass('invalid');
			});

		// passwords must match
		if (data.password != data.password_repeat)
			fields.find('input[name=password_repeat]').addClass('invalid');

		// there are invalid fields, don't submit
		if (fields.filter('.invalid').length > 0)
			return;

		// show overlay
		overlay
			.css({
				display: 'block',
				opacity: 0
			})
			.animate({opacity: 1}, 300);

		// send data
		new Communicator('backend')
				.on_success(function(data) {
					// show form again
					overlay.animate({opacity: 0}, 300, function() {
							$(this).css('display', 'none');
						});

					// prepare dialog
					dialog.set_title(language_handler.getText(null, 'recovery_dialog_title'));
					dialog.set_error(data.error);
					dialog.set_content(content);
					content.html(data.message);

					// reset data if user was created
					if (!data.error)
						dialog.setCloseCallback(function() {
							window.location.href = $('base').attr('href');
						});


					// show dialog
					dialog.open();
				})
				.on_error(function(xhr, status, error) {
					dialog.set_title(language_handler.getText(null, 'recovery_dialog_title'));
					dialog.set_error(true);
					dialog.set_content(content);
					content.html(error);

					dialog.open();
				})
				.send('password_recovery_save', data);

	})
	.find('input').focus(function(event) {
		$(this).removeClass('invalid');
	});
});
