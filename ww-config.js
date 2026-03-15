export default {
    editor: {
        label: { en: 'Booking Manager' },
        icon: 'data',
        customSettingsPropertiesOrder: [
            {
                label: 'Data Sources',
                isCollapsible: true,
                properties: [
                    'referenceData',
                    'selectedHeaders',
                    'selectedLineItems',
                    'picReference',
                    'actionResult',
                ],
            },
            {
                label: 'Field Mapping',
                isCollapsible: true,
                properties: ['lineItemHeaderKey'],
            },
            {
                label: 'Status Colors',
                isCollapsible: true,
                properties: ['headerStatusColorMap', 'lineItemStatusColorMap'],
            },
        ],
        customStylePropertiesOrder: [
            {
                label: 'Colors',
                isCollapsible: true,
                properties: [
                    'cardBgColor',
                    'cardBorderColor',
                    'lineBgColor',
                    'lineHoverColor',
                    'kebabIconColor',
                ],
            },
            {
                label: 'Action Buttons',
                isCollapsible: true,
                properties: [
                    'actionBtnColor',
                    'actionBtnTextColor',
                    'actionBtnHoverColor',
                    'actionBtnRadius',
                ],
            },
            {
                label: 'Typography',
                isCollapsible: true,
                properties: ['fontFamily', 'fontSize'],
            },
        ],
    },
    triggerEvents: [
        {
            name: 'onDeleteHeader',
            label: { en: 'On Delete Header' },
            event: {
                value: {
                    updated_at: '',
                    booking_header: { id: '' },
                    booking_items: [],
                },
            },
        },
        {
            name: 'onDeleteLineItem',
            label: { en: 'On Delete Line Item' },
            event: {
                value: {
                    updated_at: '',
                    booking_header: { id: '' },
                    booking_items: [],
                },
            },
        },
        {
            name: 'onUpdateQuantity',
            label: { en: 'On Update Quantity' },
            event: {
                value: {
                    updated_at: '',
                    booking_header: { id: '' },
                    booking_items: [],
                },
            },
        },
    ],
    actions: [],
    properties: {
        referenceData: {
            label: { en: 'SKU Reference Data' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of SKU objects: { sku, type, model, color, size, tags, snt, booked, balance, imagelink }',
            },
            /* wwEditor:end */
        },
        selectedHeaders: {
            label: { en: 'Selected Booking Headers' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of booking header objects: { id, bookingnumber, created_at, bookingtitle, pic_id, status, unique_skus, total_quantity }',
            },
            /* wwEditor:end */
        },
        selectedLineItems: {
            label: { en: 'Selected Booking Line Items' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Flat array of line items: { header_id, sku, quantity, status, line_id? }',
            },
            /* wwEditor:end */
        },
        picReference: {
            label: { en: 'PIC Reference Data' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: [],
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of PIC objects: { id, name } to resolve pic_id to display name',
            },
            /* wwEditor:end */
        },
        actionResult: {
            label: { en: 'Action Result Variable' },
            type: 'Text',
            section: 'settings',
            bindable: true,
            defaultValue: null,
            /* wwEditor:start */
            bindingValidation: {
                type: 'string',
                tooltip: 'Bind a variable: null = idle, "successful" = success, "failed" = failure. Set by your workflow after processing an event.',
            },
            /* wwEditor:end */
        },
        lineItemHeaderKey: {
            label: { en: 'Line Item Header Key' },
            type: 'Text',
            section: 'settings',
            defaultValue: 'header_id',
            options: { placeholder: 'header_id' },
            /* wwEditor:start */
            propertyHelp: { tooltip: 'The field in line items that references the booking header id (e.g. header_id, headerid).' },
            /* wwEditor:end */
        },
        headerStatusColorMap: {
            label: { en: 'Header status color map (JSON)' },
            type: 'RawObject',
            section: 'settings',
            bindable: true,
            defaultValue: {
                'Booked': '#dbeafe',
                'Issue Raised': '#fee2e2',
                'Processing': '#fef9c3',
                'Delivered to Production': '#f3e8ff',
                'Delivered to Client': '#dcfce7',
                'Released': '#f3f4f6',
            },
            options: { placeholder: '{ "Booked": "#dbeafe", "Released": "#f3f4f6" }' },
            /* wwEditor:start */
            bindingValidation: { type: 'object', tooltip: 'Map of header status value to CSS background color' },
            /* wwEditor:end */
        },
        lineItemStatusColorMap: {
            label: { en: 'Line item status color map (JSON)' },
            type: 'RawObject',
            section: 'settings',
            bindable: true,
            defaultValue: {
                'Booked': '#dbeafe',
                'Issue Raised': '#fee2e2',
                'Processing': '#fef9c3',
                'Delivered to Production': '#f3e8ff',
                'Delivered to Client': '#dcfce7',
                'Released': '#f3f4f6',
            },
            options: { placeholder: '{ "Booked": "#dbeafe", "Released": "#f3f4f6" }' },
            /* wwEditor:start */
            bindingValidation: { type: 'object', tooltip: 'Map of line item status value to CSS background color' },
            /* wwEditor:end */
        },

        cardBgColor: { label: { en: 'Card background' }, type: 'Color', section: 'style', defaultValue: '#ffffff' },
        cardBorderColor: { label: { en: 'Card border' }, type: 'Color', section: 'style', defaultValue: '#e5e7eb' },
        lineBgColor: { label: { en: 'Line item background' }, type: 'Color', section: 'style', defaultValue: '#ffffff' },
        lineHoverColor: { label: { en: 'Line item hover' }, type: 'Color', section: 'style', defaultValue: '#f0f7ff' },
        kebabIconColor: { label: { en: 'Kebab icon color' }, type: 'Color', section: 'style', defaultValue: '#6b7280' },
        actionBtnColor: {
            label: { en: 'Action button color' },
            type: 'Color',
            section: 'style',
            defaultValue: '#111827',
        },
        actionBtnTextColor: {
            label: { en: 'Action button text' },
            type: 'Color',
            section: 'style',
            defaultValue: '#ffffff',
        },
        actionBtnHoverColor: {
            label: { en: 'Action button hover' },
            type: 'Color',
            section: 'style',
            defaultValue: '#1f2937',
        },
        actionBtnRadius: {
            label: { en: 'Action button radius' },
            type: 'Text',
            section: 'style',
            defaultValue: '6px',
            options: { placeholder: '6px' },
        },
        fontFamily: {
            label: { en: 'Font family' },
            type: 'FontFamily',
            section: 'style',
            defaultValue: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        fontSize: {
            label: { en: 'Base font size' },
            type: 'Length',
            section: 'style',
            responsive: true,
            defaultValue: '13px',
            options: { unitChoices: [{ value: 'px', label: 'px', min: 10, max: 20 }] },
        },
    },
};
