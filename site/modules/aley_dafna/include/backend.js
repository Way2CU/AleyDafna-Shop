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

		// open location for print
		var base_url = $('meta[property=base-url]').attr('content');
		var params = {
				section: 'backend_module',
				action: 'transfer_control',
				module: 'aley_dafna',
				backend_action: 'print_card',
				transaction: transaction_id,
				timestamp: Date.now().toString()
			};
		var print_url = base_url + '/?' + $.param(params);
		window.open(print_url, '_blank');
	};

	// finalize object
	self._init();
}


Caracal.add_property_row = function(property_id, data, container) {
	// add two phone numbers by default
	var row = $('<div>');
	row
		.addClass('list_item')
		.appendTo(container);

	// create data field
	var data_field = $('<input>');
	data_field
		.attr('type', 'hidden')
		.attr('name', 'property_data_' + property_id)
		.val(JSON.stringify(data))
		.appendTo(row);

	// create columns
	var column_name = $('<span class="column">');
	var column_type = $('<span class="column">');
	var column_options = $('<span class="column">');

	column_name
		.html(data.name[language_handler.current_language])
		.attr('style', 'width: 250px')
		.appendTo(row);

	column_type
		.html(data.type)
		.attr('style', 'width: 60px')
		.appendTo(row);

	column_options.appendTo(row);

	// create options
	var option_remove = $('<a>');
	var option_change = $('<a>');
	var space = document.createTextNode(' ');

	option_change
		.on('click', Caracal.Shop.edit_property)
		.appendTo(column_options);

	column_options.append(space);

	option_remove
		.on('click', Caracal.Shop.delete_property)
		.appendTo(column_options);

	// load language constants for options
	language_handler.getTextArrayAsync(null, ['delete', 'change'], function(data) {
			option_remove.html(data['delete']);
			option_change.html(data['change']);
		});
};


Caracal.handle_shop_window_open = function(shop_window) {
	// make sure we are working with the right window
	if (shop_window.id != 'shop_item_add')
		return true;

	// data to add
	var data_medium = {
			text_id: 'price_medium',
			name: {
				'he': 'מרשים',
				'en': 'Medium'
				},
			type: 'decimal',
			value: '0.0'
		};
	var data_big = {
			text_id: 'price_big',
			name: {
				'he': 'מדהים',
				'en': 'Big'
				},
			type: 'decimal',
			value: '0.0'
		};

	// get container
	var container = shop_window.container.find('div#item_properties.list_content');

	// add two phone numbers
	data2 = data;
	Caracal.add_property_row(1, data_medium, container);
	Caracal.add_property_row(2, data_big, container);
};


$(function() {
	var print_support = new Caracal.PrintSupport();
	Caracal.window_system.events.connect('window-content-load', Caracal.handle_shop_window_open);
});
