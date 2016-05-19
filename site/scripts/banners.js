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
		// load links from the server
		self._load_links();
	};

	/**
	 * Load links from the server.
	 */
	self._load_links = function() {
		var data = {
				'group': 'banners_' + language_handler.current_language
			};

		// attach extra category to select from
		var title = document.querySelector('section#category > h2');
		if (title.dataset.id)
			data.group += ',' + title.dataset.id;

		// get links
		new Communicator('links')
			.on_success(self.handler.links_load)
			.on_error(self.handler.links_load_error)
			.get('json_link_list', data);
	};

	/**
	 * Handle event sent by the filter object when item visibility changes.
	 *
	 * @param object container
	 * @param array visible_items
	 */
	self.handler.item_visibility_change = function(container, visible_items) {
		if (self.links.length == 0)
			return;

		// place links in DOM tree
		var position = 0;
		for (var to_display = self.links.slice(0); to_display.length > 0;) {
			var index = Math.floor(Math.random() * to_display.length - 1);
			var link = to_display.splice(index, 1)[0];
			var final_position = position++ * self.show_interval;

			if (final_position >= visible_items.length) {
				// remove excess links
				link.remove();

			} else {
				// insert/reposition link
				container.insertBefore(link, visible_items[final_position][0]);
			}
		}
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
			link.classList.add('banner');
			if (link_data.url == '' || link_data.url == '#')
				link.setAttribute('href', 'javascript: void(0)'); else
				link.setAttribute('href', link_data.redirect_url);
			link.appendChild(image);

			// add link to the list
			self.links.push(link);
		}

		// connect events
		if (Object.keys(Site.filter.items_list).length > 0) {
			// items exist in filter, use filter to show banners
			Site.filter.events.connect(
					'visibility-change',
					self.handler.item_visibility_change
				);

			// initially apply banners
			self.handler.item_visibility_change(
					Site.filter.get_container(),
					Site.filter.get_visible_items()
				);

		} else {
			// no subcategories were found by the filter use available items
			var container = document.querySelector('section#category');
			var items = container.querySelectorAll('a.link');

			// initially apply banners
			self.handler.item_visibility_change(container, items);
		}
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
