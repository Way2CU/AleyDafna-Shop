<?php

class Pickup_DeliveryMethod extends DeliveryMethod {
	private static $_instance;

	protected function __construct($parent) {
		parent::__construct($parent);

		// register delivery method
		$this->name = 'pickup';

		if (class_exists('shop'))
			Modules\Shop\Delivery::register_method($this->name, $this);
	}

	/**
	 * Public function that creates a single instance
	 */
	public static function get_instance($parent) {
		if (!isset(self::$_instance))
			self::$_instance = new self($parent);

		return self::$_instance;
	}

	/**
	 * Get localized name of delivery method.
	 *
	 * @return string
	 */
	public function getTitle() {
		return $this->parent->get_language_constant('pickup_method_title');
	}

	/**
	 * Get URL of 200x55 pixel image for delivery method. This image is a
	 * logo of delivery method and is used in forms for selection.
	 *
	 * @return string
	 */
	public function getImage() {
		return URL::from_file_path($this->parent->path.'images/pick_up.png');
	}

	/**
	 * Get URL of 100x28 pixel image for delivery method. This image is a
	 * logo of delivery method and is used in forms for selection.
	 *
	 * @return string
	 */
	public function getSmallImage() {
		return URL::from_file_path($this->parent->path.'images/pick_up_small.png');
	}

	/**
	 * Get status of specified delivery. If available multiple statuses
	 * should be provided last item being the current status of delivery.
	 *
	 * Example of result array:
	 *		$result = array(
	 *					array('Prosessing', 1362040000),
	 *					array('Departure', 1362240000),
	 *					array('In transit', 1362440000),
	 *					array('Delivered', 1363440000)
	 *				);
	 *
	 * @param string $delivery_id
	 * @return array
	 */
	public function getDeliveryStatus($delivery_id) {
	}

	/**
	 * Get available delivery types for selected items. Each type needs
	 * to return estimated delivery time, cost and name of service.
	 *
	 * Example of items array:
	 * 		$items = array(
	 * 					array(
	 * 						'package'		=> 0, // number identifying package
	 * 						'properties'	=> array(),
	 * 						'package_type'	=> 0,
	 * 						'width'			=> 0.2,
	 * 						'height'		=> 0.5,
	 * 						'length'		=> 1,
	 * 						'weight'		=> 0,
	 * 						'units'			=> 1,
	 * 						'count'			=> 1
	 * 					)
	 * 				);
	 *
	 * Example of shipper array:
	 * 		$shipper = array(
	 * 					'street'	=> array(),
	 * 					'city'		=> '',
	 * 					'zip_code'	=> '',
	 * 					'state'		=> '',
	 * 					'country'	=> ''
	 * 				);
	 *
	 * Example of recipient array:
	 * 		$recipient = array(
	 * 					'street'	=> array(),
	 * 					'city'		=> '',
	 * 					'zip_code'	=> '',
	 * 					'state'		=> '',
	 * 					'country'	=> ''
	 * 				);
	 *
	 * Example of result array:
	 *		$result = array(
	 *					'normal' => array('Normal', 19.95, 'USD', 1364040000, 1365040000),
	 *					'express' => array('Express', 33.23, 'USD', 1363040000, 1364040000),
	 *					'express_no_estimate' => array('Express', 8.00, 'USD', false, false)
	 *				);
	 *
	 * @param array $items
	 * @param array $shipper
	 * @param array $recipient
	 * @param string $transaction
	 * @return array
	 */
	public function getDeliveryTypes($items, $shipper, $recipient, $transaction=null) {
	}

	/**
	 * Get list of supported package types. Items in resulting array must
	 * corespond to constants in PackageType class.
	 *
	 * Example of resulting array:
	 * 		$result = array(
	 * 					PackageType::BOX_10,
	 * 					PackageType::ENVELOPE,
	 * 					PackageType::PAK
	 * 				);
	 *
	 * @return array
	 */
	public function getSupportedPackageTypes() {
	}

	/**
	 * Get special params supported by delivery method which should be
	 * assigned with items in shop. Resulting array needs to contain
	 * array which will contain key-value pairs of localized group names
	 * and values and a second array with available params.
	 *
	 * Example of result array:
	 *		$result = array(
	 *					array(
	 *						'package_types'		=> 'Packaging params',
	 *						'special_services'	=> 'Special services'
	 *					),
	 *					array(
	 *						'package_types'	=> array(
	 *							array('package_box', 'Box'),
	 *							array('package_tube', 'Tube shaped box'),
	 *							array('package_envelope', 'Envelope'),
	 *						),
	 *						'special_services' => array(
	 *							array('keep_on_ice', 'Keep package cool'),
	 *							array('keep_hot', 'Keep package hot'),
	 *							array('fragile', 'Fragile')
	 *						)
	 *					)
	 *				);
	 *
	 * @return array
	 */
	public function getAvailableParams() {
		return array();
	}

	/**
	 * Get custom delivery method interface.
	 *
	 * @return string
	 */
	public function getInterface() {
		// load template
		$template = new TemplateHandler('interface.xml', $this->parent->path.'templates/');

		// prepare params
		$params = array();

		// parse template
		$template->restore_xml();
		$template->set_local_params($params);
		$template->parse();
	}

	/**
	 * Get delivery price for selection for specified recipient.
	 *
	 * @param array $items
	 * @param array $shipper
	 * @param array $recipient
	 * @param string $selection
	 * @param object $transaction
	 * @return float
	 */
	public function getCustomEstimate($items, $shipper, $recipient, $selection, $transaction=null) {
		return 0;
	}

	/**
	 * Whether delivery method can be used for international deliveries.
	 *
	 * @return boolean
	 */
	public function isInternational() {
		return false;
	}

	/**
	 * Whether delivery method provides custom interface. If custom interface is
	 * present instead of `getDeliveryTypes` function `getInterface` will be called.
	 *
	 * @return boolean
	 */
	public function hasCustomInterface() {
		return true;
	}

	/**
	 * We don't require system to ask user for delivery address for this method.
	 *
	 * @return boolean
	 */
	public function requiresUserInformation() {
		return false;
	}
}

?>
