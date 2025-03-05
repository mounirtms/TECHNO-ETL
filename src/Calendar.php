<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Magento\Framework\View\Element\Html;

use Magento\Framework\Locale\Bundle\DataBundle;

/**
 * Calendar block for page header
 *
 * Prepares localization data for calendar
 *
 * @api
 * @since 100.0.2
 */
class Calendar extends \Magento\Framework\View\Element\Template
{
    /**
     * Date model
     *
     * @var \Magento\Framework\Stdlib\DateTime\DateTime
     */
    protected $_date;

    /**
     * JSON Encoder
     *
     * @var \Magento\Framework\Json\EncoderInterface
     */
    protected $encoder;

    /**
     * @var \Magento\Framework\Locale\ResolverInterface
     */
    protected $_localeResolver;

    /**
     * Constructor
     *
     * @param \Magento\Framework\View\Element\Template\Context $context
     * @param \Magento\Framework\Stdlib\DateTime\DateTime $date
     * @param \Magento\Framework\Json\EncoderInterface $encoder
     * @param \Magento\Framework\Locale\ResolverInterface $localeResolver
     * @param array $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Framework\Stdlib\DateTime\DateTime $date,
        \Magento\Framework\Json\EncoderInterface $encoder,
        \Magento\Framework\Locale\ResolverInterface $localeResolver,
        array $data = []
    ) {
        $this->_date = $date;
        $this->encoder = $encoder;
        $this->_localeResolver = $localeResolver;
        parent::__construct($context, $data);
    }

    /**
     * Render block HTML
     *
     * @return string
     */
    protected function _toHtml()
    {
        $localeData = (new DataBundle())->get($this->_localeResolver->getLocale());
    
        // get days names
        $daysData = $localeData['calendar']['gregorian']['dayNames'] ?? null;
        $this->assign(
            'days',
            [
                'wide' => $daysData && isset($daysData['format']['wide']) 
                    ? $this->encoder->encode(array_values(iterator_to_array($daysData['format']['wide'])))
                    : $this->encoder->encode([]), // Fallback to empty array if null
                'abbreviated' => $daysData && isset($daysData['format']['abbreviated']) 
                    ? $this->encoder->encode(array_values(iterator_to_array($daysData['format']['abbreviated'])))
                    : $this->encoder->encode([]), // Fallback to empty array if null
            ]
        );
    
        // Month names
        $monthsData = $localeData['calendar']['gregorian']['monthNames'] ?? null;
        $this->assign(
            'months',
            [
                'wide' => $monthsData && isset($monthsData['format']['wide']) 
                    ? $this->encoder->encode(array_values(iterator_to_array($monthsData['format']['wide'])))
                    : $this->encoder->encode([]), // Fallback to empty array if null
                'abbreviated' => $monthsData && isset($monthsData['format']['abbreviated']) 
                    ? $this->encoder->encode(array_values(iterator_to_array($monthsData['format']['abbreviated'])))
                    : $this->encoder->encode([]), // Fallback to empty array if null
            ]
        );
    
        // Other assignments remain unchanged...
    
        return parent::_toHtml();
    }

    /**
     * Return offset of current timezone with GMT in seconds
     *
     * @return int
     */
    public function getTimezoneOffsetSeconds()
    {
        return $this->_date->getGmtOffset();
    }

    /**
     * Getter for store timestamp based on store timezone settings
     *
     * @param null|string|bool|int|\Magento\Store\Model\Store $store
     * @return int
     */
    public function getStoreTimestamp($store = null)
    {
        return $this->_localeDate->scopeTimeStamp($store);
    }

    /**
     * Getter for yearRange option in datepicker
     *
     * @return string
     */
    public function getYearRange()
    {
        return (new \DateTime())->modify('- 100 years')->format('Y')
            . ':' . (new \DateTime())->modify('+ 100 years')->format('Y');
    }

    /**
     * Assign "fields" values from the ICU data
     *
     * @param \ResourceBundle $localeData
     */
    private function assignFieldsValues(\ResourceBundle $localeData): void
    {
        /**
         * Fields value in the current position has been added to ICU Data tables
         * starting with ICU library version 51.1.
         * Due to fact that we do not use these variables in templates, we do not initialize them for older versions
         *
         * @see https://github.com/unicode-org/icu/blob/release-50-2/icu4c/source/data/locales/en.txt
         * @see https://github.com/unicode-org/icu/blob/release-51-2/icu4c/source/data/locales/en.txt
         */
        if ($localeData->get('fields')) {
            $this->assign('today', $this->encoder->encode($localeData['fields']['day']['relative']['0']));
            $this->assign('week', $this->encoder->encode($localeData['fields']['week']['dn']));
        }
    }
}
