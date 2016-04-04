<?php

/**
 * Green Tops Energy - Free Delivery Method
 *
 * Author: Mladen Mijatov
 */
use Core\Module;


class delivery extends Module {
	private static $_instance;

	/**
	 * Constructor
	 */
	protected function __construct() {
		global $section, $action;

		parent::__construct(__FILE__);

		// register delivery method and create menu items
		if (ModuleHandler::is_loaded('backend') && ModuleHandler::is_loaded('shop')) {
			require_once('units/method.php');
			Free_DeliveryMethod::getInstance($this);
		}

		if (ModuleHandler::is_loaded('head_tag') && $section == 'shop' && $action == 'checkout') {
			$head_tag = head_tag::getInstance();
			$head_tag->addTag('script', array( 'src'  => url_GetFromFilePath($this->path.'include/pikaday.js'), 'type' => 'text/javascript'));
			$head_tag->addTag('link', array('href'=>url_GetFromFilePath($this->path.'include/pikaday.css'), 'rel'=>'stylesheet', 'type'=>'text/css'));
		}
	}

	/**
	 * Public function that creates a single instance
	 */
	public static function getInstance() {
		if (!isset(self::$_instance))
			self::$_instance = new self();

		return self::$_instance;
	}

	/**
	 * Transfers control to module functions
	 *
	 * @param array $params
	 * @param array $children
	 */
	public function transferControl($params=array(), $children=array()) {
	}

	/**
	 * Event triggered upon module initialization
	 */
	public function onInit() {
	}

	/**
	 * Event triggered upon module deinitialization
	 */
	public function onDisable() {
	}
}
