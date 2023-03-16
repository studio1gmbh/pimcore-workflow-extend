/**
 * Created by PhpStorm.
 * User: jkoch
 * Date: 05.01.23
 * Time: 14:11
 */

/**
 * Extend the original transition settings panel
 * Source: workflow-designer/src/Resources/public/js/pimcore/configuration/item/transitionSettings.js
 *
 * Most of the code is copied from the original file, due to the fact that the original file is not extendable.
 * Changes are marked with "Studio1 start" and "Studio1 end".
 */

pimcore.registerNS("pimcore.plugin.studio1.workflowDesigner.item.transitionSettings");
pimcore.bundle.workflowDesigner.item.transitionSettings = Class.create(pimcore.bundle.workflowDesigner.item.transitionSettings, {

    initialize: function (transitionId, transitionData, callback) {

        const data = transitionData || {};
        data.options = data.options || {};
        data.options.notes = data.options.notes || {};
        data.options.notificationSettings = data.options.notificationSettings || [];
        // Studio1 start
        data.options.data = data.options.data || [];
        // Studio1 end

        this.window = new Ext.window.Window({
            title: t('bundle_wfdesigner_transition_settings'),
            modal: true,
            resizeable: false,
            layout: 'fit',
            width: 800,
            height: '90%',
            buttons: [
                {
                    text: t('apply'),
                    iconCls: 'pimcore_icon_apply',
                    handler: function () {
                        const values = this.generalFormPanel.getValues();
                        let notifications = [];

                        if (this.notificationsPanel) {
                            this.notificationsPanel.items.items.forEach(function (item) {
                                notifications.push(item.getValues());
                            });
                        } else {
                            notifications = data.options.notificationSettings;
                        }
                        values.options.notificationSettings = notifications;


                        if (callback) {
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

        this.userStore = new Ext.data.Store({
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: Routing.generate('pimcore_wf_user_search'),
                reader: {
                    type: 'json',
                    rootProperty: 'users'
                }
            },
            fields: ['id', 'name', 'email', 'firstname', 'lastname']
        });

        this.rolesStore = new Ext.data.Store({
            autoLoad: true,
            proxy: {
                type: 'ajax',
                url: Routing.generate('pimcore_wf_role_search'),
                reader: {
                    type: 'json',
                    rootProperty: 'roles'
                }
            },
            fields: ['id', 'name']
        });


        const user = pimcore.globalmanager.get('user');
        if (user.isAllowed('permission_workflow_designer_trans_notifications')) {
            this.initNotificationsPanel(data.options.notificationSettings);
        }
        this.window.show();

    },

    getFormPanel: function (transitionData) {

        const notesPanel = Ext.create('Ext.panel.Panel', {
            defaults: {
                labelWidth: 130,
                listeners: pimcore.bundle.workflowDesigner.tooltipDefinition.definition.listeners
            },
            hidden: !transitionData.options.notes.commentEnabled,
            items: [
                {
                    xtype: 'checkbox',
                    name: 'options.notes.commentRequired',
                    value: transitionData.options.notes.commentRequired,
                    inputValue: true,
                    uncheckedValue: false,
                    tooltip: t('bundle_wfdesigner_tooltip_transition_notes_required'),
                    fieldLabel: t('bundle_wfdesigner_notes_comment_required'),
                }, {
                    xtype: 'textfield',
                    fieldLabel: t('bundle_wfdesigner_notes_comment_type'),
                    name: 'options.notes.type',
                    value: transitionData.options.notes.type || 'Status update',
                    tooltip: t('bundle_wfdesigner_tooltip_transition_notes_type'),
                    width: 540
                }, {
                    xtype: 'textfield',
                    fieldLabel: t('bundle_wfdesigner_notes_comment_title'),
                    name: 'options.notes.title',
                    value: transitionData.options.notes.title,
                    tooltip: t('bundle_wfdesigner_tooltip_transition_notes_title'),
                    width: 540
                }, {
                    xtype: 'textfield',
                    fieldLabel: t('bundle_wfdesigner_notes_comment_setter_fn'),
                    name: 'options.notes.commentSetterFn',
                    tooltip: t('bundle_wfdesigner_tooltip_transition_notes_comment_setter'),
                    value: transitionData.options.notes.commentSetterFn,
                    width: 540
                }, {
                    xtype: 'textfield',
                    fieldLabel: t('bundle_wfdesigner_notes_comment_getter_fn'),
                    name: 'options.notes.commentGetterFn',
                    tooltip: t('bundle_wfdesigner_tooltip_transition_notes_comment_getter'),
                    value: transitionData.options.notes.commentGetterFn,
                    width: 540
                }
            ]

        });


        this.generalFormPanel = Ext.create('Pimcore.WorkflowDesigner.StructuredValueForm', {
            border: false,
            frame: false,
            items: [
                {
                    xtype: 'fieldset',
                    width: '100%',
                    title: t('bundle_wfdesigner_general'),
                    defaults: {
                        labelWidth: 130,
                        listeners: pimcore.bundle.workflowDesigner.tooltipDefinition.definition.listeners
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: t('label'),
                            name: 'options.label',
                            value: transitionData.options.label,
                            tooltip: t('bundle_wfdesigner_tooltip_transition_name'),
                            width: 540
                        }, {
                            xtype: 'textfield',
                            fieldLabel: t('bundle_wfdesigner_transition_guard'),
                            name: 'guard',
                            value: transitionData.guard,
                            tooltip: t('bundle_wfdesigner_tooltip_transition_guard'),
                            width: 540
                        }, {
                            xtype: 'textfield',
                            fieldLabel: t('bundle_wfdesigner_transition_icon_class'),
                            name: 'options.iconClass',
                            value: transitionData.options.iconClass,
                            tooltip: t('bundle_wfdesigner_tooltip_transition_icon_class'),
                            width: 540
                        }, {
                            xtype: 'textfield',
                            fieldLabel: t('bundle_wfdesigner_transition_object_layout'),
                            name: 'options.objectLayout',
                            value: transitionData.options.objectLayout,
                            tooltip: t('bundle_wfdesigner_tooltip_transition_object_layout'),
                            width: 540
                        }, {
                            xtype: 'combobox',
                            fieldLabel: t('bundle_wfdesigner_transition_change_published_state'),
                            name: 'options.changePublishedState',
                            tooltip: t('bundle_wfdesigner_tooltip_transition_change_published_state'),
                            width: 350,
                            store: [
                                ['no_change', t('bundle_wfdesigner_transition_no_change')],
                                ['force_unpublished', t('bundle_wfdesigner_transition_force_unpublished')],
                                ['force_published', t('bundle_wfdesigner_transition_force_published')],
                                ['save_version', t('bundle_wfdesigner_transition_save_version')],
                            ],
                            value: transitionData.options.changePublishedState || 'no_change'
                        }
                    ]
                }, {
                    xtype: 'fieldset',
                    width: '100%',
                    collapsible: false,
                    title: t('bundle_wfdesigner_notes'),
                    defaults: {
                        labelWidth: 130,
                        listeners: pimcore.bundle.workflowDesigner.tooltipDefinition.definition.listeners
                    },
                    items: [
                        {
                            xtype: 'checkbox',
                            name: 'options.notes.commentEnabled',
                            value: transitionData.options.notes.commentEnabled,
                            inputValue: true,
                            uncheckedValue: false,
                            tooltip: t('bundle_wfdesigner_tooltip_transition_notes_enabled'),
                            fieldLabel: t('bundle_wfdesigner_notes_comment_enabled'),
                            listeners: {
                                render: pimcore.bundle.workflowDesigner.tooltipDefinition.definition.listeners.render,
                                change: function (field, newValue) {
                                    if (newValue === true) {
                                        notesPanel.show();
                                    } else {
                                        notesPanel.hide();
                                    }
                                    this.mainPanel.updateLayout();
                                }.bind(this)
                            }
                        },
                        notesPanel
                    ]
                }, {
                    // Studio1 Start
                    // Add data panel, to select configure data to set during transition
                    xtype: 'fieldset',
                    width: '100%',
                    collapsible: true,
                    title: t('bundle_workflow_extend_data_heading'),
                    defaults: {
                        labelWidth: 130,
                        listeners: pimcore.bundle.workflowDesigner.tooltipDefinition.definition.listeners
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: t('bundle_workflow_extend_data_class'),
                            name: 'options.data.class',
                            value: transitionData.options.data.class,
                            tooltip: t('bundle_workflow_extend_data_class_tooltip'),
                            allowBlank: false,
                            width: 540
                        }, {
                            xtype: 'textfield',
                            fieldLabel: t('bundle_workflow_extend_data_attribute'),
                            name: 'options.data.attribute',
                            value: transitionData.options.data.attribute,
                            tooltip: t('bundle_workflow_extend_data_attribute_tooltip'),
                            allowBlank: false,
                            width: 540
                        }, {
                            xtype: 'textfield',
                            fieldLabel: t('bundle_workflow_extend_data_value'),
                            name: 'options.data.value',
                            value: transitionData.options.data.value,
                            tooltip: t('bundle_workflow_extend_data_value_tooltip'),
                            width: 540
                        }, {
                            xtype: 'textfield',
                            fieldLabel: t('bundle_workflow_extend_data_languages'),
                            name: 'options.data.languages',
                            value: transitionData.options.data.languages,
                            tooltip: t('bundle_workflow_extend_data_languages_tooltip'),
                            width: 540
                        }, {
                            xtype: 'checkbox',
                            fieldLabel: t('bundle_workflow_extend_data_languages_set_all'),
                            name: 'options.data.languagesSetAll',
                            value: transitionData.options.data.languagesSetAll,
                            inputValue: true,
                            uncheckedValue: false,
                            tooltip: t('bundle_workflow_extend_data_languages_set_all_tooltip')
                        }
                    ]
                    // Studio1 End
                }
            ]
        });

        const items = [
            this.generalFormPanel
        ];

        const user = pimcore.globalmanager.get('user');
        if (user.isAllowed('permission_workflow_designer_trans_notifications')) {
            items.push({
                xtype: 'fieldset',
                width: '100%',
                collapsible: true,
                title: t('bundle_wfdesigner_transition_notifications'),
                items: [
                    this.buildNotificationsPanel()
                ]
            });
        }

        this.mainPanel = Ext.create('Ext.panel.Panel', {
            border: false,
            frame: false,
            bodyStyle: 'padding:10px',
            items: items,
            labelWidth: 130,
            collapsible: false,
            autoScroll: true
        });

        return this.mainPanel;
    }
});
