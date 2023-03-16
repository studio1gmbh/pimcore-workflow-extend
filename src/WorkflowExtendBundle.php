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
