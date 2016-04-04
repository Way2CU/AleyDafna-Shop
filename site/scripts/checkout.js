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
	self.card_selection = null;
	self.container = null;
	self.slider = null;

	self.use_card = false;

	self.handler = {};
	self.validator = {};
	self.cards = {
			regular: [0, 0, 100, 100],
			bow_tie: [100, 100, 100, 100]
		};

	/**
	 * Finalize object.
	 */
	self._init = function() {
		self.text_input = $('div#card_selection textarea');
		self.card_selection = $('div#card_selection select');
		self.container = $('div#card_selection div.container');

		// create card selection user interface
		self.slider = new Caracal.Gallery.Slider(1);
		self.slider
			.controls.attach_next($('#div.card_text a.arrow.next'))
			.controls.attach_previous($('#div.card_text a.arrow.previous'))
			.images.set_container(self.container)
			.images.add(self.container.find('img'))
			.images.set_center(true);

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

		if (current in self.cards) {
			var coordinates = self.cards[current];
			self.text_input.css({
					top: coordinates[0],
					left: coordinates[1],
					bottom: coordinates[2],
					right: coordinates[3]
				});
		}
	};

	/**
	 * Handle loosing focus on card text entry.
	 *
	 * @param object event
	 */
	self.handler.card_text_leave = function(event) {
		self.use_card = self.text_input.val() != '';
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
	 * Make sure if card text is entered that selection is right.
	 *
	 * @return boolean
	 */
	self.validator.card_selection = function() {
		var result = false;

		if (self.use_card) {
			// check if card design is selected
			var selected = self.card_selection.find('option:selected');
			result = selected.length > 0;

			if (result) {
				var properties = {'text': self.text_input.val()};
				Site.cart.add_item_by_uid(selected.data('uid'), properties);
			}

		} else {
			// if there's no text entered we assume user doesn't want card
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

$(function() {
	Site.card_selector = new Site.CardSelection();
});
