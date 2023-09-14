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
    public function getJsPaths(): array
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
     * @inheritDoc
     */
    public function getDescription(): string
    {
        $description = 'This bundles extends Pimcore\'s workflow engine ';
        if ($this->isWorkflowDesignerBundleInstalled()) {
            $description .= 'and workflow designer ';
        }
        $description .= 'with additional features.';

        return $description;
    }

    /**
     * @inheritDoc
     */
    public function getNiceName(): string
    {
        return 'Workflow Extend';
    }

    /**
     * @inheritDoc
     */
    public function getVersion(): string
    {
        return '2.0.0';
    }
}
