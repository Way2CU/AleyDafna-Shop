/**
 * Item Filter JavaScript
 * Aley Dafna
 *
 * Copyright (c) 2016. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov, Tal Reznic
 */
var Site = Site || new Object();


/**
 * @param object parent_container_selector - CSS query selector for content section
 * @param object categories_selector       - CSS query selector for individual categories
 * @param object item                      - CSS query selector for item located inside of category
 * @triggers visibility-change
 */
Site.QuickFilter = function(parent_container_selector, categories_selector, item_selector) {
	var self = this;

	self.parent_container = $(parent_container_selector);
	self.categories = self.parent_container.find(categories_selector);
	self.checkbox_container = null;
	self.items_list = new Object();
	self.events = null;
	self.container = null;

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
		// create event handler
		self.events = new Caracal.EventSystem();
		self.events.register('visibility-change');

		// create checkboxes container
		self.checkbox_container = $('<div id="checkboxes">').appendTo(self.parent_container);

		// create container for unique list items
		self.container = $('<div id="unique">').appendTo(self.parent_container);

		// create checkbox element for all categories
		self.categories.each(function() {
			var category = $(this);
			var category_name = category.find('h2').text();
			var category_id = category.attr('id');

			if (category.find(item_selector).length > 0)
				self._create_checkbox(category_name, category_id);

			category.remove();
		});

		// create unique items list
		self.categories.find(item_selector).each(function() {
			var item = $(this);
			var uid = item.data('uid');
			var category_id = item.parent().attr('id');

			if (!(uid in self.items_list)) {
				// add item to unique list
				self.items_list[uid] = item;
				self.container.append(item);

				// create categories list
				var categories = new Array();
				item.data('categories', categories);

			} else {
				// get categories list from existing item
				var categories = self.items_list[uid].data('categories');
			}

			// append category to the list
			categories.push(category_id);
		});

		// create default checkbox element
		if (self.categories.length > 0)
			self._create_checkbox(
					language_handler.getText(null, 'default_checkbox_title'),
					true
				);
	}

	/**
	 * Create checkbox element.
	 *
	 * @param string name
	 * @param string id
	 */
	self._create_checkbox = function(category_name, id, checked) {
		// create radio button
		var input = $('<input>');
		input
			.attr('type', 'radio')
			.attr('name', 'sort')
			.attr('data-id', id)
			.on('change', self._handle_category_toggle);

		if (checked)
			input.attr('checked', 'checked');

		// create text container
		var span = $('<span>');
		span.text(category_name);

		// create label object
		var label = $('<label>');
		label
			.append(input)
			.append(span)
			.appendTo(self.checkbox_container);
	}

	/**
	 * Show filtered items.
	 */
	self._handle_category_toggle = function(event) {
		// prevent default radio button behavior
		event.preventDefault();

		var item = $(this).parent();
		var items = new Array();
		var category = $(this).data('id');

		// highlight current radio button
		self.checkbox_container.find('label').not(item).removeClass('active');
		item.addClass('active');

		// show all items
		if (category == undefined) {
			for (var uid in self.items_list) {
				var item = self.items_list[uid];
				item.removeClass('hidden');
				items.push(item);
			}

			// trigger event
			self.events.trigger('visibility-change', self.container[0], items);

			return;
		}

		// show and hide items accordingly
		for (var uid in self.items_list) {
			var item = self.items_list[uid];
			var item_categories = item.data('categories');

			// check item membership
			if (item_categories.indexOf(category.toString()) >= 0) {
				item.removeClass('hidden');
				items.push(item);

			} else {
				item.addClass('hidden');
			}
		}

		// trigger event
		self.events.trigger('visibility-change', self.container[0], items);
	}

	/**
	 * Get list of currently visible items.
	 *
	 * @return array
	 */
	self.get_visible_items = function() {
		var result = new Array();

		for (var uid in self.items_list) {
			var item = self.items_list[uid];
			if (!item.hasClass('hidden'))
				items.push(item);
		}
		
		return result;
	};

	/**
	 * Get DOM element.
	 *
	 * @return object
	 */
	self.get_container = function() {
		return self.container[0];
	};

	// finalize object
	self._init();
}
