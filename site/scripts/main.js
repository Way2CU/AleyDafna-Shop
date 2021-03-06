/**
 * Main JavaScript
 * Aley Dafna Flower Shop
 *
 * Copyright (c) 2016. by Way2CU, http://way2cu.com
 * Authors: Mladen Mijatov, Tal Reznik
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


/**
 * Dialog system for logging in and out and as well as registering
 * new accounts on the system.
 */
Site.DialogSystem = function() {
	var self = this;

	self.message = {};
	self.sign_up = {};
	self.login = {};
	self.recovery = {};

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
		// create error reporting dialog
		self.message.content = $('<div>');
		self.message.dialog = new Caracal.Dialog();
		self.message.dialog
				.set_size(Site.is_mobile() ? 300 : 400, 'auto')
				.set_content(self.message.content)
				.add_class('login');

		// create sign up dialog
		self.sign_up.dialog = new Caracal.Dialog();
		self.sign_up.dialog
				.set_size(Site.is_mobile() ? 300 : 400, 'auto')
				.add_class('login sign-up');

		self.sign_up.content = $('<form>');
		self.sign_up.message = $('<p>');

		self.sign_up.label_first_name = $('<label>');
		self.sign_up.input_first_name = $('<input>');

		self.sign_up.label_last_name = $('<label>');
		self.sign_up.input_last_name = $('<input>');

		self.sign_up.label_username = $('<label>');
		self.sign_up.input_username = $('<input>');

		self.sign_up.label_password = $('<label>');
		self.sign_up.input_password = $('<input>');

		self.sign_up.label_repeat_password = $('<label>');
		self.sign_up.input_repeat_password = $('<input>');

		self.sign_up.label_terms_agree = $('<label>');
		self.sign_up.input_terms_agree = $('<input>');
		self.sign_up.span_terms_agree = $('<span>');

		// configure elements
		self.sign_up.input_first_name
				.attr('name', 'first_name')
				.attr('type', 'text')
				.attr('maxlength', 100)
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleSignUpKeyPress);

		self.sign_up.input_last_name
				.attr('name', 'last_name')
				.attr('type', 'text')
				.attr('maxlength', 100)
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleSignUpKeyPress);

		self.sign_up.input_username
				.attr('name', 'username')
				.attr('type', 'email')
				.attr('maxlength', 50)
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleSignUpKeyPress);

		self.sign_up.input_password
				.attr('name', 'password')
				.attr('type', 'password')
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleSignUpKeyPress);

		self.sign_up.input_repeat_password
				.attr('name', 'repeat_password')
				.attr('type', 'password')
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleSignUpKeyPress);

		self.sign_up.input_terms_agree
				.attr('name', 'agreed')
				.attr('type', 'checkbox')
				.on('click', self._handleAgreeClick);

		// pack sign up dialog
		self.sign_up.message.appendTo(self.sign_up.content);

		self.sign_up.label_first_name
				.addClass('inline')
				.append(self.sign_up.input_first_name)
				.appendTo(self.sign_up.content);

		self.sign_up.label_last_name
				.addClass('inline')
				.append(self.sign_up.input_last_name)
				.appendTo(self.sign_up.content);

		self.sign_up.label_username
				.append(self.sign_up.input_username)
				.appendTo(self.sign_up.content);

		self.sign_up.content.append('<hr>');

		self.sign_up.label_password
				.append(self.sign_up.input_password)
				.appendTo(self.sign_up.content);

		self.sign_up.label_repeat_password
				.append(self.sign_up.input_repeat_password)
				.appendTo(self.sign_up.content);

		self.sign_up.content.append('<hr>');

		self.sign_up.label_terms_agree
				.append(self.sign_up.input_terms_agree)
				.append(self.sign_up.span_terms_agree)
				.appendTo(self.sign_up.content);

		self.sign_up.dialog.set_content(self.sign_up.content);

		// create sign up button
		self.sign_up.signup_button = $('<a>');
		self.sign_up.signup_button
				.attr('href', 'javascript:void(0);')
				.click(self._handleSignUpClick);
		self.sign_up.dialog.add_control(self.sign_up.signup_button);

		// prepare dialog
		self.login.dialog = new Caracal.Dialog();
		self.login.dialog
				.set_size(Site.is_mobile() ? 300 : 400, 'auto')
				.add_class('login');

		// create login button
		self.login.login_button = $('<a>');
		self.login.login_button
				.attr('href', 'javascript:void(0);')
				.click(self._handleLoginClick);
		self.login.dialog.add_control(self.login.login_button);

		// create login dialog content
		self.login.content = $('<form>');
		self.login.captcha_container = $('<div>');
		self.login.message = $('<p>');

		self.login.label_username = $('<label>');
		self.login.input_username = $('<input>');

		self.login.label_password = $('<label>');
		self.login.input_password = $('<input>');

		self.login.link_recovery = $('<a>');

		self.login.label_captcha = $('<label>');
		self.login.input_captcha = $('<input>');
		self.login.image_captcha = $('<img>');

		self.login.label_remember_me = $('<label>');
		self.login.input_remember_me = $('<input>');
		self.login.span_remember_me = $('<span>');

		// configure elements
		self.login.input_username
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleLoginKeyPress)
				.attr('name', 'email')
				.attr('type', 'email');

		self.login.input_password
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleLoginKeyPress)
				.attr('name', 'password')
				.attr('type', 'password');

		self.login.input_remember_me
				.attr('name', 'lasting')
				.attr('type', 'checkbox');

		self.login.link_recovery
				.click(self._showRecoveryDialog)
				.attr('href', 'javascript: void(0)');

		self.login.content
				.attr('action', '/')
				.attr('method', 'post');

		// load username if previously stored
		var cached_username = localStorage.getItem('username');
		if (cached_username)
			self.login.input_username.val(cached_username);

		// pack elements
		self.login.content.append(self.login.message);
		self.login.label_username
				.append(self.login.input_username)
				.appendTo(self.login.content);

		self.login.label_password
				.append(self.login.input_password)
				.appendTo(self.login.content);

		self.login.label_captcha
				.append(self.login.input_captcha)
				.append(self.login.image_captcha)
				.appendTo(self.login.captcha_container);

		self.login.label_remember_me
				.append(self.login.input_remember_me)
				.append(self.login.span_remember_me)
				.appendTo(self.login.content);

		self.login.captcha_container
				.addClass('captcha')
				.hide()
				.appendTo(self.login.content);

		self.login.content.append(self.login.link_recovery);
		self.login.dialog.set_content(self.login.content);

		// prepare recovery dialog
		self.recovery.dialog = new Caracal.Dialog();
		self.recovery.dialog
				.set_size(Site.is_mobile() ? 300 : 400, 'auto')
				.add_class('login recovery');

		// create recover button
		self.recovery.recover_button = $('<a>');
		self.recovery.recover_button
				.attr('href', 'javascript: void(0);')
				.click(self._handleRecoverClick);

		self.recovery.dialog.add_control(self.recovery.recover_button);

		// create recovery dialog content
		self.recovery.content = $('<div>');
		self.recovery.captcha_container = $('<div>');
		self.recovery.message = $('<p>');

		self.recovery.label_email = $('<label>');
		self.recovery.input_email = $('<input>');

		self.recovery.label_captcha = $('<label>');
		self.recovery.input_captcha = $('<input>');
		self.recovery.image_captcha = $('<img>');

		self.recovery.input_email
				.attr('name', 'email')
				.attr('type', 'text')
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleRecoveryKeyPress);

		// prepare captcha image
		var base = $('meta[property=base-url]').attr('content');

		self.recovery.input_captcha
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleRecoveryKeyPress)
				.addClass('ltr')
				.attr('maxlength', 4);

		self.login.input_captcha
				.on('focusin', self._handleFocusIn)
				.on('keyup', self._handleLoginKeyPress)
				.addClass('ltr')
				.attr('maxlength', 4);

		self.recovery.image_captcha
				.click(self._handleCaptchaClick)
				.attr('data-src', base + '?section=captcha&action=print_image');
		self.login.image_captcha
				.click(self._handleCaptchaClick)
				.attr('data-src', base + '?section=captcha&action=print_image');

		// pack elements
		self.recovery.content.append(self.recovery.message);
		self.recovery.label_email
				.append(self.recovery.input_email)
				.appendTo(self.recovery.content);

		self.recovery.label_captcha
				.append(self.recovery.input_captcha)
				.append(self.recovery.image_captcha)
				.appendTo(self.recovery.captcha_container);

		self.recovery.captcha_container
				.addClass('captcha')
				.appendTo(self.recovery.content);
		self.recovery.dialog.set_content(self.recovery.content);

		// bulk load language constants
		var constants = [
				'login', 'login_dialog_title', 'login_dialog_message', 'label_email', 'label_password',
				'label_password_recovery', 'recovery_dialog_title', 'recovery_dialog_message', 'submit',
				'label_captcha', 'captcha_message', 'signup_dialog_title', 'sign_up', 'signup_dialog_message',
				'label_repeat_password', 'label_first_name', 'label_last_name', 'label_agree_to_terms',
				'label_remember_me'
			];
		language_handler.getTextArrayAsync(null, constants, self._handleStringsLoaded);

		// connect events
		$('a.login').click(self._showLoginDialog);
		$('a.logout').click(self._handleLogout);
		$('a.sign-up').click(self._showSignUpDialog);
		$('form.sign-up input').on('focusin', self._handleFocusIn);
	}

	/**
	 * Remove invalid class on focus in.
	 *
	 * @param object event
	 */
	self._handleFocusIn = function(event) {
		$(this).removeClass('invalid');
	};

	/**
	 * Handle pressing key on input fields in login dialog.
	 *
	 * @param object event
	 */
	self._handleLoginKeyPress = function(event) {
		var key_value = event.keyCode;

		switch (key_value) {
			case 13:  // enter
				self.login.login_button.trigger('click');
				event.preventDefault();
				break;

			case 27:
				self.login.dialog.close();
				event.preventDefault();
				break;
		}
	};

	/**
	 * Handle pressing key on input fields in recovery dialog.
	 *
	 * @param object event
	 */
	self._handleRecoveryKeyPress = function(event) {
		var key_value = event.keyCode;

		switch (key_value) {
			case 13:  // enter
				self.recovery.recover_button.trigger('click');
				event.preventDefault();
				break;

			case 27:
				self.recovery.dialog.close();
				event.preventDefault();
				break;
		}
	};

	/**
	 * Handle pressing key on input fields in login dialog.
	 *
	 * @param object event
	 */
	self._handleSignUpKeyPress = function(event) {
		var key_value = event.keyCode;

		switch (key_value) {
			case 13:  // enter
				self.sign_up.signup_button.trigger('click');
				event.preventDefault();
				break;

			case 27:
				self.sign_up.dialog.close();
				event.preventDefault();
				break;
		}
	};

	/**
	 * Handle clicking on agree to terms.
	 *
	 * @param object event
	 */
	self._handleAgreeClick = function(event) {
		var item = $(this);
		item.removeClass('invalid');
	};

	/**
	 * Handle loading language constants from server.
	 *
	 * @param object data
	 */
	self._handleStringsLoaded = function(data) {
		with (self.login) {
			dialog.set_title(data['login_dialog_title']);
			message.html(data['login_dialog_message']);
			login_button.html(data['login']);

			input_username.attr('placeholder', data['label_email']);
			input_password.attr('placeholder', data['label_password']);
			input_captcha.attr('placeholder', data['label_captcha']);
			link_recovery.html(data['label_password_recovery']);
			image_captcha.attr('title', data['captcha_message']);
			span_remember_me.html(data['label_remember_me']);
		}

		with (self.recovery) {
			dialog.set_title(data['recovery_dialog_title']);
			message.html(data['recovery_dialog_message']);
			recover_button.html(data['submit']);

			input_email.attr('placeholder', data['label_email']);
			input_captcha.attr('placeholder', data['label_captcha']);
			image_captcha.attr('title', data['captcha_message']);
		}

		with (self.sign_up) {
			dialog.set_title(data['signup_dialog_title']);
			message.html(data['signup_dialog_message']);
			signup_button.html(data['sign_up']);

			input_first_name.attr('placeholder', data['label_first_name']);
			input_last_name.attr('placeholder', data['label_last_name']);
			input_username.attr('placeholder', data['label_email']);
			input_password.attr('placeholder', data['label_password']);
			input_repeat_password.attr('placeholder', data['label_repeat_password']);
			span_terms_agree.html(data['label_agree_to_terms']);
		}
	};

	/**
	 * Logout user and navigate to linked page.
	 *
	 * @param object event
	 */
	self._handleLogout = function(event) {
		event.preventDefault();

		// perform logout
		new Communicator('backend')
				.on_success(function(data) {
					if (!data.error)
						window.location.reload();
				})
				.get('json_logout');
	};

	/**
	 * Handle clicking on login link.
	 *
	 * @param object event
	 */
	self._showLoginDialog = function(event) {
		// prevent default link behavior
		event.preventDefault();

		// show dialog
		self.login.dialog.open();

		// focus username
		setTimeout(function() {
			self.login.input_username[0].focus();
		}, 100);
	};

	/**
	 * Show password recovery dialog.
	 *
	 * @param object event
	 */
	self._showRecoveryDialog = function(event) {
		// prevent default link behavior
		event.preventDefault();

		self.recovery.dialog.open();

		// focus username
		setTimeout(function() {
			self.login.image_captcha.attr('src', self.login.image_captcha.attr('data-src'));
			self.recovery.input_email[0].focus();
		}, 100);
	};

	/**
	 * Show sign up dialog when user clicks on get started link.
	 *
	 * @param object event
	 */
	self._showSignUpDialog = function(event) {
		// prevent default link behavior
		event.preventDefault();

		// show dialog
		self.sign_up.dialog.open();

		// focus username
		setTimeout(function() {
			self.sign_up.input_username[0].focus();
		}, 100);
	};

	/**
	 * Reload captcha image.
	 */
	self._handleCaptchaClick = function(event) {
		event.preventDefault();

		var base = $('meta[property=base-url]').attr('content');
		var url = base + '?section=captcha&action=print_image&' + Date.now();

		self.recovery.image_captcha.attr('src', url);
		self.login.image_captcha.attr('src', url);
	};

	/**
	 * Handle clicking on sign up button in dialog.
	 *
	 * @param object event
	 */
	self._handleSignUpClick = function(event) {
		// prevent form from submitting
		event.preventDefault();

		// check if all the fields are valid
		if (self.sign_up.input_first_name.val() == '')
			self.sign_up.input_first_name.addClass('invalid');

		if (self.sign_up.input_last_name.val() == '')
			self.sign_up.input_last_name.addClass('invalid');

		if (self.sign_up.input_username.val() == '')
			self.sign_up.input_username.addClass('invalid');

		if (self.sign_up.input_password.val() == '')
			self.sign_up.input_password.addClass('invalid');

		if (self.sign_up.input_password.val() != self.sign_up.input_repeat_password.val()) {
			self.sign_up.input_password.addClass('invalid');
			self.sign_up.input_repeat_password.addClass('invalid');
		}

		if (!self.sign_up.input_terms_agree.is(':checked'))
			self.sign_up.input_terms_agree.addClass('invalid');

		// cache objects
		var fields = self.sign_up.content.find('input');

		// collect data
		var data = {};
		fields.each(function(index) {
			var field = $(this);
			var name = field.attr('name');

			if (field.attr('type') != 'checkbox')
				data[name] = field.val(); else
				data[name] = field.is(':checked') ? 1 : 0;
		});

		// submit data
		if (fields.filter('.invalid').length == 0)
			self._performSignUp(data);
	};

	/**
	 * Perform sign up process with specified data.
	 *
	 * @param object data
	 */
	self._performSignUp = function(data) {
		// make sure user agrees
		if (data.agreed != 1)
			return;

		// fill in remaining data
		data.email = data.username;
		data.show_result = 1;

		// create new user and redirect
		new Communicator('backend')
				.on_success(self._handleSignupSuccess)
				.on_error(self._handleSignupError)
				.send('save_unpriviledged_user', data);
	};

	/**
	 * Handle successful submission of sign up data.
	 *
	 * @param object data
	 */
	self._handleSignupSuccess = function(data) {
		if (!data.error) {
			// successfully created new user account, reload
			self.message.dialog
					.set_error(false)
					.set_title(language_handler.getText(null, 'signup_dialog_title'));
			self.message.content.html(language_handler.getText(null, 'signup_completed_message'));
			self.message.dialog.open();

		} else {
			// there was a problem creating new user
			self.message.dialog
					.set_error(true)
					.set_title(language_handler.getText(null, 'signup_dialog_title'));
			self.message.content.html(data.message);
			self.message.dialog.open();
		}
	};

	/**
	 * Handle communication error during sign up process.
	 *
	 * @param object xhr
	 * @param string status_code
	 * @param string description
	 */
	self._handleSignupError = function(xhr, status_code, description) {
		// show error message
		self.message.dialog
				.set_error(true)
				.set_title(language_handler.getText(null, 'signup_dialog_title'));
		self.message.content.html(description);
		self.message.dialog.open();
	};

	/**
	 * Handle clicking on login button in dialog.
	 *
	 * @param object event
	 */
	self._handleLoginClick = function(event) {
		// prevent default control behavior
		event.preventDefault();

		// prepare data
		var data = {
				username: self.login.input_username.val(),
				password: self.login.input_password.val(),
				captcha: self.login.input_captcha.val()
			};

		// create communicator
		new Communicator('backend')
				.on_success(self._handleLoginSuccess)
				.on_error(self._handleLoginError)
				.get('json_login', data);
	};

	/**
	 * Handle successful login response.
	 *
	 * @param object data
	 */
	self._handleLoginSuccess = function(data) {
		if (data.logged_in) {
			// store username for next time
			var username = self.login.input_username.val();
			localStorage.setItem('username', username);

			// reload page on successful login
			window.location.reload();

			self.message.content.html(language_handler.getText(null, 'login_successful'));
			self.message.dialog
					.set_error(false)
					.set_title(language_handler.getText(null, 'signup_dialog_title'))
					.setCloseCallback(function() {
						window.location.reload();
						this.clearCloseCallback();
					});
			self.message.dialog.open();

		} else {
			// show error message
			self.message.dialog
					.set_error(true)
					.set_title(language_handler.getText(null, 'login_dialog_title'));
			self.message.content.html(data.message);
			self.message.dialog.open();

			// show captcha if required
			if (data.show_captcha) {
				self.login.image_captcha.attr('src', self.login.image_captcha.attr('data-src'));
				self.login.captcha_container.slideDown();

			} else {
				self.login.captcha_container.slideUp();
			}
		}
	};

	/**
	 * Handle communication error.
	 *
	 * @param object xhr
	 * @param string transfer_status
	 * @param string description
	 */
	self._handleLoginError = function(xhr, transfer_status, description) {
		// show error dialog
		self.message.dialog
				.set_error(true)
				.set_title(language_handler.getText(null, 'login_dialog_title'));
		self.message.content.html(description);
		self.message.dialog.open();
	};

	/**
	 * Handle clicking on recover button in dialog.
	 *
	 * @param object event
	 */
	self._handleRecoverClick = function(event) {
		// prevent default control behavior
		event.preventDefault();

		// prepare data
		var data = {
				username: self.recovery.input_email.val(),
				email: self.recovery.input_email.val(),
				captcha: self.recovery.input_captcha.val()
			};

		// create communicator
		new Communicator('backend')
				.on_success(self._handleRecoverSuccess)
				.on_error(self._handleRecoverError)
				.get('password_recovery', data);
	};

	/**
	 * Handle response from server for password recovery.
	 *
	 * @param object data
	 */
	self._handleRecoverSuccess = function(data) {
		if (!data.error) {
			// successfully created new user account, reload
			self.message.dialog
					.set_error(false)
					.set_title(language_handler.getText(null, 'recovery_dialog_title'));
			self.message.content.html(language_handler.getText(null, 'recovery_completed_message'));
			self.message.dialog.open();

		} else {
			// there was a problem creating new user
			self.message.dialog
					.set_error(true)
					.set_title(language_handler.getText(null, 'recovery_dialog_title'));
			self.message.content.html(data.message);
			self.message.dialog.open();
		}
	};

	/**
	 * Handle error in communication with server.
	 *
	 * @param object xhr
	 * @param string transfer_status
	 * @param string description
	 */
	self._handleRecoverError = function(xhr, transfer_status, description) {
		// show error dialog
		self.message.dialog
				.set_error(true)
				.set_title(language_handler.getText(null, 'recovery_dialog_title'));
		self.message.content.html(description);
		self.message.dialog.open();
	};

	// finalize object
	self._init();
}

Site.ItemView = function(item) {
	var self = this;

	self.item = item;
	self.cart = item.cart;
	self.currency = null;
	self.exchange_rate = 1;

	self.container = null;
	self.name_container = null;
	self.label_name = null;
	self.label_size = null;
	self.label_count = null;
	self.label_total = null;
	self.option_remove = null;
	self.controls = {};
	self.set_up = false;
	self.base_url = document.querySelector('meta[property]').getAttribute('content');

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
		// get list containers
		var item_list = self.cart.get_list_container();
		self.currency = self.cart.default_currency;

		// create container
		self.container = $('<li>').appendTo(item_list);
		self.container.addClass('item');

		// create labels
		self.options_control = $('<div>').appendTo(self.container);
		self.options_control.attr('class','controls');

		self.option_add = $('<a>').appendTo(self.options_control);
		self.option_add
				.html('<svg><use href="#plus" xlink:href=' + self.base_url + '/site/images/site-sprite.svg#plus/></svg>')
				.attr('href', 'javascript: void(0);')
				.data('direction', 1)
				.addClass('alter increase')
				.on('click', self.controls.handle_alter);


		self.option_minus = $('<a>').appendTo(self.options_control);
		self.option_minus
				.html('<svg><use href="#minus" xlink:href='+ self.base_url + '/site/images/site-sprite.svg#minus/></svg>')
				.attr('href', 'javascript: void(0);')
				.data('direction', -1)
				.addClass('alter decrease')
				.on('click', self.controls.handle_alter);

		self.option_remove = $('<a>').appendTo(self.options_control);
		self.option_remove
				.html('<svg><use href="#close" xlink:href='+ self.base_url + '/site/images/site-sprite.svg#close/></svg>')
				.attr('href', 'javascript: void(0)')
				.attr('class','remove')
				.on('click', self._handle_remove);

		self.image = $('<img>').appendTo(self.container);

		self.name_container = $('<div>').appendTo(self.container);
		self.name_container.addClass('name_container');

		self.label_name = $('<span>').appendTo(self.name_container);
		self.label_name.addClass('name');

		self.label_size = $('<span>').appendTo(self.name_container);
		self.label_size.addClass('size');

		self.label_count = $('<span>').appendTo(self.container);
		self.label_count.addClass('count');

		self.label_total = $('<span>').appendTo(self.container);
		self.label_total
				.addClass('total')
				.attr('data-currency', self.currency);
	};

	/**
	 * Handler externally called when item count has changed.
	 */
	self.handle_change = function() {
		self.label_name.text(self.item.name[language_handler.current_language]);
		self.label_size.text(self.item.properties.size_name);
		self.label_count.text(self.item.count);

		self.label_total
			.text((self.item.get_total_cost().toFixed(2)))
			.attr('data-currency', self.currency);

		if (!self.set_up) {
			self.set_up = true;
			self.image
				.attr('src', self.item.image)
				.attr('alt', self.item.name[language_handler.current_language]);

			self.option_add.attr('data-uid', self.item.uid);
			self.option_minus.attr('data-uid', self.item.uid);
		}
	};

	/**
	 * Handle clicking on remove item.
	 *
	 * @param object event
	 */
	self._handle_remove = function(event) {
		event.preventDefault();
		self.item.remove();
	};

	/**
	 * Handle increasing or decreasing item count.
	 *
	 * @param object event
	 */
	self.controls.handle_alter = function(event) {
		var item = $(this);
		var direction = item.data('direction');

		// prevent default button behavior
		event.preventDefault();

		// alter item count
		self.item.alter_count(direction);
	};

	/**
	 * Handle shopping cart currency change.
	 *
	 * @param string currency
	 * @param float rate
	 */
	self.handle_currency_change = function(currency, rate) {
		// store values
		self.currency = currency;
		self.exchange_rate = rate;

		// update labels
		self.handle_change();
	};

	/**
	 * Handler externally called before item removal.
	 */
	self.handle_remove = function() {
		self.container.remove();
	};

	// finalize object
	self._init();
}

/**
 * Function which handles altering item amount on page.
 *
 * @param object event
 */
Site.alter_item_count = function(event) {
	var control = $(this);
	var difference = control.hasClass('increase') ? 1 : -1;
	var uid = control.data('uid');

	// get item with specified unique id
	var item = Site.cart.get_item_by_uid(uid);

	if (item == null && difference > 0) {
		// create new item
		Site.cart.add_item_by_uid(uid);

	} else {
		item.remove();
	}
};

/**
 * Add item to the cart and checkout if needed.
 *
 * @param object event
 * @param boolean skip_alter
 */
Site.insert_to_cart = function(event, skip_alter) {
	// prevent default link behavior
	event.preventDefault();

	// get item data
	var uid = $('div.product_information').data('id');
	var size_definition = $('div.product_information label input:checked').attr('id');
	var checked = $('div.product_information label input:checked').data('text_id');
	var cart = $('div#popup')

	// make cart blink
	cart.addClass('show');
	setTimeout(function() {
		cart.removeClass('show');
	}, 2000);

	// find item with same uid
	var item_list = Site.cart.get_item_list_by_uid(uid);
	var properties = {
			size: checked,
			size_name: size_definition
		};

	// try to update existing item in the list
	var updated = false;
	for (var index in item_list) {
		var item_in_cart = item_list[index];

		if (item_in_cart.properties['size'] == checked) {
			if (!skip_alter)
				item_in_cart.alter_count(1);
			updated = true;
			break;
		}
	}

	// if no items were updated add new item
	if (!updated)
		Site.cart.add_item_by_uid(uid, properties, checked);
}

/**
 * Add item if needed and go to checkout page.
 *
 * @param object event
 */
Site.insert_and_checkout = function(event, skip_alter) {
	// get item data
	var uid = $(this).parent().attr('data-id');
	var item_list = Site.cart.get_item_list_by_uid(uid);

	// test if item in cart
	if (item_list.length == 0) {
		Site.cart.events.connect('item-added', function() {
			Site.cart.checkout();
		});
	} else {
		Site.cart.checkout();
	}

	Site.insert_to_cart(event, true);
};

/**
 * Handle clicking on related item.
 *
 * @param object event
 */
Site.insert_related_items = function(event) {
	// prevent default checkbox behavior
	event.preventDefault();

	// get item data
	var item = $(this);
	var uid = item.parent().attr('data-id');

	if(item.prop('checked'))
		Site.cart.add_item_by_uid(uid); else
		Site.cart.remove_item_by_uid(uid);
}

/**
 * Handle successful contact form submission.
 *
 * @param object data
 * @return boolean
 */
Site.handle_form_submit_success = function(data) {
	dataLayer.push({'event': 'leadSent'});
	return true;
};

/**
 * Handle user leaving page.
 *
 * @param object event
 */
Site.handle_page_leave = function(event) {
	if (event.clientY > 0)
		return;

	if (localStorage.getItem('leave-dialog'))
		return;

	$('#exit_message').addClass('visible');
	localStorage.setItem('leave-dialog', true);
};

/**
 * Handle clicking on submit button in exit dialog.
 *
 * @param object event
 */
Site.handle_exit_dialog_submit = function(event) {
	var form = Site.exit_dialog._container.find('form');
	form.trigger('submit');
	event.preventDefault();
};

/**
 * Handle clicking on close button on exit dialog.
 *
 * @param object event
 */
Site.handle_exit_dialog_close_click = function(event) {
	$('#exit_message').removeClass('visible');
};


/**
 * Function called when document and images have been completely loaded.
 */
Site.on_load = function() {
	if (Site.is_mobile())
		Site.mobile_menu = new Caracal.MobileMenu();

	// create user dialogs
	Site.dialog_system = new Site.DialogSystem();

	// configure shopping cart
	Site.cart = new Caracal.Shop.Cart();
	Site.cart
		.set_checkout_url('/shop/checkout')
		.ui.connect_checkout_button($('header a.checkout'))
		.ui.add_item_list($('div#popup div.cart ul'))
		.ui.add_total_cost_label($('div#popup span.price'))
		.ui.add_total_cost_label($('div.cart p.total'))
		.ui.add_total_count_label($('div#popup span.items'))
		.ui.add_total_count_label($('div.cart p.total_quantity'))
		.add_item_view(Site.ItemView);

	// create scrollbar for shopping cart
	Site.scrollbar = new Scrollbar('section.cart_container', 'ul', true);

	// create page control for news items
	if ($('ul#news_list').length > 0) {
		Site.news = new PageControl('ul#news_list','li.news');
		Site.news
			.setInterval(6000)
			.setWrapAround(true);
	}

	// create filter for items by categories
	if ($('section#category').length > 0) {
		Site.filter = new Site.QuickFilter('section#category', 'section.group', 'a.item');
		Site.banner_system = new Site.BannerSystem();
	}

	// create page control for home page slider
	Site.slider = new PageControl('div.header_slider', 'a.link');
	Site.slider
		.attachPreviousControl($('a.previous'))
		.attachNextControl($('a.next'))
		.setInterval(6000)
		.setPauseOnHover(true)
		.setWrapAround(true);

	if (Site.is_mobile()) {
		// create controls for each slide
		var slides = $('section#slider a');
		var control_container = $('section#slider div.controls');

		slides.each(function(index) {
			$('<a>')
				.attr('href', 'javascript: void(0);')
				.appendTo(control_container);
		});

		Site.mobile_slider = new PageControl('section#slider', 'a');
		Site.mobile_slider.attachControls('section#slider div.controls a');

		// handle clicking on shopping cart button
		var button_mobile_cart = $('div.mobile_title a.cart');
		var cart_mobile = $('div#popup div.cart');

		button_mobile_cart.on('click', function() {
			cart_mobile.toggleClass('open');
		})

		// remove phone number on checkout pages
		if($('div#checkout_container').length > 0)
			$('a.fixed_phone').addClass('hide');
	}

	var input_elements = $('section#product div.product_information label input[type="radio"]');
	var figure_size = $('p.selected_name');
	var figure_price = $('p.selected_price');

	// function displaying product price and name according to checked element
	input_elements.on('click', function() {
		var item = $(this);
		var price = item.attr('value');
		var discount = item.data('discount-price');
		var name = item.attr('id');
		figure_size.html(name);
		figure_price
			.html(price)
			.attr('data-discount-price', discount);
	})

	$('div#related_items div.item label input[type="checkbox"]').on('change', Site.insert_related_items);
	$('section#product a.checkout').on('click', Site.insert_and_checkout);
	$('section#product a.add').on('click', Site.insert_to_cart);

	// connect increase and decrease controls
	$('div.cart div.controls a.alter').on('click', Site.alter_item_count);

	// make data layer for Google Analytics
	window.dataLayer = window.dataLayer || new Object();

	// connect to every form and handle submission
	if (Caracal.ContactForm.list.length > 0)
		for (var index in Caracal.ContactForm.list) {
			var form = Caracal.ContactForm.list[index];
			form.events.connect('submit-success', Site.handle_form_submit_success);
		}

	// save transaction data and cart contents for tracking purposes later
	if ($('div#checkout table.checkout_details').length > 0)
		Site.cart.events.connect('cart-loaded', Site.save_transaction_data);

	// push transaction data to Google's data layer
	if ($('div#checkout div.checkout_message').length > 0)
		Site.push_transaction_data();

	// connect page leave events
	if (!Site.is_mobile()) {
		document.querySelector('body').addEventListener('mouseleave', Site.handle_page_leave);
		var button = document.getElementById('exit_message').querySelector('form button.cancel');
		button.addEventListener('click', Site.handle_exit_dialog_close_click);
		button.innerText = language_handler.getText(null, 'close');
	}

	// search dialog variables
	var search_dialog_trigger = document.querySelector('li.search');
	var input_search = document.querySelector('input[type="search"]');
	var search_dialog = document.querySelector('div.drop');

	if(!Site.is_mobile()) {
		/**
		 * Handle mouseout on search list item & on search container
		 *
		 * @param object event
		 */
		Site.handle_mouseout = function(event) {
			if(document.activeElement != input_search)
				search_dialog.classList.remove('open');
		};

		search_dialog_trigger.addEventListener('mouseover', function() {
			search_dialog.classList.add('open');
		});

		search_dialog_trigger.addEventListener('mouseout', Site.handle_mouseout);
		search_dialog.addEventListener('mouseout', Site.handle_mouseout);
	}

	// show account verification message if present
	if (document.querySelector('div.verify_message')) {
		Site.verify_dialog = new Caracal.Dialog();
		Site.verify_dialog
				.set_content_from_dom('div.verify_message')
				.open();
	}
};

// connect document `load` event with handler function
$(Site.on_load);
