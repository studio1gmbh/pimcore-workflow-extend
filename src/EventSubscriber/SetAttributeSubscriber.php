<?php

/**
 * Studio1 Kommunikation GmbH
 *
 * This source file is available under following license:
 * - GNU General Public License v3.0 (GNU GPLv3)
 *
 * @copyright  Copyright (c) Studio1 Kommunikation GmbH (http://www.studio1.de)
 * @license    https://www.gnu.org/licenses/gpl-3.0.txt
 */

namespace Studio1\WorkflowExtendBundle\EventSubscriber;

use Exception;
use Pimcore\AssetMetadataClassDefinitionsBundle\Helper;
use Pimcore\AssetMetadataClassDefinitionsBundle\Model\Collections;
use Pimcore\AssetMetadataClassDefinitionsBundle\Model\Configuration\Dao;
use Pimcore\AssetMetadataClassDefinitionsBundle\Service;
use Pimcore\Model\Asset;
use Pimcore\Model\DataObject;
use Pimcore\Tool;
use Pimcore\Workflow\Transition;
use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Workflow\Event\Event;
use Symfony\Component\Workflow\Event\TransitionEvent;
use Symfony\Component\Workflow\Workflow;
use Symfony\Component\Workflow\WorkflowEvents;

/**
 * Class SetAttributeSubscriber
 */
class SetAttributeSubscriber implements EventSubscriberInterface
{
    private LoggerInterface $workflowExtendBundleLogger;
    private Transition $transition;
    private string $workflowName;
    private string $transitionName;
    private mixed $subject;

    /**
     * SetAttributeSubscriber constructor.
     *
     * @param LoggerInterface $workflowExtendBundleLogger
     */
    public function __construct(LoggerInterface $workflowExtendBundleLogger)
    {
        $this->workflowExtendBundleLogger = $workflowExtendBundleLogger;
    }

    /**
     * Subscribe to events
     *
     * @return string[]
     */
    public static function getSubscribedEvents(): array
    {
        return [
            WorkflowEvents::TRANSITION => 'onWorkflowTransition',
        ];
    }

    /**
     * Workflow transition event
     *
     * @param TransitionEvent $event
     *
     * @return void
     *
     * @throws Exception
     */
    public function onWorkflowTransition(TransitionEvent $event): void
    {
        // fetch metadata of the transition
        $this->transition = $event->getTransition();
        $this->subject = $event->getSubject();
        $this->workflowName = $event->getWorkflowName() ?? 'unknown';
        $this->transitionName = $event->getTransition()?->getOptions()['label'] ?? 'unknown';

        // only assets and objects are supported
        if (!($this->subject instanceof Asset) && !($this->subject instanceof DataObject\Concrete)) {
            return;
        }

        // check if transition has data, that needs to be set/changed
        $options = $this->transition?->getOptions() ?? [];
        $data = $options['data'] ?? [];
        if (empty($data)) {
            return;
        }

        // validate given data
        $class = $data['class'] ?? null;
        $attribute = $data['attribute'] ?? null;
        $languages = $data['languages'] ?? null;
        $languagesSetAll = $data['languagesSetAll'] ?? false;
        $value = $data['value'] ?? null;

        if (!empty($languages)) {
            // remove white spaces and explode string to array
            $languages = explode(',', str_replace(' ', '', $languages));
        } else {
            $languages = [];
        }

        // overwrite languages, if the user wants to set the value for all languages
        if ($languagesSetAll) {
            $languages = Tool::getValidLanguages();
        }

        if (empty($class)) {
            $this->log('Could not change data, no class given.', LogLevel::ERROR, true);

            return;
        }

        if (empty($attribute)) {
            $this->log('Could not change data, no attribute given.', LogLevel::ERROR, true);

            return;
        }

        try {
            if ($this->subject instanceof DataObject) {
                $this->handleObject($this->subject, $class, $attribute, $value, $languages);
            }

            if ($this->subject instanceof Asset) {
                $this->handleAsset($this->subject, $class, $attribute, $value, $languages);
            }
        } catch (Exception $e) {
            $this->log('Could not change data, Reason: ' . $e->getMessage(), LogLevel::ERROR, true);
        }
    }

    /**
     * Handles data objects in workflow transtion
     *
     * @param DataObject $dataObject
     * @param string $class
     * @param string $attribute
     * @param mixed $value
     * @param array $languages
     *
     * @return void
     *
     * @throws Exception
     */
    private function handleObject(DataObject $dataObject, string $class, string $attribute, mixed $value, array $languages = []): void
    {

        // check if dataobject class exists
        $dataObjectClass = DataObject\ClassDefinition::getByName($class);
        if (!$dataObjectClass) {
            throw new Exception('DataObject class "' . $class . '" does not exist.');
        }

        // generate the getter
        $setter = 'set' . ucfirst($attribute);
        // check if the attribute exists in the data object class
        if (!method_exists($dataObject, $setter)) {
            throw new Exception('Attribute "' . $attribute . '" does not exist in DataObject class "' . $class . '"');
        }

        // set value for dataobject
        if (!empty($languages)) {
            foreach ($languages as $language) {
                $dataObject->$setter($value, $language);
            }
        } else {
            $dataObject->$setter($value);
        }

        $dataObject->save(['versionNote' => 'Workflow: ' . $this->workflowName . ' - Transition: ' . $this->transitionName . ' (change attribute)']);
        $this->log('Changed data for object ' . $dataObject->getId() . ' in class "' . $class . '" for attribute "' . $attribute . '" to value ' . $value . '"', LogLevel::DEBUG);
    }

    /**
     * Handles assets in workflow transtion
     *
     * @param Asset $asset
     * @param string $class
     * @param string $attribute
     * @param mixed $value
     * @param array $languages
     *
     * @return void
     *
     * @throws Exception
     */
    private function handleAsset(Asset $asset, string $class, string $attribute, mixed $value, array $languages = []): void
    {
        // check if the metadata class exists
        $availableClasses = $this->getAvailableAssetMetaClasses();
        if (!in_array($class, array_keys($availableClasses))) {
            throw new Exception('Metadata class "' . $class . '" does not exist.');
        }

        // check if attribute exists in metadata class
        // name needs to passed as combination of class and attribute (e.g. 'Basic.Title')
        $fieldDefinition = Helper::getFieldDefinition($class . '.' . $attribute);
        if (empty($fieldDefinition)) {
            throw new Exception('Attribute "' . $attribute . '" does not exist in metadata class "' . $class . '"');
        }

        // fetch the type of the attribute
        $attributeType = $fieldDefinition->getFieldType();
        if (empty($attributeType)) {
            throw new Exception('Could not fetch type of attribute "' . $attribute . '" in class "' . $class . '"');
        }

        // check if metadata class is already asigned to the asset
        $classAssigned = false;
        $customSettings = $asset->getCustomSetting('plugin_assetmetdata_collections');
        if (!empty($asset->getCustomSetting('plugin_assetmetdata_collections'))) {
            foreach ($customSettings as $customSetting) {
                if ($customSetting === $class) {
                    $classAssigned = true;
                    break;
                }
            }
        }

        // add the class if needed
        if (!$classAssigned) {
            $collection = new Collections();
            $collection->setAssetId($asset->getId());
            $collection->setCollections([$class]);
            $collection->applyToAsset();
            $this->log('Added metadata class ' . $class . ' to asset ' . $asset->getId(), LogLevel::DEBUG);
            $asset->save(['versionNote' => 'Workflow: ' . $this->workflowName . ' - Transition: ' . $this->transitionName . '(add metadata class)']);
        }

        // set the attribute in meta data
        if (!empty($languages)) {
            foreach ($languages as $language) {
                $asset->addMetadata($class . '.' . $attribute, $attributeType, $value, $language);
            }
        } else {
            $asset->addMetadata($class . '.' . $attribute, $attributeType, $value);
        }

        $asset->save(['versionNote' => 'Workflow: ' . $this->workflowName . ' - Transition: ' . $this->transitionName . ' (change attribute)']);
        $this->log('Changed data for asset ' . $asset->getId() . ' in class ' . $class . ' for attribute ' . $attribute . ' to value ' . $value, LogLevel::DEBUG
        );
    }

    /**
     * Generic log function
     *
     * @param string $message
     * @param $loglevel
     * @param bool $throwError
     *
     * @return void
     *
     * @throws Exception
     */
    private function log(string $message, $loglevel = LogLevel::INFO, bool $throwError = false): void
    {
        $logInfo = "Workwlow: $this->workflowName, Transition: $this->transitionName: ";
        $this->workflowExtendBundleLogger->log($loglevel, $logInfo . $message);
        if ($throwError) {
            throw new Exception($logInfo . $message);
        }
    }

    /**
     * Fetch available metadata classes
     * inspired by vendor/pimcore/asset-metadata-class-definitions/src/Controller/BackendController.php
     *
     * @return array
     */
    private function getAvailableAssetMetaClasses(): array
    {
        $list = Dao::getList(true);
        $tree = [];

        // add configurations to their corresponding folder
        foreach ($list as $configuration) {
            $definitions = [];
            $localizedDefinitions = [];
            $layoutDefinitions = $configuration->getLayoutDefinitions();
            Service::extractDataDefinitions($layoutDefinitions, false, $definitions, $localizedDefinitions);
            Service::enrichDefinitions($definitions);
            Service::enrichDefinitions($localizedDefinitions);
            $tree[$configuration->getName()] = $configuration;
        }

        return $tree;
    }
}
