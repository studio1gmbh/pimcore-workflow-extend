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

    /*
    buildPermissionPanel: function() {
        this.permissionPanel = Ext.create('Ext.panel.Panel', {
            scrollable: true,
            tbar: {
                items: [
                    {
                        text: t('add'),
                        iconCls: 'pimcore_icon_add',
                        handler: function() {
                            this.collapseAll();
                            this.addItem({}, false, true);
                        }.bind(this)
                    }, '->', {
                        text: t('bundle_wfdesigner_place_permissions_collapse_all'),
                        iconCls: 'workflow_designer_icon_collapse',
                        handler: this.collapseAll.bind(this)
                    }
                ]
            },
        });

        return this.permissionPanel;
    },

    initPermissionPanel: function(permissions) {

        permissions.forEach(function(permission) {
            this.addItem(permission, true, false);
        }.bind(this));

    },

    collapseAll: function() {
        this.permissionPanel.items.items.forEach(function(item) {
            item.collapse(null, false);
        });
    },


    addItem: function(data, collapsed, scrollToBottom) {

        const item = Ext.create('Pimcore.WorkflowDesigner.StructuredValueForm', {
            bodyStyle: 'padding:10px;',
            collapsed : true,
            collapsible: true,
            titleCollapse: true,
            hideCollapseTool: true,
            headerOverCls: 'workflow_designer_cursor_pointer',
            cls: 'workflow_designer_settings_accordion_panel',
            collapsedCls: 'workflow_designer_collapsed',
            defaults: {
                labelWidth: 100
            },
            tools: [{
                type: 'close',
                cls: 'workflow_designer_icon_settings_accordion_panel_remove',
                handler: function(owner, tool, event) {
                    const ownerContainer = event.container.component.ownerCt;
                    ownerContainer.remove(event.container.component, true);
                    ownerContainer.updateLayout();
                }.bind(this)
            }],
        });

        item.add([
            {
                xtype: 'textfield',
                fieldLabel: t('bundle_wfdesigner_place_permissions_condition'),
                name: 'condition',
                value: data.condition,
                tooltip: t('bundle_wfdesigner_tooltip_place_permission_condition'),
                width: '100%',
                listeners: {
                    render: pimcore.bundle.workflowDesigner.tooltipDefinition.definition.listeners.render,
                    change: function(field, newValue) {
                        this.updatePermissionItemTitle(newValue, item);
                    }.bind(this)
                }
            },{
                xtype: 'panel',
                layout: 'column',
                items: [
                    {
                        xtype: 'panel',
                        columnWidth: 0.5,
                        items: [
                            this.getPermissionCheckbox('modify', data.modify),
                            this.getPermissionCheckbox('save', data.save),
                            this.getPermissionCheckbox('publish', data.publish),
                            this.getPermissionCheckbox('unpublish', data.unpublish),
                            this.getPermissionCheckbox('delete', data.delete),
                        ]
                    },{
                        xtype: 'panel',
                        columnWidth: 0.5,
                        items: [
                            this.getPermissionCheckbox('rename', data.rename),
                            this.getPermissionCheckbox('view', data.view),
                            this.getPermissionCheckbox('settings', data.settings),
                            this.getPermissionCheckbox('versions', data.versions),
                            this.getPermissionCheckbox('properties', data.properties),
                        ]
                    }
                ]
            },


            {
                xtype: 'textfield',
                fieldLabel: t('bundle_wfdesigner_place_permissions_object_layout'),
                name: 'objectLayout',
                value: data.objectLayout,
                tooltip: t('bundle_wfdesigner_tooltip_place_permission_object_layout'),
                listeners: {
                    render: pimcore.bundle.workflowDesigner.tooltipDefinition.definition.listeners.render,
                },
                width: '100%'
            },
        ]);

        this.updatePermissionItemTitle(data.condition, item);

        this.permissionPanel.add(item);

        if(collapsed) {
            item.collapse(null, false);
        } else {
            item.expand(false);
        }

        if(scrollToBottom) {
            this.mainPanel.getScrollable().scrollTo(0, 9999, false);
        }
    },

    getPermissionCheckbox: function (name, initValue) {
        return {
            xtype: 'combobox',
            fieldLabel: t('bundle_wfdesigner_place_permissions_' + name),
            name: name,
            store: Ext.data.ArrayStore({
                fields: ['type'],
                data: [
                    [null, t('bundle_wfdesigner_place_permissions_nc')],
                    [true, t('bundle_wfdesigner_place_permissions_yes')],
                    [false, t('bundle_wfdesigner_place_permissions_no')]
                ]
            }),
            value: initValue,
            displayField: 'type',
            valueField: 'type'
        };
    },

    updatePermissionItemTitle: function(condition, itemPanel) {
        let title = t('bundle_wfdesigner_place_permissions_title');
        if(condition && condition.length > 0) {

            title = title + t('bundle_wfdesigner_place_permissions_title_for') + condition;

        }
        itemPanel.setTitle(title);
    }
*/

});