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
use Core\Events;

use Modules\Shop\Transaction as Transaction;
use Modules\Shop\Item\Manager as ShopItemManager;

require_once('units/discount.php');


class aley_dafna extends Module {
	private static $_instance;

	const DEFAULT_LANGUAGE = 'he';
	const DEFAULT_THRESHOLD = 10;

	const COL_ID = 0;
	const COL_NAME_HE = 1;
	const COL_NAME_RU = 2;
	const COL_NAME_EN = 3;
	const COL_DESCRIPTION_HE = 3;
	const COL_DESCRIPTION_RU = 4;
	const COL_DESCRIPTION_EN = 5;
	const COL_PRICE = 5;
	const COL_IMAGE = 6;
	const COL_SIZE_LABELS = 7;
	const COL_FIRST_CATEGORY = 8;

	var $size_names = array('medium', 'big', 'extra-big', 'huge');
	var $text_position = array(
			'aley_dafna_1' => array(25, 10, 10, 10),
			'aley_dafna_2' => array(40, 10, 20, 10),
			'baloons_1'    => array(50, 10, 30, 10),
			'baloons_2'    => array(60, 10, 10, 10),
			'baloons_3'    => array(40, 10, 40, 10),
			'green_edge_1' => array(30, 10, 30, 10),
			'green_edge_2' => array(30, 10, 30, 10),
			'green_wave'   => array(10, 10, 30, 10),
			'happy_bday_1' => array(40, 10, 40, 10),
			'happy_bday_2' => array(60, 10, 10, 10),
			'happy_bday_3' => array(40, 10, 40, 10),
			'heart_dust'   => array(10, 10, 40, 10),
			'heart'        => array(40, 10, 40, 10),
			'ornaments'    => array(40, 10, 10, 10)
		);

	/**
	 * Constructor
	 */
	protected function __construct() {
		global $section;

		parent::__construct(__FILE__);

		// register backend
		if (class_exists('backend')) {
			$backend = backend::get_instance();
			$import_menu = $backend->getMenu('shop_import');

			if (!is_null($import_menu)) {
				$import_menu->addChild(null, new backend_MenuItem(
					$this->get_language_constant('menu_import_items'),
					URL::from_file_path($this->path.'images/import.svg'),
					window_Open( // on click open window
						'shop_import_items',
						350,
						$this->get_language_constant('title_import_items'),
						true, true,
						backend_UrlMake($this->name, 'import')
					),
					6  // level
				));

				$import_menu->addChild(null, new backend_MenuItem(
					$this->get_language_constant('menu_import_english'),
					URL::from_file_path($this->path.'images/import.svg'),
					window_Open( // on click open window
						'shop_import_items',
						350,
						$this->get_language_constant('title_import_items'),
						true, true,
						backend_UrlMake($this->name, 'import_english')
					),
					6  // level
				));
			}
		}

		// register delivery method and create menu items
		if (ModuleHandler::is_loaded('backend') && ModuleHandler::is_loaded('shop')) {
			require_once('units/method.php');
			require_once('units/pickup_method.php');
			Paid_DeliveryMethod::get_instance($this);
			Pickup_DeliveryMethod::get_instance($this);
		}

		// register promotions
		if (ModuleHandler::is_loaded('shop')) {
			$shop = shop::get_instance();
			$shop->registerPromotion(new BalloonPromotion($this));
			$shop->registerPromotion(new WinePromotion($this));
			$shop->registerPromotion(new VasePromotion($this));
			$shop->registerDiscount(new BalloonDiscount($this));
			$shop->registerDiscount(new WineDiscount($this));
			$shop->registerDiscount(new VaseDiscount($this));
		}

		if (SectionHandler::get_matched_file() == 'checkout.xml') {
			$head_tag = head_tag::get_instance();
			$head_tag->addTag('script', array( 'src' => URL::from_file_path($this->path.'include/pikaday.js'), 'type' => 'text/javascript'));
			$head_tag->addTag('link', array('href' => URL::from_file_path($this->path.'include/pikaday.css'), 'rel' => 'stylesheet', 'type' => 'text/css'));
			$head_tag->addTag('link', array('href' => URL::from_file_path($this->path.'include/checkout.css'), 'rel' => 'stylesheet', 'type' => 'text/css'));
		}

		if (ModuleHandler::is_loaded('backend') && $section == 'backend') {
			$head_tag = head_tag::get_instance();
			$head_tag->addTag('script', array( 'src' => URL::from_file_path($this->path.'include/backend.js'), 'type' => 'text/javascript'));
		}

		// connect transaction handling event
		Events::connect('shop', 'transaction-completed', 'on_transaction_completed', $this);
	}

	/**
	 * Public function that creates a single instance
	 */
	public static function get_instance() {
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
	public function transfer_control($params = array(), $children = array()) {
		// global control actions
		if (isset($params['action']))
			switch ($params['action']) {
				default:
				break;
			}

		// global control actions
		if (isset($params['backend_action']))
			switch ($params['backend_action']) {
				case 'print_card':
					$this->print_card();
					break;

				case 'import':
				case 'import_english':
					$this->show_import($params['backend_action']);
					break;

				case 'import_from_file':
					$this->import_from_file();
					break;

				case 'import_english_from_file':
					$this->import_english();
					break;

				default:
					break;
			}
	}

	/**
	 * Event triggered upon module initialization
	 */
	public function initialize() {
	}

	/**
	 * Event triggered upon module deinitialization
	 */
	public function cleanup() {
	}

	/**
	 * Handle transaction status change.
	 *
	 * @param object transaction
	 */
	public function on_transaction_completed($transaction) {
		global $language;

		// get managers
		$buyer_manager = ShopBuyersManager::get_instance();
		$address_manager = ShopDeliveryAddressManager::get_instance();
		$transaction_items_manager = ShopTransactionItemsManager::get_instance();
		$item_manager = ShopItemManager::get_instance();

		// get transaction data
		$buyer = Transaction::get_buyer($transaction);
		$address = Transaction::get_address($transaction);
		$transaction_items = $transaction_items_manager->get_items(
			$transaction_items_manager->get_field_names(),
			array('transaction' => $transaction->id)
		);

		$date_time = date('Y-m-d', strtotime($transaction->delivery_type));

		// prepare data
		$title = $buyer->first_name.' '.$buyer->last_name.' - '.$transaction->uid;

		if ($transaction->delivery_type == 'pickup') {
			$location = '';
			$color = 9;

		} else {
			$location = $address->street.' '.$address->street2.', '.$address->zip.' '.$address->city.', '.$address->country;
			$color = 10;
		}

		$id_list = array();
		$name_by_id = array();
		$description = '';

		if (count($transaction_items) > 0) {
			foreach ($transaction_items as $item)
				$id_list[] = $item->item;

			$items = $item_manager->get_items(array('id', 'name'), array('id' => $id_list));
			foreach ($items as $item)
				$name_by_id[$item->id] = $item->name;

			foreach ($transaction_items as $item)
				$description .= $name_by_id[$item->item][$language].' - '.$item->amount."\n";
		}

		$post_data = array(
				'start'       => $date_time,
				'end'         => $date_time,
				'title'       => $title,
				'location'    => $location,
				'description' => $description,
				'color'       => $color
			);
		$post_data = json_encode($post_data);

		$url = 'https://zapier.com/hooks/catch/133542/uti08e';
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_HTTPGET, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$response = curl_exec($ch);
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
	private function show_import($action) {
		$template = new TemplateHandler('import.xml', $this->path.'templates/');
		$template->set_mapped_module($this->name);

		// prepare form action
		switch ($action) {
			case 'import_english':
				$form_action = 'import_english_from_file';
				break;

			case 'import':
			default:
				$form_action = 'import_from_file';
				break;
		}

		$params = array(
			'form_action'	=> backend_UrlMake($this->name, $form_action),
			'cancel_action'	=> window_Close('shop_import_items')
		);

		$template->restore_xml();
		$template->set_local_params($params);
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
	 * @param integer
	 * @return string
	 */
	private function match_image_file(&$image_list, $file_name, $threshold) {
		$result = null;

		// try to find matching category
		foreach ($image_list as $real_file_name) {
			$name_to_match = pathinfo($real_file_name, PATHINFO_FILENAME);

			if ($name_to_match == $file_name) {
				$result = $real_file_name;
				break;
			}
		}

		return $result;
	}

	/**
	 * Import content in English.
	 */
	private function import_english() {
		global $db;

		// get managers
		$item_manager = ShopItemManager::get_instance();
		$gallery_manager = GalleryManager::get_instance();

		// load existing items
		$existing_items = array();
		$items = $item_manager->get_items(array('name', 'description', 'uid'), array());

		foreach ($items as $item)
			$existing_items[$item->uid] = $item;

		// load csv file
		$csv_data = $this->load_csv_file($_FILES['import']['tmp_name']);
		$number_to_import = (isset($_REQUEST['number_to_import']) && !empty($_REQUEST['number_to_import'])) ? fix_id($_REQUEST['number_to_import']) : count($csv_data);
		array_shift($csv_data);  // remove header
		$counter = 0;

		foreach ($csv_data as $row) {
			// generate uid and check if item exists in database
			$uid = hash('sha256', 'item_'.$row[self::COL_ID]);

			// make sure item already exists
			if (!array_key_exists($uid, $existing_items))
				continue;

			// make sure we are within our limits
			if (++$counter > $number_to_import)
				break;

			// preare data
			$item = $existing_items[$uid];
			$data = array();
			$data['name']= $item->name;
			$data['description']= $item->description;
			$data['name']['en'] = trim($row[self::COL_NAME_EN]);
			$data['description']['en'] = trim($row[self::COL_DESCRIPTION_EN]);

			// update data
			$item_manager->update_items($data, array('uid' => $uid));
		}

		// show result message
		$template = new TemplateHandler('message.xml', $this->path.'templates/');
		$template->set_mapped_module($this->name);

		$params = array(
			'message'	=> $this->get_language_constant('message_import_complete'),
			'button'	=> $this->get_language_constant('close'),
			'action'	=> window_Close('shop_import_items')
		);

		$template->restore_xml();
		$template->set_local_params($params);
		$template->parse();
	}

	/**
	 * Import items from uploaded file.
	 */
	private function import_from_file() {
		global $db, $site_path;

		$gallery = gallery::get_instance();
		$gallery_manager = GalleryManager::get_instance();
		$languages = Language::get_languages(false);
		$item_manager = ShopItemManager::get_instance();
		$category_manager = ShopCategoryManager::get_instance();
		$property_manager = \Modules\Shop\Property\Manager::get_instance();
		$membership_manager = \ShopItemMembershipManager::get_instance();

		// load categories
		$categories = array();
		$raw_categories = $category_manager->get_items($category_manager->get_field_names(), array());

		if (count($raw_categories) > 0)
			foreach ($raw_categories as $category)
				$categories[$category->id] = $category->title[self::DEFAULT_LANGUAGE];

		// load existing items
		$existing_items = array();
		$items = $item_manager->get_items(array('id', 'uid'), array());

		foreach ($items as $item)
			$existing_items[$item->uid] = $item->id;

		// load existing images
		$existing_images = array();
		$images = $gallery_manager->get_items(array('group', 'text_id', 'id'), array());

		if (count($images) > 0)
			foreach ($images as $image) {
				// make sure we have storage array
				if (!array_key_exists($image->group, $existing_images))
					$existing_images[$image->group] = array();

				// add image to the list
				$existing_images[$image->group][$image->id] = $image->text_id;
			}

		$image_list = scandir(_BASEPATH.'/'.$site_path.'import/');

		// load csv file
		$csv_data = $this->load_csv_file($_FILES['import']['tmp_name']);
		array_shift($csv_data);  // remove header
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
			$item_name['he'] = $db->escape_string($row[self::COL_NAME_HE]);
			$item_name['ru'] = $db->escape_string($row[self::COL_NAME_RU]);
			$item_description['he'] = $db->escape_string($row[self::COL_DESCRIPTION_HE]);
			$item_description['ru'] = $db->escape_string($row[self::COL_DESCRIPTION_RU]);

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
				$item_manager->update_items($data, array('id' => $item_id));
				$gallery_id = $item_manager->get_item_value('gallery', array('id' => $item_id));

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
				$item_manager->insert_item($data);
				$item_id = $item_manager->getInsertedID();

			}

			// remove existing prices
			$property_manager->delete_items(array(
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
					if (isset($price_names[$i]))
						$price_name[self::DEFAULT_LANGUAGE] = $price_names[$i]; else
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
					$property_manager->insert_item($price_data);
				}
			}

			// remove existing category membership
			$membership_manager->delete_items(array('item' => $item_id));

			// assign category membership
			for ($i = self::COL_FIRST_CATEGORY; $i < count($row); $i++) {
				$category_name = $row[$i];
				$category_id = $this->get_category_for_name($categories, $category_name, self::DEFAULT_THRESHOLD);

				if (!is_null($category_id))
					$membership_manager->insert_item(array(
						'category' => $category_id,
						'item'     => $item_id
					));
			}

			// upload images
			$image_file = mb_strtolower($row[self::COL_IMAGE]);
			$matched_file = $this->match_image_file($image_list, $image_file, 6);

			// we require a valid match
			if (!is_null($matched_file)) {
				$matched_hash = hash('md5', $matched_file);
				$source_path = _BASEPATH.'/'.$site_path.'import/'.$matched_file;
				$destination_file = hash('md5', $matched_file.strval(time())).'.'.pathinfo(strtolower($matched_file), PATHINFO_EXTENSION);
				$destination_path = _BASEPATH.'/'.$site_path.'gallery/images/'.$destination_file;
				$image_already_uploaded = array_key_exists($gallery_id, $existing_images) && !in_array($matched_hash, $existing_images[$gallery_id]);
				$file_size = filesize($source_path);

				// only upload image if it wasn't uploaded already
				if (!$image_already_uploaded && copy($source_path, $destination_path)) {
					$gallery_manager->insert_item(array(
						'group'     => $gallery_id,
						'title'		=> $item_name,
						'text_id'   => $matched_hash,
						'size'      => $file_size,
						'filename'  => $destination_file,
						'visible'   => 1,
						'slideshow' => 0,
						'protected' => 0
					));
				}
			}
		}

		// show result message
		$template = new TemplateHandler('message.xml', $this->path.'templates/');
		$template->set_mapped_module($this->name);

		$params = array(
			'message'	=> $this->get_language_constant('message_import_complete'),
			'button'	=> $this->get_language_constant('close'),
			'action'	=> window_Close('shop_import_items')
		);

		$template->restore_xml();
		$template->set_local_params($params);
		$template->parse();
	}

	/**
	 * Show page for printing all attached cards with selected text.
	 */
	private function print_card() {
		$id = fix_id($_REQUEST['transaction']);
		$manager = ShopTransactionsManager::get_instance();
		$item_manager = ShopItemManager::get_instance();
		$transaction_item_manager = ShopTransactionItemsManager::get_instance();

		// get transaction with specified id
		$transaction = $manager->get_single_item(
				array('id'),
				array('id' => $id)
			);

		// ensure transaction is a valid one
		if (!is_object($transaction))
			return;

		// get items associated with transaction
		$transaction_items = $transaction_item_manager->get_items(
				array('item', 'description'),
				array('transaction' => $transaction->id)
			);

		if (count($transaction_items) == 0)
			return;

		$id_list = array();
		$description_list = array();
		foreach ($transaction_items as $item) {
			$id_list[] = $item->item;
			$description_list[$item->item] = $item->description;
		}

		// get unique id and gallery
		$shop_items = $item_manager->get_items(
				array('id', 'uid', 'gallery'),
				array('id' => $id_list)
			);

		if (count($shop_items) == 0)
			return;

		// prepare final list and only include items that are actually known cards
		$items = array();
		foreach ($shop_items as $item) {
			if (!array_key_exists($item->uid, $this->text_position))
				continue;

			$position = $this->text_position[$item->uid];
			$description = unserialize($description_list[$item->id]);

			$data = array(
					'text'   => $description['text'],
					'top'    => $position[0].'%',
					'left'   => $position[1].'%',
					'bottom' => $position[2].'%',
					'right'  => $position[3].'%',
					'image'  => gallery::getGroupImageById($item->gallery)
				);

			$items[] = $data;
		}

		// prepare template
		$template = new TemplateHandler('print_card.xml', $this->path.'templates/');

		if (count($items) > 0)
			foreach ($items as $item) {
				$template->set_local_params($item);
				$template->restore_xml();
				$template->parse();
			}
	}
}

?>
