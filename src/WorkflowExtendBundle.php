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

namespace Studio1\WorkflowExtendBundle;

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;

class WorkflowExtendBundle extends AbstractPimcoreBundle
{
    /**
     * Check if PimcoreWorkflowDesignerBundle is installed
     *
     * @return bool
     */
    private function isWorkflowDesignerBundleInstalled(): bool
    {
        $bundles = $this->container->getParameter('kernel.bundles');

        return isset($bundles['PimcoreWorkflowDesignerBundle']);
    }

    /**
     * @return array|\Pimcore\Routing\RouteReferenceInterface[]|string[]
     */
    public function getJsPaths()
    {
        if (!$this->isWorkflowDesignerBundleInstalled()) {
            return [];
        }

        return [
            '/bundles/workflowextend/js/pimcore/configuration/item/transitionSettings.js',
            '/bundles/workflowextend/js/pimcore/configuration/item/placeSettings.js',
        ];
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        $description = 'This bundles extends pimcores workflow engine ';
        if ($this->isWorkflowDesignerBundleInstalled()) {
            $description .= 'and workflow designer ';
        }
        $description .= 'with additional features.';

        return $description;
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
        return '1.1.0';
    }
}
