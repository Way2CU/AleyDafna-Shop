/**
 * Backend JavaScript
 * Aley Dafna Flower Shop
 *
 * This script provides printing facilities in Caracal backend.
 *
 * Copyright (c) 2016. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

var Caracal = Caracal || new Object();


Caracal.PrintSupport = function() {
	var self = this;

	self.transaction_window = /shop_transaction_details_(\d+)/;
	self.handler = new Object();

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
		// preload language constants
		language_handler.getTextArrayAsync('aley_dafna', ['print_card'], function(){});

		// handle window events
		Caracal.window_system.events.connect(
				'window-content-load',
				self.handler.window_content_load
			);
	};

	/**
	 * Handle new backend window opening.
	 *
	 * @param object new_window
	 */
	self.handler.window_content_load = function(new_window) {
		// make sure we only work with transaction details
		var match = new_window.id.match(self.transaction_window);
		if (!match)
			return;

		// collect data
		var transaction_id = match[1];
		var button = $('<button>');
		var controls = new_window.container.find('div.button_bar');

		// configure and add button
		button
			.html(language_handler.getText('aley_dafna', 'print_card'))
			.data('transaction', transaction_id)
			.data('window', new_window)
			.on('click', self.handler.print_button_click)
			.prependTo(controls);
	};

	/**
	 * Handle clicking on print button.
	 *
	 * @param object event
	 */
	self.handler.print_button_click = function(event) {
		event.preventDefault();

		// get iframe or create new one
		var button = $(this);
		var current_window = button.data('window');
		var transaction_id = button.data('transaction');

		var iframe = current_window.container.find('iframe.print');
		if (iframe.length == 0)
			iframe = $('<iframe>')
				.addClass('print')
				.css('display', 'none')
				.appendTo(current_window.container)
				.on('load', function(event) {
					iframe[0].contentWindow.print();
				});

		// open location for print
		var base_url = $('base').attr('href');
		var params = {
				section: 'backend_module',
				action: 'transfer_control',
				module: 'aley_dafna',
				backend_action: 'print_cart',
				transaction: transaction_id,
				timestamp: Date.now().toString()
			};
		var print_url = base_url + '/' + $.param(params);
		iframe.attr('src', print_url);
	};

	// finalize object
	self._init();
}


$(function() {
	var print_support = new Caracal.PrintSupport();
});
