/**
 * Checkout JavaScript
 * Aley Dafna Flower Shop
 *
 * Copyright (c) 2016. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */
var Site = Site || {};


Site.CardSelection = function() {
	var self = this;

	self.text_input = null;
	self.container = null;
	self.slider = null;

	self.card_saved = false;
	self.cart_connected = false;

	self.handler = {};
	self.validator = {};
	self.cards = {
			regular: [0, 0, 100, 100],
			bow_tie: [100, 100, 100, 100]
		};
	self.default_position = [50, 50, 50, 50];

	/**
	 * Finalize object.
	 */
	self._init = function() {
		self.text_input = $('div#card_selection textarea');
		self.container = $('div#card_selection div.container');

		// create card selection user interface
		self.slider = new Caracal.Gallery.Slider(1);
		self.slider
			.controls.attach_next($('#div.card_text a.arrow.next'))
			.controls.attach_previous($('#div.card_text a.arrow.previous'))
			.images.set_container(self.container)
			.images.add(self.container.find('img'))
			.images.set_center(true);

		// connect validator
		$('div#card_selection').data('validator', self.validator.card_selection);

		// connect event for updating text input position
		self.container.find('a.arrow').on('click', self.handler.card_switch);

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
				top: coordinates[0],
				left: coordinates[1],
				bottom: coordinates[2],
				right: coordinates[3]
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
	var delivery_interface = $('div#checkout_container div.delivery_interface');
	var method = $('#checkout div.delivery_provider input[type="radio"]:checked');
	var field = $('div#checkout_container div.delivery_interface input[name=date]');
	var phone_number = $('div#checkout_container input[name=phone_number]');

	// make sure phone number is entered
	if (phone_number.val() == '') {
		phone_number.addClass('bad');
		return;

	} else {
		phone_number.removeClass('bad');
	}

	// function to be called upon sucessfully saving remark
	function save_date() {
		var data = {
				method: method.val(),
				type: field.data('value').split('T')[0]
			};

		new Communicator('shop')
			.on_success(function(data) {
					delivery_interface.removeClass('visible');
					Site.checkout_form.enable_checkout_button();
				})
			.get('json_set_delivery_method', data);
	}

	// save remark first
	var data = {
			append: 1,
			remark: phone_number.val()
		};

	new Communicator('shop')
			.on_success(save_date)
			.send('json_save_remark', data);
};

/**
 * Handle selecting date.
 *
 * @param object date
 */
Site.handle_date_select = function(date) {
	var field = $('div#checkout_container div.delivery_interface input[name=date]');
	var display_value = date.toLocaleDateString('he-IL');
	var value = date.toISOString();

	field
		.data('value', value)
		.val(display_value);
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

$(function() {
	Site.card_selector = new Site.CardSelection();
	if ($('#input_details').length > 0)
		Site.buyer_information_form.page_control.connect('page-flip', Site.handle_page_switch);
});
