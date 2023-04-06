/**
 * Created by PhpStorm.
 * User: akriebisch
 * Date: 06.04.23
 * Time: 09:10
 */

/**
 * Extend the original place settings panel
 * @see workflow-designer/src/Resources/public/js/pimcore/configuration/item/placeSettings.js
 *
 * Most of the code is copied from the original file, due to the fact that the original file is not extendable.
 * Changes are marked with "Studio1 start" and "Studio1 end".
 */

pimcore.registerNS('pimcore.plugin.studio1.workflowDesigner.item.placeSettings');
pimcore.bundle.workflowDesigner.item.placeSettings = Class.create(pimcore.bundle.workflowDesigner.item.placeSettings, {


    initialize: function(placeId, placeData, callback) {

        // Studio1 start
        placeData.id = placeId;
        // Studio1 end
        const data = placeData || {};
        placeData.permissions = placeData.permissions || [];

        this.window = new Ext.window.Window({
            title: t('bundle_wfdesigner_place_settings'),
            modal: true,
            resizeable: false,
            layout: 'fit',
            width: 800,
            height: '90%',
            autoScroll: true,
            buttons: [
                {
                    text: t('apply'),
                    iconCls: 'pimcore_icon_apply',
                    handler: function(){
                        const values = this.generalFormPanel.getValues();
                        let permissions = [];

                        if(this.permissionPanel) {
                            this.permissionPanel.items.items.forEach(function(item) {
                                permissions.push(item.getValues());
                            });
                        } else {
                            permissions = placeData.permissions;
                        }

                        values.permissions = permissions;

                        if(callback) {
                            callback(values);
                        }

                        this.window.hide();
                        this.window.destroy();

                    }.bind(this)
                }
            ],
            items: [
                this.getFormPanel(data)
            ]
        });

        const user = pimcore.globalmanager.get('user');
        if(user.isAllowed('permission_workflow_designer_place_permissions')) {
            this.initPermissionPanel(placeData.permissions);
        }
        this.window.show();
    },

    getFormPanel: function(placeData) {
        this.generalFormPanel = Ext.create('Pimcore.WorkflowDesigner.StructuredValueForm', {
            defaults: {
                labelWidth: 180,
                listeners: pimcore.bundle.workflowDesigner.tooltipDefinition.definition.listeners
            },
            items: [
                // Studio1 start
                {
                    xtype: 'textfield',
                    fieldLabel: t('id'),
                    name: '__ignore_name',
                    value: placeData.id,
                    readOnly: true,
                    width: 540,
                }, {
                // Studio1 end
                    xtype: 'textfield',
                    fieldLabel: t('label'),
                    name: 'label',
                    value: placeData.label,
                    width: 540,
                    tooltip: t('bundle_wfdesigner_tooltip_place_name')
                },{
                    xtype: 'textfield',
                    fieldLabel: t('title'),
                    name: 'title',
                    value: placeData.title,
                    width: 540,
                    tooltip: t('bundle_wfdesigner_tooltip_place_title')
                },{
                    xtype: 'checkbox',
                    name: 'visibleInHeader',
                    value: placeData.hasOwnProperty('visibleInHeader') ? placeData.visibleInHeader : true,
                    inputValue: true,
                    uncheckedValue: false,
                    fieldLabel: t('bundle_wfdesigner_place_visibleInHeader'),
                    tooltip: t('bundle_wfdesigner_tooltip_place_visibleInHeader')
                },{
                    xtype: 'colorfield',
                    name: 'color',
                    value: (placeData.color) ? placeData.color : '000000',
                    fieldLabel: t('color'),
                    tooltip: t('bundle_wfdesigner_tooltip_place_color')
                },{
                    xtype: 'checkbox',
                    name: 'colorInverted',
                    value: placeData.colorInverted,
                    inputValue: true,
                    uncheckedValue: false,
                    fieldLabel: t('bundle_wfdesigner_place_colorInverted'),
                    tooltip: t('bundle_wfdesigner_tooltip_place_colorInverted')
                }
            ]
        });

        const items = [{
            xtype: 'fieldset',
            width: '100%',
            title: t('bundle_wfdesigner_general'),
            items: [
                this.generalFormPanel
            ]
        }];

        const user = pimcore.globalmanager.get('user');
        if(user.isAllowed('permission_workflow_designer_place_permissions')) {
            items.push({
                xtype: 'fieldset',
                width: '100%',
                collapsible: true,
                title: t('bundle_wfdesigner_place_permissions'),
                items: [
                    {
                        xtype: 'displayfield',
                        value: t('bundle_wfdesigner_tooltip_place_permissions')
                    },
                    this.buildPermissionPanel()
                ]
            });
        }

        this.mainPanel = Ext.create('Ext.panel.Panel', {
            border: false,
            frame:false,
            bodyStyle: 'padding:10px',
            items: items,
            labelWidth: 130,
            collapsible: false,
            autoScroll: true
        });

        return this.mainPanel;
    },

});