<?php

/**
 * Aley Dafna - Support Module
 *
 * This module provides some basic customizations for Aley Dafna flower shop site. Aside
 * from customizations it also provides options for importing shop items to system from CSV
 * sources generated by the Google Documents.
 *
 * Author: Mladen Mijatov
 */
use Core\Module;


class aley_dafna extends Module {
	private static $_instance;

	const DEFAULT_LANGUAGE = 'he';
	const COL_NAME = 0;
	const COL_DESCRIPTION = 1;
	const COL_PRICE = 2;
	const COL_IMAGE = 3;
	const COL_SIZE_LABELS = 4;
	const COL_CATEGORY_1 = 5;
	const COL_CATEGORY_2 = 6;
	const COL_CATEGORY_3 = 7;
	const COL_CATEGORY_4 = 8;

	/**
	 * Constructor
	 */
	protected function __construct() {
		global $section;

		parent::__construct(__FILE__);

		// register backend
		if (class_exists('backend')) {
			$backend = backend::getInstance();
			$import_menu = $backend->getMenu('shop_import');

			if (!is_null($import_menu))
				$import_menu->addChild(null, new backend_MenuItem(
					$this->getLanguageConstant('menu_import_items'),
					url_GetFromFilePath($this->path.'images/import.svg'),
					window_Open( // on click open window
						'shop_import_items',
						350,
						$this->getLanguageConstant('title_import_items'),
						true, true,
						backend_UrlMake($this->name, 'import')
					),
					5  // level
				));
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
	public function transferControl($params = array(), $children = array()) {
		// global control actions
		if (isset($params['action']))
			switch ($params['action']) {
				default:
					break;
			}

		// global control actions
		if (isset($params['backend_action']))
			switch ($params['backend_action']) {
				case 'import':
					$this->show_import();
					break;

				case 'import_from_file':
					$this->import_from_file();
					break;

				default:
					break;
			}
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

	/**
	 * Parse CSV file and return array.
	 *
	 * @param string $filename
	 * @return array
	 */
	private function load_csv_file($filename) {
		$result = array();

		// make sure file exists
		if (!file_exists($filename))
			return $result;

		// open update file
		$handle = fopen($filename, 'r');

		if ($handle) {
			while (($row = fgetcsv($handle)) !== false)
				$result[] = $row;

			fclose($handle);
		}

		return $result;
	}

	/**
	 * Show form for selecting file for import.
	 */
	private function show_import() {
		$template = new TemplateHandler('import.xml', $this->path.'templates/');
		$template->setMappedModule($this->name);

		$params = array(
					'form_action'	=> backend_UrlMake($this->name, 'import_from_file'),
					'cancel_action'	=> window_Close('shop_import_items')
				);

		$template->restoreXML();
		$template->setLocalParams($params);
		$template->parse();
	}

	/**
	 * Import items from uploaded file.
	 */
	private function import_from_file() {
		$gallery = gallery::getInstance();
		$languages = Language::getLanguages(false);
		$item_manager = ShopItemManager::getInstance();
		$category_manager = ShopCategoryManager::getInstance();
		$property_manager = \Modules\Shop\Property\Manager::getInstance();
		$membership_manager = \ShopItemMembershipManager::getInstance();

		// load csv file
		$csv_data = $this->load_csv_file($_FILES['import']['tmp_name']);

		foreach ($csv_data as $row) {
			// get item name and description
			$item_name = array_fill(0, count($languages), '');
			$item_name = array_combine($languages, $item_name);
			$item_description = $item_name;
			$item_name[self::DEFAULT_LANGUAGE] = $row[self::COL_NAME];
			$item_description[self::DEFAULT_LANGUAGE] = $row[self::COL_DESCRIPTION];

			// unpack price values
			$prices = explode(',', $row[self::COL_PRICE]);
			$price_names = explode(',', $row[self::COL_SIZE_LABELS]);

			// prepare data for insertion
			$uid = '';
			$data = array(
					'name'            => $item_name,
					'description'     => $item_description,
					'price'           => count($prices) > 0 ? floatval($prices[0]) : 0,
					'colors'          => '',
					'tax'             => 0,
					'weight'          => 0,
					'manufacturer'    => 0,
					'uid'             => $uid
				);

			// store author of the uploaded item
			$data['author'] = $_SESSION['uid'];

			// create item gallery
			$data['gallery'] = $gallery->createGallery($item_name);

			// add item to the database
			$item_manager->insertData($data);
			$item_id = $item_manager->getInsertedID();

			// create price properties
			if (count($prices) > 1) {
				// generate default name
				$price_name = array_fill(0, count($languages), '');
				$price_name = array_combine($languages, $price_name);

				for ($i = 1; $i < count($prices); $i++) {
					// set and reset specified name
					if (isset($price_names[$i-1]))
						$price_name[self::DEFAULT_LANGUAGE] = $price_names[$i-1]; else
						$price_name[self::DEFAULT_LANGUAGE] = '';

					// prepare data for insertion
					$price_data = array(
							'item'    => $item_id,
							'name'    => $price_name,
							'text_id' => 'price_'.$i,
							'type'    => 'decimal',
							'value'   => serialize(floatval($prices[$i]))
						);

					// insert new price property
					$property_manager->insertData($price_data);
			   	}
			}
		}

		// show result message
		$template = new TemplateHandler('message.xml', $this->path.'templates/');
		$template->setMappedModule($this->name);

		$params = array(
					'message'	=> $this->getLanguageConstant('message_import_complete'),
					'button'	=> $this->getLanguageConstant('close'),
					'action'	=> window_Close('shop_import_items')
				);

		$template->restoreXML();
		$template->setLocalParams($params);
		$template->parse();
	}
}

?>
