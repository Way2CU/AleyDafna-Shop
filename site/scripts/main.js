/**
 * Main JavaScript
 * Site Name
 *
 * Copyright (c) 2015. by Way2CU, http://way2cu.com
 * Authors:
 */

// create or use existing site scope
var Site = Site || {};

// make sure variable cache exists
Site.variable_cache = Site.variable_cache || {};


/**
 * Check if site is being displayed on mobile.
 * @return boolean
 */
Site.is_mobile = function() {
	var result = false;

	// check for cached value
	if ('mobile_version' in Site.variable_cache) {
		result = Site.variable_cache['mobile_version'];

	} else {
		// detect if site is mobile
		var elements = document.getElementsByName('viewport');

		// check all tags and find `meta`
		for (var i=0, count=elements.length; i<count; i++) {
			var tag = elements[i];

			if (tag.tagName == 'META') {
				result = true;
				break;
			}
		}

		// cache value so next time we are faster
		Site.variable_cache['mobile_version'] = result;
	}

	return result;
};

/* 
 *  Object for filtering shop items
 *  @param object container 
 *  @param object categories 
 *  @param object item
 */ 
function QuickFilter(container, categories, item) {
	var self = this;

	self.container = container;
	self.checkbox_container = null;
	self.categories = categories;
	self.item = item;
	self.items_list = {};

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
		//  create checkboxes container
		self.checkbox_container = $('<div id="checkboxes">');
		self.container.append(self.checkbox_container);

		//  create container for unique list items
		self.unique_list_container = $('<div id="unique">');
		self.container.append(self.unique_list_container);
		
		  //create unique items list
		var items = self.categories.find(self.item);
		items.each(function(index,value) {
			var item = $(this);
			var uid = item.data('uid');
			var category_id = item.parent().attr('id');

			if (!(uid in self.items_list)) {
				// add item to unique list
				self.items_list[uid] = item;
				self.unique_list_container.append(item);

				// create categories list
				var categories = new Array();
				item.data('categories', categories);

			} else {
				// get categories list from existing item
				var categories = self.items_list[uid].data('categories');
			}

			// appent category to the list
			categories.push(category_id);
		});


		//  create checkbox element for all categories
		self.categories.each(function(index) {
			var category = $(this);
			var category_name = self.categories.eq(index).find('h5').text();
			var category_id = self.categories.eq(index).attr('id');
			self._create_checkbox(category_name,category_id);
			category.remove();
		});

		//  create default checkbox element
		if(self.categories.length > 0)
		 	self._create_checkbox(language_handler.getText(null, 'default_checkbox_title'));
	 }

		/**
		* Create checkbox element
		* @param string name
		* @param number id
		*/
		self._create_checkbox = function(category_name, id) {
			// create label object
			var label = $('<label>');
			var input = $('<input type="radio" name="sort">');
			input
			    .attr('data-id',id);

			var span = $('<span>');
			span.text(category_name);
			label.append(input);
			label.append(span);

			//handler for input element
			input.on('change', self._handle_category_toggle);

			self.checkbox_container.prepend(label);
		}

		/**
		* Show filtered items
		* 
		*/
		self._handle_category_toggle = function() {
			var items = new Array();
			var category = $(this).data('id');

			// show all items
			if (category == undefined) {
				for (var uid in self.items_list) {
					self.items_list[uid].removeClass('hidden');
					items.push(item);
				}
				
				self._handle_container_height(items.length,self.items_list[uid].outerHeight());
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

			self._handle_container_height(items.length,item.outerHeight());
		}

		/**
		* Show unique list container min-height
		* @param int items_counter
		* @param int item_height
		*/
		self._handle_container_height = function(items_counter, item_height) {
			var num = Math.ceil(items_counter / 4);
			var container_height = num * 256 + 40;
			self.unique_list_container.css('height',container_height );
		}

	 // finalize object
	 self._init();
}

/**
 * Function called when document and images have been completely loaded.
 */
Site.on_load = function() {
	if (Site.is_mobile())
		Site.mobile_menu = new Caracal.MobileMenu();

	// Function displaying animation news
	Site.news = new NewsSystem("news_list", 1, 5000, 1000);

	// Function displaying Quickefilter object
	Site.filter = new QuickFilter($('section#category'),$('section.group '),$('a'));
};


// connect document `load` event with handler function
$(Site.on_load);
