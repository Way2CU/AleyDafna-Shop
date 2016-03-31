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

	self.use_card = false;

	self.handler = {};
	self.validator = {};

	/**
	 * Finalize object.
	 */
	self._init = function() {
		self.text_input = $('div#card_text textarea');
		self.card_selection = $('div#card_selection select');
		self.container = $('div#card_selection div.container');
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
	 * Handle changing card design selection.
	 *
	 * @param object event
	 */
	self.handler.card_selection_change = function(event) {
	};

	/**
	 * Make sure if card text is entered that selection is right.
	 * @return boolean
	 */
	self.validator.card_selection = function() {
		var result = false;

		if (self.use_card) {
			// check if card design is selected
			result = self.card_selection.find('option:selected').length > 0;

		} else {
			// if there's no text entered we assume user doesn't want card
			result = true;
		}

		return result;
	};

	// finalize object
	self._init();
};
