/**
 * Checkout JavaScript
 * Aley Dafna Flower Shop
 *
 * Copyright (c) 2016. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */
var Site = Site || new Object();


Site.CardSelection = function() {
	var self = this;

	self.text_input = null;
	self.container = null;
	self.slider = null;

	self.card_saved = false;
	self.cart_connected = false;

	self.handler = new Object();
	self.validator = new Object();
	self.cards = {
			aley_dafna_1: [25, 10, 10, 10],
			aley_dafna_2: [40, 10, 20, 10],
			baloons_1:    [50, 10, 30, 10],
			baloons_2:    [60, 10, 10, 10],
			baloons_3:    [40, 10, 40, 10],
			green_edge_1: [30, 10, 30, 10],
			green_edge_2: [30, 10, 30, 10],
			green_wave:   [10, 10, 30, 10],
			happy_bday_1: [40, 10, 40, 10],
			happy_bday_2: [60, 10, 10, 10],
			happy_bday_3: [40, 10, 40, 10],
			heart_dust:   [10, 10, 40, 10],
			heart:        [40, 10, 40, 10],
			ornaments:    [40, 10, 10, 10]
		};
	self.default_position = [10, 10, 10, 10];

	/**
	 * Finalize object.
	 */
	self._init = function() {
		self.text_input = $('div#card_selection textarea');
		self.container = $('div#card_selection div.container');

		// create card selection user interface
		self.slider = new Caracal.Gallery.Slider(1);
		self.slider
			.controls.attach_next($('div#card_selection a.arrow.next_image'))
			.controls.attach_previous($('div#card_selection a.arrow.previous_image'))
			.images.set_container(self.container)
			.images.add(self.container.find('img'))
			.images.set_center(false);

		// connect validator
		$('div#card_selection').data('validator', self.validator.card_selection);

		// connect event for updating text input position
		$('div#card_selection a.arrow').on('click', self.handler.card_switch);

		// position input element initially
		self._update_input_position();
	};

	/**
	 * Update text input pusition based on currently selected card.
	 */
	self._update_input_position = function() {
		var current = self.container.find('img.visible').data('uid');

		// get input field position
		var coordinates = self.default_position;
		if (current in self.cards)
			coordinates = self.cards[current];

		// position input field
		self.text_input.css({
				top: coordinates[0] + '%',
				left: coordinates[1] + '%',
				bottom: coordinates[2] + '%',
				right: coordinates[3] + '%'
			});
	};

	/**
	 * Handle switching card design.
	 *
	 * @param object event
	 */
	self.handler.card_switch = function(event) {
		self._update_input_position();
	};

	/**
	 * Handle adding card to cart.
	 *
	 * @param object cart
	 * @param string uid
	 * @param string variation_id
	 * @param object properties
	 */
	self.handler.save_card = function(cart, uid, variation_id, properties) {
		if (uid in self.cards)
			self.card_saved = true;

		Site.buyer_information_form.page_control.nextPage();
	};

	/**
	 * Make sure if card text is entered that selection is right.
	 *
	 * @return boolean
	 */
	self.validator.card_selection = function(current_page) {
		var result = false;

		// make sure we have event connected
		if (!self.cart_connected) {
			Site.cart.events.connect('item-added', self.handler.save_card);
			self.cart_connected = true;
		}

		// decide if page should be switched
		if (self.text_input.val() != '' && !self.card_saved) {
			// save card
			var selected_card = self.container.find('img.visible').data('uid');
			var properties = {'text': self.text_input.val()};
			Site.cart.add_item_by_uid(selected_card, properties);

		} else {
			// if there's no text entered we assume user doesn't want card
			// or text was entered and card saved
			result = true;
		}

		return result;
	};

	// finalize object
	self._init();
};


/**
 * Save selected delivery date to server and enable checkout button.
 */
Site.save_delivery_date = function() {
	var delivery_interface = $('div#shipping_information div.container.interface');
	var summary = delivery_interface.find('div.summary span');
	var field = delivery_interface.find('input[name=date]');
	var calendar = delivery_interface.find('div.pika-single.aley_dafna');
	var method_name = Site.buyer_information_form.get_selected_delivery_method();
	var selected_city = Site.buyer_information_form.shipping.address_container.find('[name=city]').val();

	if (!field.data('value')) {
		calendar.addClass('bad');
		return;

	} else {
		calendar.removeClass('bad');
	}

	// function to be called upon sucessfully saving remark
	Site.buyer_information_form.set_delivery_method(method_name, field.data('value').split('T')[0]);

	// get delivery estimate from server
	if (method_name == 'delivery') {
		var data = {
				method: method_name,
				city: selected_city
			};

		new Communicator('shop')
			.on_success(function(data) {
				summary.html(data.shipping);
				delivery_interface.addClass('completed');
			})
			.get('json_get_delivery_estimate', data);

	} else if (method_name == 'pickup') {
		summary.html('0');
		delivery_interface.addClass('completed');
	}
};


/**
 * Handle selecting date.
 *
 * @param object date
 */
Site.handle_date_select = function(date) {
	var field = $('div#shipping_information div.container.interface input[name=date]');
	var calendar = field.next();
	var display_value = date.toLocaleDateString('he-IL');

	field
		.data('value', display_value)
		.val(display_value);

	calendar.removeClass('bad');
};

/**
 * Handle page control switching pages.
 *
 * @param object page_controls
 * @param integer current page
 * @param integer new_page
 * @return boolean
 */
Site.handle_page_switch = function(current_page, new_page) {
	if (current_page == 0 || new_page == 0) {
		var phone = $('#input_details input[name=guest_phone]');
		var phone_number = $('#input_details input[name=guest_phone1]');
		var cellphone_number = $('#input_details input[name=guest_phone2]');

		// store phone number
		if (current_page == 0)
			phone.val(phone_number.val() + ',' + cellphone_number.val());

		// restore phone number
		if (new_page == 0 && current_page > new_page) {
			var data = phone.val().split(',');
			phone_number.val(data[0]);
			cellphone_number.val(data[1]);
		}
	}

	if (current_page == 0 || new_page == 0) {
		var phone = $('#input_details input[name=new_phone_number]');
		var phone_number = $('#input_details input[name=new_phone_number1]');
		var cellphone_number = $('#input_details input[name=new_phone_number2]');

		// store phone number
		if (current_page == 0)
			phone.val(phone_number.val() + ',' + cellphone_number.val());

		// restore phone number
		if (new_page == 0 && current_page > new_page) {
			var data = phone.val().split(',');
			phone_number.val(data[0]);
			cellphone_number.val(data[1]);
		}
	}

	if (current_page == 1 || new_page == 1) {
		var phone = $('#input_details input[name=phone]');
		var phone_number = $('#input_details input[name=phone_number]');
		var cellphone_number = $('#input_details input[name=cellphone_number]');

		// store phone number
		if (current_page == 1)
			phone.val(phone_number.val() + ',' + cellphone_number.val());

		// restore phone number
		if (new_page == 1 && current_page > new_page) {
			var data = phone.val().split(',');
			phone_number.val(data[0]);
			cellphone_number.val(data[1]);
		}
	}

	return true;
};

/**
 * Save transaction data and cart contents for later use on thank you page for tracking.
 */
Site.save_transaction_data = function() {
	var data = new Object();
	var language = language_handler.current_language;

	var transaction_id = $('input[type=hidden][name=transaction_id]').val();
	var total_amount = $('input[type=hidden][name=sum]').val();

	// store transaction data
	data.actionField = {
			id: transaction_id,
			revenue: total_amount,
		};
	data.products = new Array();

	// store cart contents
	for (var index in Site.cart.items) {
		var item = Site.cart.items[index];
		var item_data = new Object();

		item_data.name = item.name[language];
		item_data.id = index;
		item_data.quantity = item.count;

		if (item.discount > 0)
			item_data.price = item.discount_price; else
			item_data.price = item.price;

		data.products.push(item_data);
	}

	// store data for later usage
	localStorage.setItem('transaction', JSON.stringify(data));
};

/**
 * Submit transaction data to Google Analytics.
 */
Site.push_transaction_data = function() {
	var data_string = localStorage.getItem('transaction');

	// push data if available
	if (data_string) {
		var data = JSON.parse(data_string);
		dataLayer.push({
			ecommerce: {purchase: data},
			event: 'purchase'
		});
	}

	// clear local storage
	localStorage.removeItem('transaction');
};


$(function() {
	Site.card_selector = new Site.CardSelection();

	// integrate multiple phone numbers by handling page switch
	// and storing them into single field
	if ($('#input_details').length > 0)
		Site.buyer_information_form.page_control.events.connect('page-flip', Site.handle_page_switch);

	// make sure we are the top level window because
	// Tranzila payment method is retarded as it gets and likes
	// to redirect inside of iframe, instead of outside
	if (window.top !== window.self)
		window.top.location.href = window.self.location.href;
});
