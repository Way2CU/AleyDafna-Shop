/**
 * Banner System JavaScript
 * Aley Dafna
 *
 * Copyright (c) 2016. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

var Site = Site || {};

Site.BannerSystem = function() {
	var self = this;

	self.handler = {};

	/**
	 * Object initialization function
	 */
	self._init = function() {
		// connect events
		if (Site.filter)
			Site.filter.connect(self.handler.item_visibility_change);

		// load links from the server
		self._load_links();
	};

	/**
	 * Load links from the server.
	 */
	self._load_links = function() {
		new Communicator('links')
			.on_success(self.handler.links_load)
			.on_error(self.handler.links_load_error)
			.get('json_links_list');
	};

	/**
	 * Place banners on page.
	 */
	self._position_banners = function() {
	};

	/**
	 * Handle event sent by the filter object when item visibility changes.
	 */
	self.handler.item_visibility_change = function() {
		self._position_banners();
	};

	/**
	 * Handle banner links load.
	 */
	self.handler.links_load = function(data) {
	};

	/**
	 * Handle communication or server error when loading banner links.
	 */
	self.handler.links_load_error = function() {
	};
	
	// finalize object
	self._init();
};
