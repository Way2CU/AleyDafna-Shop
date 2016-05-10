/**
 * Banner System JavaScript
 * Aley Dafna
 *
 * Copyright (c) 2016. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov
 */

var Site = Site || new Object()


Site.BannerSystem = function() {
	var self = this;

	self.show_interval = 8;
	self.links = new Array();
	self.handler = new Object()

	/**
	 * Object initialization function
	 */
	self._init = function() {
		// connect events
		if (Site.filter)
			Site.filter.events.connect('visibility-change', self.handler.item_visibility_change);

		// load links from the server
		self._load_links();
	};

	/**
	 * Load links from the server.
	 */
	self._load_links = function() {
		var data = {
				'group': 'banners'
			};

		new Communicator('links')
			.on_success(self.handler.links_load)
			.on_error(self.handler.links_load_error)
			.get('json_link_list', data);
	};

	/**
	 * Place banners on page.
	 */
	self._position_banners = function() {
		if (self.links.length == 0)
			return;

		// place links in DOM tree
		for (var i=0, count=self.links.length; i<count; i++) {
			var link = self.links[i];
			var position = i * self.show_interval - i;


		}
	};

	/**
	 * Handle event sent by the filter object when item visibility changes.
	 */
	self.handler.item_visibility_change = function(visible_items) {
		self._position_banners(visible_items);
	};

	/**
	 * Handle banner links load.
	 */
	self.handler.links_load = function(data) {
		if (data.error)
			return;

		// create banners from link data
		for (var index in data.items) {
			var link_data = data.items[index];
			var link = document.createElement('a');
			var image = document.createElement('img');

			// configure image
			image.setAttribute('src', link_data.image);
			image.setAttribute('alt', link_data.text[language_handler.current_language]);
			image.setAttribute('width', 582);
			image.setAttribute('height', 282);

			// configure link
			link.setAttribute('href', link_data.redirect_url);
			link.appendChild(image);

			// add link to the list
			self.links.push(link);
		}

		// position links
		self._position_banners();
	};

	/**
	 * Handle communication or server error when loading banner links.
	 */
	self.handler.links_load_error = function() {
		self.links = new Array();
	};

	// finalize object
	self._init();
};


$(function() {
	Site.banner_system = new Site.BannerSystem();
});
