<?php

/**
 * Aley Dafna Promotions and Discounts
 *
 * These discounts are applied above specified total amount
 * for purchase in question.
 */

use Modules\Shop\Promotion\Discount;
use Modules\Shop\Promotion\Promotion;


class BalloonPromotion extends Promotion {
	private $parent;

	public function __construct($parent) {
		$this->name = 'free-balloon';
		$this->parent = $parent;
	}

	/**
	 * Get multi-language name for the promotion. This name
	 * is used for showing user applied promotion instead of using
	 * unique strings.
	 *
	 * @return string
	 */
	public function get_title() {
		return $this->parent->get_language_constant('promotion_balloon');
	}

	/**
 	 * Check if specified transaction qualified for this promotion.
	 *
	 * @return boolean
	 */
	public function qualifies() {
		$shop = shop::get_instance();
		$summary = $shop->getCartSummary(null, TransactionType::REGULAR);

		return $summary['total'] >= 250;
	}

	/**
	 * Return discount associated with this promotion. This object
	 * will specify the amount being deduced from final.
	 *
	 * @return object
	 */
	public function get_discount() {
		$result = new BalloonDiscount($this->parent);
		return $result;
	}
}


class WinePromotion extends Promotion {
	private $parent;

	public function __construct($parent) {
		$this->name = 'free-wine';
		$this->parent = $parent;
	}

	/**
	 * Get multi-language name for the promotion. This name
	 * is used for showing user applied promotion instead of using
	 * unique strings.
	 *
	 * @return string
	 */
	public function get_title() {
		return $this->parent->get_language_constant('promotion_wine');
	}

	/**
 	 * Check if specified transaction qualified for this promotion.
	 *
	 * @return boolean
	 */
	public function qualifies() {
		$shop = shop::get_instance();
		$summary = $shop->getCartSummary(null, TransactionType::REGULAR);

		return $summary['total'] >= 350;
	}

	/**
	 * Return discount associated with this promotion. This object
	 * will specify the amount being deduced from final.
	 *
	 * @return object
	 */
	public function get_discount() {
		$result = new WineDiscount($this->parent);
		return $result;
	}
}


class VasePromotion extends Promotion {
	private $parent;

	public function __construct($parent) {
		$this->name = 'free-vase';
		$this->parent = $parent;
	}

	/**
	 * Get multi-language name for the promotion. This name
	 * is used for showing user applied promotion instead of using
	 * unique strings.
	 *
	 * @return string
	 */
	public function get_title() {
		return $this->parent->get_language_constant('promotion_vase');
	}

	/**
 	 * Check if specified transaction qualified for this promotion.
	 *
	 * @return boolean
	 */
	public function qualifies() {
		$shop = shop::get_instance();
		$summary = $shop->getCartSummary(null, TransactionType::REGULAR);

		return $summary['total'] > 400;
	}

	/**
	 * Return discount associated with this promotion. This object
	 * will specify the amount being deduced from final.
	 *
	 * @return object
	 */
	public function get_discount() {
		$result = new VaseDiscount($this->parent);
		return $result;
	}
}


class BalloonDiscount extends Discount {
	private $parent;

	public function __construct($parent) {
		$this->name = 'free-balloon';
		$this->parent = $parent;
	}

	/**
	 * Get multi-language name for the discount. This name
	 * is used for showing user applied discount instead of using
	 * unique strings.
	 *
	 * @return string
	 */
	public function get_title() {
		return $this->parent->get_language_constant('discount_balloon');
	}

	/**
	 * Apply discount on specified trancation. Result is a list
	 * of discount items. These items do not reflect shop items in the
	 * cart. Instead they represent different deduction from the final
	 * price.
	 *
	 * @param object $transaction
	 * @return array
	 */
	public function apply($transaction) {
		return array($this->parent->get_language_constant('item_balloon'), 1, 0);
	}
}


class WineDiscount extends Discount {
	private $parent;

	public function __construct($parent) {
		$this->name = 'free-wine';
		$this->parent = $parent;
	}

	/**
	 * Get multi-language name for the discount. This name
	 * is used for showing user applied discount instead of using
	 * unique strings.
	 *
	 * @return string
	 */
	public function get_title() {
		return $this->parent->get_language_constant('discount_wine');
	}

	/**
	 * Apply discount on specified trancation. Result is a list
	 * of discount items. These items do not reflect shop items in the
	 * cart. Instead they represent different deduction from the final
	 * price.
	 *
	 * @param object $transaction
	 * @return array
	 */
	public function apply($transaction) {
		return array($this->parent->get_language_constant('item_wine'), 1, 0);
	}
}


class VaseDiscount extends Discount {
	private $parent;

	public function __construct($parent) {
		$this->name = 'free-vase';
		$this->parent = $parent;
	}

	/**
	 * Get multi-language name for the discount. This name
	 * is used for showing user applied discount instead of using
	 * unique strings.
	 *
	 * @return string
	 */
	public function get_title() {
		return $this->parent->get_language_constant('discount_vase');
	}

	/**
	 * Apply discount on specified trancation. Result is a list
	 * of discount items. These items do not reflect shop items in the
	 * cart. Instead they represent different deduction from the final
	 * price.
	 *
	 * @param object $transaction
	 * @return array
	 */
	public function apply($transaction) {
		return array($this->parent->get_language_constant('item_vase'), 1, 0);
	}
}

?>
