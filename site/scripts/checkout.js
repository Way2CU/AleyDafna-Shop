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
		self.text_input = $('div#card_text textarea');
		self.card_selection = $('div#card_selection select');
		self.container = $('div#card_selection div.container');

		// create card selection user interface
		self.slider = new Caracal.Gallery.Slider(1);
		self.slider
			.controls.attach_next(self.container.find('a.arrow.next'))
			.controls.attach_previous(self.container.find('a.arrow.previous'))
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
		var current = self.container.find('img.active').data('uid');

		if (current in self.images) {
			var coordinates = self.images[current];
			self.text_input.css({
					top: coordinates[0],
					left: coordinates[1],
					width: coordinates[2],
					height: coordinates[3]
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
