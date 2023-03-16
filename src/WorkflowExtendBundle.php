<?php

namespace Studio1\WorkflowExtendBundle;


use Pimcore\Extension\Bundle\AbstractPimcoreBundle;

class WorkflowExtendBundle extends AbstractPimcoreBundle
{
    /**
     * @return array|\Pimcore\Routing\RouteReferenceInterface[]|string[]
     */
    public function getJsPaths()
    {
        return [
            '/bundles/workflowextend/js/pimcore/configuration/item/transitionSettings.js'
        ];
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return 'This bundles extends pimcores workflow engine and workflow designer with additional features.';
    }

    /**
     * @return string
     */
    public function getNiceName()
    {
        return 'Workflow Extend';
    }

    /**
     * @return string
     */
    public function getVersion()
    {
        return '1.0.0';
    }
}