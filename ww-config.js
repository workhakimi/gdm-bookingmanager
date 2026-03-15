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
                    'stagingData',
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
                    'headerBgColor',
                    'lineBgColor',
                    'lineHoverColor',
                    'globalHeaderBgColor',
                    'globalHeaderTextColor',
                    'kebabIconColor',
                ],
            },
            {
                label: 'Shape',
                isCollapsible: true,
                properties: ['cardBorderRadius'],
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
            name: 'actionRequest',
            label: { en: 'On Action Request' },
            event: {
                value: {
                    action: '',
                    staging_status: 'Sending',
                    is_edit: false,
                    updated_at: '',
                    request_id: '',
                    booking_header: {
                        id: '',
                        bookingnumber: '',
                        created_at: '',
                        bookingtitle: '',
                        pic_id: '',
                    },
                    booking_items: [],
                    target: null,
                    error_message: null,
                },
            },
            default: true,
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
        stagingData: {
            label: { en: 'Staging Variable' },
            type: 'ObjectList',
            section: 'settings',
            bindable: true,
            defaultValue: null,
            /* wwEditor:start */
            bindingValidation: {
                type: 'object',
                tooltip: 'Two-way staging variable. Shape: { action, staging_status, booking_header, booking_items, request_id?, error_message? }',
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
        headerBgColor: { label: { en: 'Card header background' }, type: 'Color', section: 'style', defaultValue: '#f9fafb' },
        lineBgColor: { label: { en: 'Line item background' }, type: 'Color', section: 'style', defaultValue: '#ffffff' },
        lineHoverColor: { label: { en: 'Line item hover' }, type: 'Color', section: 'style', defaultValue: '#f3f4f6' },
        globalHeaderBgColor: { label: { en: 'Global header background' }, type: 'Color', section: 'style', defaultValue: '#111827' },
        globalHeaderTextColor: { label: { en: 'Global header text' }, type: 'Color', section: 'style', defaultValue: '#ffffff' },
        kebabIconColor: { label: { en: 'Kebab icon color' }, type: 'Color', section: 'style', defaultValue: '#6b7280' },
        cardBorderRadius: {
            label: { en: 'Card border radius' },
            type: 'Text',
            section: 'style',
            defaultValue: '8px',
            options: { placeholder: '8px' },
        },
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
