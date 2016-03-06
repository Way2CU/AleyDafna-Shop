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
	const DEFAULT_THRESHOLD = 10;

	const COL_ID = 0;
	const COL_NAME = 1;
	const COL_DESCRIPTION = 2;
	const COL_PRICE = 3;
	const COL_IMAGE = 4;
	const COL_SIZE_LABELS = 5;
	const COL_FIRST_CATEGORY = 6;

	var $size_names = array('medium', 'big', 'extra-big', 'huge');

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
			while (($line = fgets($handle)) !== false) {
				$raw = explode("\t", $line);
				$result[] = array_map('trim', $raw);
			}

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
	 * Get highest recommended category for specified name based on Levenshtein
	 * distance algorithm. If distance is too big `null` will be returned.
	 *
	 * @param array $categories
	 * @param string $name
	 * @param integer $threshold
	 * @return integer
	 */
	private function get_category_for_name(&$categories, $name, $threshold) {
		$result = null;
		$score = mb_strlen($name) * 2;

		// try to find matching category
		foreach ($categories as $key => $category_name) {
			$current_score = levenshtein($category_name, $name);

			if ($current_score < $score) {
				$score = $current_score;
				$result = $key;
			}
		}

		// make sure we don't return category above threshold
		if ($score > $threshold)
			$result = null;

		return $result;
	}

	/**
	 * Match image file against array of existing images and return real image.
	 *
	 * @param array $image_list
	 * @param string $file_name
	 * @return string
	 */
	private function match_image_file(&$image_list, $file_name) {
		$result = null;
		$score = mb_strlen($file_name) * 2;

		// try to find matching category
		foreach ($image_list as $real_file_name) {
			$current_score = levenshtein($real_file_name, $file_name);

			if ($current_score < $score) {
				$score = $current_score;
				$result = $real_file_name;
			}
		}

		// make sure we don't return category above threshold
		if ($score > $threshold)
			$result = null;

		return $result;
	}

	/**
	 * Import items from uploaded file.
	 */
	private function import_from_file() {
		global $db, $site_path;

		$gallery = gallery::getInstance();
		$gallery_manager = GalleryManager::getInstance();
		$languages = Language::getLanguages(false);
		$item_manager = ShopItemManager::getInstance();
		$category_manager = ShopCategoryManager::getInstance();
		$property_manager = \Modules\Shop\Property\Manager::getInstance();
		$membership_manager = \ShopItemMembershipManager::getInstance();

		// load categories
		$categories = array();
		$raw_categories = $category_manager->getItems($category_manager->getFieldNames(), array());

		if (count($raw_categories) > 0)
			foreach ($raw_categories as $category)
				$categories[$category->id] = $category->title[self::DEFAULT_LANGUAGE];

		// load existing items
		$existing_items = array();
		$items = $item_manager->getItems(array('id', 'uid'), array());

		foreach ($items as $item)
			$existing_items[$item->uid] = $item->id;

		// load existing images
		$existing_images = array();
		$images = $gallery_manager->getItems(array('group', 'text_id', 'id'), array());

		if (count($images) > 0)
			foreach ($images as $image) {
				// make sure we have storage array
				if (!array_key_exists($image->group, $existing_images))
					$existing_images[$image->group] = array();

				// add image to the list
				$existing_images[$image->group][$image->id] = $image->text_id;
			}

		$image_list = scandir($site_path.'import/');

		// load csv file
		$csv_data = $this->load_csv_file($_FILES['import']['tmp_name']);
		array_shift($csv_data);
		$number_to_import = (isset($_REQUEST['number_to_import']) && !empty($_REQUEST['number_to_import'])) ? fix_id($_REQUEST['number_to_import']) : count($csv_data);
		$counter = 0;

		foreach ($csv_data as $row) {
			// make sure we are within our limits
			if (++$counter > $number_to_import)
				break;

			// get item name and description
			$item_name = array_fill(0, count($languages), '');
			$item_name = array_combine($languages, $item_name);
			$item_description = $item_name;
			$item_name[self::DEFAULT_LANGUAGE] = $db->escape_string($row[self::COL_NAME]);
			$item_description[self::DEFAULT_LANGUAGE] = $db->escape_string($row[self::COL_DESCRIPTION]);

			// unpack price values
			$prices = explode(',', $row[self::COL_PRICE]);
			$price_names = explode(',', $row[self::COL_SIZE_LABELS]);

			// generate uid and check if item exists in database
			$uid = hash('sha256', 'item_'.$row[self::COL_ID]);

			if (array_key_exists($uid, $existing_items)) {
				$data = array(
						'name'            => $item_name,
						'description'     => $item_description,
						'price'           => count($prices) > 0 ? floatval($prices[0]) : 0
					);
				$item_id = $existing_items[$uid];
				$item_manager->updateData($data, array('id' => $item_id));
				$gallery_id = $item_manager->getItemValue('gallery', array('id' => $item_id));

			} else {
				// prepare data
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
				$gallery_id = $gallery->createGallery($item_name);
				$data['gallery'] = $gallery_id;

				// add item to the database
				$item_manager->insertData($data);
				$item_id = $item_manager->getInsertedID();

			}

			// remove existing prices
			$property_manager->deleteData(array(
					'item'          => $item_id,
					'text_id'       => array(
						'operator' => 'LIKE',
						'value'    => 'price_%'
					)));

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
							'text_id' => 'price_'.$this->size_names[$i-1],
							'type'    => 'decimal',
							'value'   => serialize(floatval($prices[$i]))
						);

					// insert new price property
					$property_manager->insertData($price_data);
				}
			}

			// remove existing category membership
			$membership_manager->deleteData(array('item' => $item_id));

			// assign category membership
			for ($i = self::COL_FIRST_CATEGORY; $i < count($row); $i++) {
				$category_name = $row[$i];
				$category_id = $this->get_category_for_name($categories, $category_name, self::DEFAULT_THRESHOLD);

				if (!is_null($category_id))
					$membership_manager->insertData(array(
						'category' => $category_id,
						'item'     => $item_id
					));
			}

			// upload images
			$image_file = $row[self::COL_IMAGE];
			$matched_file = $this->match_image_file($image_list, $image_file);

			if (!is_null($matched_file)) {
				$matched_hash = hash('md5', $matched_file);
				$source_path = $site_path.'import/'.$matched_file;
				$destination_file = hash('md5', $matched_file.strval(time())).'.'.pathinfo(strtolower($matched_file), PATHINFO_EXTENSION);
				$destination_path = $site_path.'gallery/images/'.$destination_file;
				$image_already_uploaded = !in_array($matched_hash, $existing_images[$gallery_id]);

			   	if ($image_already_uploaded && rename($source_path, $destination_path) {
					$gallery_manager->insertData(array(
							'text_id'   => $matched_hash,
							'size'      => filesize($source_path),
							'filename'  => $destination_file,
							'visible'   => 1,
							'slideshow' => 0,
							'protected' => 0,
						));
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
