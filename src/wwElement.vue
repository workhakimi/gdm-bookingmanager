<template>
    <div class="booking-manager" :style="rootStyles">
        <!-- ═══════════ GLOBAL HEADER ═══════════ -->
        <div class="bm-global-header">
            <div class="bm-global-left">
                <h2 class="bm-title">Booking Manager</h2>
                <span class="bm-summary">{{ selectionSummary }}</span>
            </div>
            <div v-if="headers.length >= 2" class="bm-global-right">
                <button
                    class="bm-icon-btn bm-icon-btn--light"
                    :disabled="isLocked"
                    @click="toggleExpand('global', { type: 'global' })"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>
                </button>
            </div>
        </div>

        <!-- Global expand -->
        <div class="bm-expand-wrap" :class="{ 'is-open': expandedKey === 'global' }">
            <div class="bm-expand-overflow">
                <div v-if="shouldRender('global')" class="bm-expand-content bm-expand-bar">
                    <template v-if="expandPhase === 'actions'">
                        <div class="bm-expand-actions">
                            <button class="bm-action-btn" @click="startCombine">Combine Selected</button>
                        </div>
                    </template>
                    <template v-else-if="expandPhase === 'confirm'">
                        <div class="bm-expand-confirm">
                            <p class="bm-confirm-msg">{{ confirmMessage }}</p>
                            <div class="bm-expand-actions">
                                <button class="bm-secondary-btn" @click="cancelToActions">Cancel</button>
                                <button class="bm-action-btn" @click="executeConfirm">Confirm</button>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="bm-expand-status-row">
                            <span v-if="expandPhase === 'attempting'" class="bm-status-chip bm-status-chip--attempting">Attempting…</span>
                            <span v-else-if="expandPhase === 'succeeded'" class="bm-status-chip bm-status-chip--succeeded">Succeeded</span>
                            <template v-else-if="expandPhase === 'failed'">
                                <span class="bm-status-chip bm-status-chip--failed">{{ pendingAction?.errorMessage || 'Failed' }}</span>
                                <button class="bm-action-btn bm-action-btn--danger" @click="doRetry">Retry</button>
                                <button class="bm-secondary-btn" @click="dismissFailure">Dismiss</button>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- ═══════════ BODY ═══════════ -->
        <div class="bm-body">
            <div v-if="!resolvedHeaders.length" class="bm-empty">
                <svg class="bm-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 7h8M8 12h5"/></svg>
                <p>No bookings selected</p>
            </div>

            <div v-for="hdr in resolvedHeaders" :key="hdr.id" class="bm-card">
                <!-- Card header -->
                <div class="bm-card-head">
                    <div class="bm-card-info">
                        <div class="bm-card-top">
                            <span class="bm-bn">{{ hdr.bookingnumber }}</span>
                            <span class="bm-status-pill" :style="headerStatusStyle(hdr.status)">{{ hdr.status || '-' }}</span>
                        </div>
                        <div class="bm-card-title">{{ hdr.bookingtitle || '-' }}</div>
                        <div class="bm-card-meta">
                            <span>{{ hdr.picName }}</span>
                            <span class="bm-sep">·</span>
                            <span>{{ hdr.formattedDate }}</span>
                        </div>
                        <div class="bm-card-counts">{{ hdr.unique_skus ?? 0 }} Unique SKUs · {{ hdr.total_quantity ?? 0 }} Total Qty</div>
                    </div>
                    <button class="bm-icon-btn" :disabled="isLocked" @click="toggleExpand(`h:${hdr.id}`, { type: 'header', hdr })">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>
                    </button>
                </div>

                <!-- Header expand -->
                <div class="bm-expand-wrap" :class="{ 'is-open': expandedKey === `h:${hdr.id}` }">
                    <div class="bm-expand-overflow">
                        <div v-if="shouldRender(`h:${hdr.id}`)" class="bm-expand-content bm-expand-bar">
                            <template v-if="expandPhase === 'actions'">
                                <div class="bm-expand-actions">
                                    <button class="bm-action-btn" @click="startReleaseHeader">Release Booking</button>
                                </div>
                            </template>
                            <template v-else-if="expandPhase === 'confirm'">
                                <div class="bm-expand-confirm">
                                    <p class="bm-confirm-msg">{{ confirmMessage }}</p>
                                    <div class="bm-expand-actions">
                                        <button class="bm-secondary-btn" @click="cancelToActions">Cancel</button>
                                        <button class="bm-action-btn" @click="executeConfirm">Confirm</button>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="bm-expand-status-row">
                                    <span v-if="expandPhase === 'attempting'" class="bm-status-chip bm-status-chip--attempting">Attempting…</span>
                                    <span v-else-if="expandPhase === 'succeeded'" class="bm-status-chip bm-status-chip--succeeded">Succeeded</span>
                                    <template v-else-if="expandPhase === 'failed'">
                                        <span class="bm-status-chip bm-status-chip--failed">{{ pendingAction?.errorMessage || 'Failed' }}</span>
                                        <button class="bm-action-btn bm-action-btn--danger" @click="doRetry">Retry</button>
                                        <button class="bm-secondary-btn" @click="dismissFailure">Dismiss</button>
                                    </template>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Lines column header -->
                <div class="bm-lines-head">
                    <span class="bm-lh bm-lh-img"></span>
                    <span class="bm-lh bm-lh-product">Product</span>
                    <span class="bm-lh bm-lh-sku">SKU</span>
                    <span class="bm-lh bm-lh-avail">Avail</span>
                    <span class="bm-lh bm-lh-status">Status</span>
                    <span class="bm-lh bm-lh-qty">Qty</span>
                    <span class="bm-lh bm-lh-action"></span>
                </div>

                <!-- Line items -->
                <div v-for="item in hdr.items" :key="item._key" class="bm-line-wrap">
                    <div class="bm-line">
                        <div class="bm-l bm-l-img">
                            <img v-if="item.imagelink" :src="item.imagelink" :alt="item.sku" class="bm-product-img"/>
                            <div v-else class="bm-img-ph">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            </div>
                        </div>
                        <div class="bm-l bm-l-product">
                            <span class="bm-l-model">{{ item.model || 'Unknown' }}</span>
                            <span class="bm-l-variant">{{ [item.color, item.size].filter(Boolean).join(' · ') || '-' }}</span>
                        </div>
                        <div class="bm-l bm-l-sku">{{ item.sku }}</div>
                        <div class="bm-l bm-l-avail" :class="{ 'is-low': item.balance < 0, 'is-warning': item.balance >= 0 && item.balance <= 24 }">{{ item.balance }}</div>
                        <div class="bm-l bm-l-status">
                            <span class="bm-status-pill bm-status-pill--sm" :style="lineStatusStyle(item.status)">{{ item.status || '-' }}</span>
                        </div>
                        <div class="bm-l bm-l-qty">{{ item.quantity }}</div>
                        <div class="bm-l bm-l-action">
                            <button class="bm-icon-btn bm-icon-btn--sm" :disabled="isLocked" @click="toggleExpand(`l:${hdr.id}:${item._key}`, { type: 'line', hdr, item })">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Line expand -->
                    <div class="bm-expand-wrap" :class="{ 'is-open': expandedKey === `l:${hdr.id}:${item._key}` }">
                        <div class="bm-expand-overflow">
                            <div v-if="shouldRender(`l:${hdr.id}:${item._key}`)" class="bm-expand-content bm-expand-line">

                                <!-- Actions -->
                                <template v-if="expandPhase === 'actions'">
                                    <div class="bm-expand-actions">
                                        <button class="bm-action-btn" @click="startReleaseLine">Release Line</button>
                                        <button class="bm-action-btn" @click="startUpdateQty">Update Quantity</button>
                                    </div>
                                </template>

                                <!-- Confirm release -->
                                <template v-else-if="expandPhase === 'confirm'">
                                    <div class="bm-expand-confirm">
                                        <p class="bm-confirm-msg">{{ confirmMessage }}</p>
                                        <div class="bm-expand-actions">
                                            <button class="bm-secondary-btn" @click="cancelToActions">Cancel</button>
                                            <button class="bm-action-btn" @click="executeConfirm">Confirm</button>
                                        </div>
                                    </div>
                                </template>

                                <!-- Update quantity form -->
                                <template v-else-if="expandPhase === 'updateQty'">
                                    <div class="bm-inline-edit">
                                        <div class="bm-ie-header">
                                            <span class="bm-ie-model">{{ expandCtx?.item?.model || 'Unknown' }}</span>
                                            <span class="bm-ie-variant">{{ editVariant }}</span>
                                        </div>
                                        <span class="bm-ie-sku">{{ expandCtx?.item?.sku }}</span>
                                        <div class="bm-ie-row">
                                            <label class="bm-ie-label">New Qty</label>
                                            <input type="number" class="bm-ie-input" v-model.number="editQtyValue" min="0"/>
                                            <div class="bm-ie-avail" :class="{ 'is-neg': editAvailability < 0, 'is-warning': editAvailability >= 0 && editAvailability <= 24 && editQtyValue > 0, 'is-del': editQtyValue === 0 }">
                                                <template v-if="editQtyValue > 0">
                                                    Avail after: <strong>{{ editAvailability }}</strong>
                                                </template>
                                                <template v-else>Qty 0 = delete line</template>
                                            </div>
                                        </div>
                                        <p v-if="editAvailability < 0 && editQtyValue > 0" class="bm-ie-err">Cannot exceed available stock</p>
                                        <div class="bm-expand-actions">
                                            <button class="bm-secondary-btn" @click="cancelToActions">Cancel</button>
                                            <button v-if="editQtyValue > 0" class="bm-action-btn" :disabled="editAvailability < 0" @click="submitUpdateQty">Submit</button>
                                            <button v-else class="bm-action-btn bm-action-btn--danger" @click="submitDeleteViaQty">Delete Line Item</button>
                                        </div>
                                    </div>
                                </template>

                                <!-- Status -->
                                <template v-else>
                                    <div class="bm-expand-status-row">
                                        <span v-if="expandPhase === 'attempting'" class="bm-status-chip bm-status-chip--attempting">Attempting…</span>
                                        <span v-else-if="expandPhase === 'succeeded'" class="bm-status-chip bm-status-chip--succeeded">Succeeded</span>
                                        <template v-else-if="expandPhase === 'failed'">
                                            <span class="bm-status-chip bm-status-chip--failed">{{ pendingAction?.errorMessage || 'Failed' }}</span>
                                            <button class="bm-action-btn bm-action-btn--danger" @click="doRetry">Retry</button>
                                            <button class="bm-secondary-btn" @click="dismissFailure">Dismiss</button>
                                        </template>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="!hdr.items.length" class="bm-no-lines">No line items</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
});
const emit = defineEmits(['trigger-event']);

// ── Utilities ──────────────────────────────────────────────

function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let hours = d.getHours();
    const mins = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hours}:${mins}${ampm}`;
}

function cleanHeader(h) {
    return { id: h.id, bookingnumber: h.bookingnumber, created_at: h.created_at, bookingtitle: h.bookingtitle, pic_id: h.pic_id };
}

function cleanItem(item) {
    const c = { sku: item.sku, quantity: item.quantity, status: item.status };
    if (item.line_id) c.line_id = item.line_id;
    return c;
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// ── Data Resolution ────────────────────────────────────────

const referenceData = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.referenceData) || []);
const headers = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.selectedHeaders) || []);
const lineItems = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.selectedLineItems) || []);
const picReference = computed(() => wwLib.wwUtils.getDataFromCollection(props.content?.picReference) || []);
const stagingData = computed(() => {
    const raw = props.content?.stagingData;
    if (!raw) return null;
    const resolved = wwLib.wwUtils.getDataFromCollection(raw);
    if (Array.isArray(resolved)) return resolved[0] || null;
    return resolved;
});
const lineItemFK = computed(() => props.content?.lineItemHeaderKey || 'header_id');

// ── Status Color Maps ──────────────────────────────────────

const headerStatusColors = computed(() => {
    const raw = props.content?.headerStatusColorMap;
    return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
});
const lineItemStatusColors = computed(() => {
    const raw = props.content?.lineItemStatusColorMap;
    return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
});

function headerStatusStyle(status) {
    const bg = headerStatusColors.value[status];
    return bg ? { background: bg } : {};
}
function lineStatusStyle(status) {
    const bg = lineItemStatusColors.value[status];
    return bg ? { background: bg } : {};
}

// ── Memoized Lookups ───────────────────────────────────────

const refLookup = computed(() => {
    const map = {};
    referenceData.value.forEach(r => { map[r.sku] = r; });
    return map;
});

const picLookup = computed(() => {
    const map = {};
    picReference.value.forEach(p => { map[p.id] = p.name || p.display_name || String(p.id); });
    return map;
});

const headerItemsMap = computed(() => {
    const map = {};
    const fk = lineItemFK.value;
    lineItems.value.forEach(item => {
        const hid = item[fk];
        if (!hid) return;
        if (!map[hid]) map[hid] = [];
        map[hid].push(item);
    });
    return map;
});

// ── Resolved Headers ───────────────────────────────────────

const resolvedHeaders = computed(() =>
    headers.value.map(h => {
        const items = (headerItemsMap.value[h.id] || []).map(item => {
            const ref = refLookup.value[item.sku];
            return {
                ...item,
                _key: item.line_id || `${h.id}_${item.sku}`,
                model: ref?.model || null,
                color: ref?.color || null,
                size: ref?.size || null,
                imagelink: ref?.imagelink || ref?.image_link || null,
                balance: ref ? (Number(ref.balance) || 0) : 0,
            };
        });
        return { ...h, picName: picLookup.value[h.pic_id] || h.pic_id || '-', formattedDate: formatDate(h.created_at), items };
    })
);

// ── Selection Summary ──────────────────────────────────────

const selectionSummary = computed(() => {
    let unique = 0, total = 0;
    headers.value.forEach(h => { unique += Number(h.unique_skus) || 0; total += Number(h.total_quantity) || 0; });
    return `${unique} Unique, ${total} Total`;
});

// ── Root Styles ────────────────────────────────────────────

const rootStyles = computed(() => ({
    '--bm-card-bg': props.content?.cardBgColor || '#ffffff',
    '--bm-card-border': props.content?.cardBorderColor || '#e5e7eb',
    '--bm-card-radius': props.content?.cardBorderRadius || '8px',
    '--bm-header-bg': props.content?.headerBgColor || '#f9fafb',
    '--bm-line-bg': props.content?.lineBgColor || '#ffffff',
    '--bm-line-hover': props.content?.lineHoverColor || '#f3f4f6',
    '--bm-global-bg': props.content?.globalHeaderBgColor || '#111827',
    '--bm-global-text': props.content?.globalHeaderTextColor || '#ffffff',
    '--bm-font': props.content?.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    '--bm-font-size': props.content?.fontSize || '13px',
    '--bm-act-bg': props.content?.actionBtnColor || '#111827',
    '--bm-act-text': props.content?.actionBtnTextColor || '#ffffff',
    '--bm-act-hover': props.content?.actionBtnHoverColor || '#1f2937',
    '--bm-act-radius': props.content?.actionBtnRadius || '6px',
}));

// ── Expansion State ────────────────────────────────────────
// expandedKey: 'global' | 'h:<id>' | 'l:<headerId>:<itemKey>' | null
// expandPhase: 'actions' | 'confirm' | 'updateQty' | 'attempting' | 'succeeded' | 'failed'

const expandedKey = ref(null);
const expandPhase = ref('actions');
const expandCtx = ref(null);
const prevExpandedKey = ref(null);

watch(expandedKey, (_newKey, oldKey) => {
    if (oldKey) {
        prevExpandedKey.value = oldKey;
        setTimeout(() => { prevExpandedKey.value = null; }, 350);
    }
});

function shouldRender(key) {
    return key === expandedKey.value || key === prevExpandedKey.value;
}

function toggleExpand(key, ctx) {
    if (isLocked.value) return;
    if (expandedKey.value === key) {
        collapseExpand();
    } else {
        expandedKey.value = key;
        expandPhase.value = 'actions';
        expandCtx.value = ctx;
        editQtyValue.value = 0;
    }
}

function collapseExpand() {
    expandedKey.value = null;
    expandPhase.value = 'actions';
    expandCtx.value = null;
}

function cancelToActions() {
    expandPhase.value = 'actions';
}

// ── Pending Action (single, global lock) ───────────────────

const pendingAction = ref(null);
const isLocked = computed(() => !!pendingAction.value);

// ── Confirm State ──────────────────────────────────────────

const confirmMessage = ref('');
let pendingConfirmFn = null;

// ── Edit Qty State ─────────────────────────────────────────

const editQtyValue = ref(0);

/*
 * Inventory meaning 1 (balance = available after all bookings including this line):
 *   availability_after_update = balance + original_qty - desired_qty
 */
const editAvailability = computed(() => {
    if (!expandCtx.value?.item) return 0;
    const item = expandCtx.value.item;
    return (item.balance ?? 0) + (item.quantity ?? 0) - (editQtyValue.value ?? 0);
});

const editVariant = computed(() => {
    if (!expandCtx.value?.item) return '';
    return [expandCtx.value.item.color, expandCtx.value.item.size].filter(Boolean).join(' · ') || '';
});

// ── Action Initiators ──────────────────────────────────────

function startCombine() {
    const first = resolvedHeaders.value[0];
    if (!first) return;
    confirmMessage.value =
        `Combine all ${headers.value.length} bookings under:\n` +
        `${first.bookingnumber} — ${first.bookingtitle || '-'}`;
    pendingConfirmFn = doCombine;
    expandPhase.value = 'confirm';
}

function startReleaseHeader() {
    const hdr = expandCtx.value?.hdr;
    if (!hdr) return;
    confirmMessage.value = `Release booking ${hdr.bookingnumber} and all its line items?`;
    pendingConfirmFn = doReleaseHeader;
    expandPhase.value = 'confirm';
}

function startReleaseLine() {
    const ctx = expandCtx.value;
    if (!ctx?.item) return;
    confirmMessage.value = `Release ${ctx.item.sku} from booking ${ctx.hdr.bookingnumber}?`;
    pendingConfirmFn = doReleaseLine;
    expandPhase.value = 'confirm';
}

function startUpdateQty() {
    const ctx = expandCtx.value;
    if (!ctx?.item) return;
    editQtyValue.value = ctx.item.quantity ?? 0;
    expandPhase.value = 'updateQty';
}

function executeConfirm() {
    if (pendingConfirmFn) pendingConfirmFn();
    pendingConfirmFn = null;
}

// ── Dispatch Helpers ───────────────────────────────────────

function dispatch(payload) {
    const requestId = generateId();
    const stagingStatus = 'Sending';
    const updatedAt = new Date().toISOString();
    payload.request_id = requestId;
    payload.staging_status = stagingStatus;
    payload.updated_at = updatedAt;

    // updatequantity target: id (line_id), sku, request_id, staging_status, updated_at, new_quantity
    if (payload.action === 'updatequantity' && payload.target) {
        payload.target.request_id = requestId;
        payload.target.staging_status = stagingStatus;
        payload.target.updated_at = updatedAt;
    }

    pendingAction.value = {
        requestId,
        action: payload.action,
        headerId: payload.booking_header?.id,
        startedAt: Date.now(),
        payload: deepClone(payload),
        errorMessage: null,
    };

    expandPhase.value = 'attempting';

    /* wwEditor:start */
    if (props.wwEditorState?.isEditing) return;
    /* wwEditor:end */

    emit('trigger-event', { name: 'actionRequest', event: { value: payload } });
}

function doCombine() {
    const first = resolvedHeaders.value[0];
    const snapshotItems = resolvedHeaders.value.flatMap(h => (h.items || []).map(i => cleanItem(i)));
    dispatch({ action: 'combine_selected', is_edit: false, booking_header: cleanHeader(first), booking_items: snapshotItems });
}

function doReleaseHeader() {
    const hdr = expandCtx.value?.hdr;
    if (!hdr) return;
    const snapshotItems = (hdr.items || []).map(i => cleanItem(i));
    dispatch({ action: 'delete_header', is_edit: false, booking_header: cleanHeader(hdr), booking_items: snapshotItems });
}

function doReleaseLine() {
    const ctx = expandCtx.value;
    if (!ctx?.item) return;
    const snapshotItems = (ctx.hdr.items || []).map(i => cleanItem(i));
    dispatch({
        action: 'delete_lineitem', is_edit: false,
        booking_header: cleanHeader(ctx.hdr), booking_items: snapshotItems,
        target: { header_id: ctx.hdr.id, sku: ctx.item.sku, ...(ctx.item.line_id ? { line_id: ctx.item.line_id } : {}) },
    });
}

function submitUpdateQty() {
    if (editAvailability.value < 0) return;
    const ctx = expandCtx.value;
    if (!ctx?.item) return;
    const desiredQty = editQtyValue.value;
    const snapshotItems = (headerItemsMap.value[ctx.hdr.id] || []).map(i => {
        const c = cleanItem(i);
        if (i.sku === ctx.item.sku && (!ctx.item.line_id || i.line_id === ctx.item.line_id)) c.quantity = desiredQty;
        return c;
    });
    dispatch({
        action: 'updatequantity', is_edit: true,
        booking_header: cleanHeader(ctx.hdr), booking_items: snapshotItems,
        target: {
            id: ctx.item.line_id ?? null,
            sku: ctx.item.sku,
            new_quantity: desiredQty,
        },
    });
    // dispatch() adds request_id, staging_status, updated_at to target
}

function submitDeleteViaQty() {
    const ctx = expandCtx.value;
    if (!ctx?.item) return;
    const snapshotItems = (ctx.hdr.items || []).map(i => cleanItem(i));
    dispatch({
        action: 'delete_lineitem', is_edit: false,
        booking_header: cleanHeader(ctx.hdr), booking_items: snapshotItems,
        target: { header_id: ctx.hdr.id, sku: ctx.item.sku, ...(ctx.item.line_id ? { line_id: ctx.item.line_id } : {}) },
    });
}

// ── Retry & Dismiss ────────────────────────────────────────

function doRetry() {
    if (!pendingAction.value) return;
    const newId = generateId();
    const payload = deepClone(pendingAction.value.payload);
    payload.request_id = newId;
    payload.updated_at = new Date().toISOString();

    pendingAction.value.requestId = newId;
    pendingAction.value.startedAt = Date.now();
    pendingAction.value.errorMessage = null;
    pendingAction.value.payload = payload;
    expandPhase.value = 'attempting';

    /* wwEditor:start */
    if (props.wwEditorState?.isEditing) return;
    /* wwEditor:end */

    emit('trigger-event', { name: 'actionRequest', event: { value: payload } });
}

function dismissFailure() {
    pendingAction.value = null;
    collapseExpand();
}

// ── Staging Watcher ────────────────────────────────────────

watch(stagingData, (newVal) => {
    if (!newVal || !pendingAction.value) return;
    if (!newVal.action || !newVal.staging_status) return;
    if (newVal.staging_status === 'Sending') return;

    const pa = pendingAction.value;
    const actionMatch = newVal.action === pa.action;
    const headerMatch = newVal.booking_header?.id === pa.headerId;
    const reqMatch = !pa.requestId || !newVal.request_id || newVal.request_id === pa.requestId;

    if (actionMatch && headerMatch && reqMatch) {
        if (newVal.staging_status === 'Successful') {
            expandPhase.value = 'succeeded';
            setTimeout(() => {
                if (expandPhase.value === 'succeeded') {
                    pendingAction.value = null;
                    collapseExpand();
                }
            }, 3000);
        } else if (newVal.staging_status === 'Failed') {
            expandPhase.value = 'failed';
            pa.errorMessage = newVal.error_message || 'Action failed';
        }
    }
}, { deep: true });

// ── 60-second Timeout ──────────────────────────────────────

let timeoutInterval = null;

onMounted(() => {
    timeoutInterval = setInterval(() => {
        if (pendingAction.value && expandPhase.value === 'attempting') {
            if (Date.now() - pendingAction.value.startedAt > 60000) {
                expandPhase.value = 'failed';
                pendingAction.value.errorMessage = 'Timed out';
            }
        }
    }, 5000);
});

onUnmounted(() => {
    if (timeoutInterval) clearInterval(timeoutInterval);
});
</script>

<style lang="scss" scoped>
.booking-manager {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: var(--bm-font);
    font-size: var(--bm-font-size);
    color: #1f2937;
    line-height: 1.45;
    box-sizing: border-box;
    *, *::before, *::after { box-sizing: inherit; }
}

/* ── Global Header ────────────────────────────── */
.bm-global-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--bm-global-bg);
    color: var(--bm-global-text);
    flex-shrink: 0;
}
.bm-global-left { display: flex; align-items: baseline; gap: 12px; min-width: 0; }
.bm-title { margin: 0; font-size: 1.05em; font-weight: 600; white-space: nowrap; }
.bm-summary { font-size: 0.85em; opacity: 0.75; white-space: nowrap; }

/* ── Body ─────────────────────────────────────── */
.bm-body {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #f3f4f6;
}
.bm-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 16px; color: #9ca3af; text-align: center; gap: 8px; }
.bm-empty-icon { width: 40px; height: 40px; }

/* ── Card ─────────────────────────────────────── */
.bm-card {
    background: var(--bm-card-bg);
    border: 1px solid var(--bm-card-border);
    border-radius: var(--bm-card-radius);
    overflow: hidden;
}
.bm-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 12px 14px;
    background: var(--bm-header-bg);
    border-bottom: 1px solid var(--bm-card-border);
    gap: 12px;
}
.bm-card-info { flex: 1 1 auto; min-width: 0; }
.bm-card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.bm-bn { font-weight: 600; font-size: 0.95em; }
.bm-card-title { font-size: 0.9em; color: #374151; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bm-card-meta { font-size: 0.8em; color: #6b7280; display: flex; gap: 4px; flex-wrap: wrap; }
.bm-sep { color: #d1d5db; }
.bm-card-counts { font-size: 0.8em; color: #6b7280; margin-top: 4px; }

/* ── Status Pill ──────────────────────────────── */
.bm-status-pill { display: inline-block; padding: 1px 8px; border-radius: 9999px; font-size: 0.78em; font-weight: 500; background: #e5e7eb; color: #374151; white-space: nowrap; }
.bm-status-pill--sm { padding: 0 6px; font-size: 0.75em; }

/* ── Lines Grid ───────────────────────────────── */
.bm-lines-head, .bm-line {
    display: grid;
    grid-template-columns: 44px 1fr 110px 56px 76px 52px 36px;
    align-items: center;
    gap: 6px;
    padding: 4px 14px;
}
.bm-lines-head { border-bottom: 1px solid var(--bm-card-border); padding-top: 6px; padding-bottom: 6px; }
.bm-lh { font-size: 0.72em; font-weight: 600; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.04em; }
.bm-line-wrap { border-bottom: 1px solid #f3f4f6; &:last-child { border-bottom: none; } }
.bm-line {
    background: var(--bm-line-bg);
    padding-top: 6px;
    padding-bottom: 6px;
    transition: background 0.15s;
    &:hover { background: var(--bm-line-hover); }
}
.bm-no-lines { padding: 16px; text-align: center; color: #9ca3af; font-size: 0.85em; }

/* ── Line Cells ───────────────────────────────── */
.bm-l { min-width: 0; }
.bm-l-img { display: flex; align-items: center; justify-content: center; }
.bm-product-img { width: 36px; height: 36px; border-radius: 4px; object-fit: cover; }
.bm-img-ph { width: 36px; height: 36px; border-radius: 4px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #d1d5db; }
.bm-l-product { display: flex; flex-direction: column; gap: 1px; }
.bm-l-model { font-weight: 500; font-size: 0.9em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bm-l-variant { font-size: 0.78em; color: #6b7280; }
.bm-l-sku { font-size: 0.85em; font-family: monospace; color: #4b5563; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bm-l-avail { font-weight: 600; font-size: 0.9em; text-align: center; &.is-low { color: #dc2626; } &.is-warning { color: #ea580c; } }
.bm-l-status { text-align: center; }
.bm-l-qty { font-weight: 600; font-size: 0.9em; text-align: center; }
.bm-l-action { display: flex; justify-content: center; }

/* ── Icon Button ──────────────────────────────── */
.bm-icon-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border: none; border-radius: 6px;
    background: transparent; color: #6b7280; cursor: pointer;
    transition: background 0.15s, color 0.15s;
    &:hover:not(:disabled) { background: #e5e7eb; color: #111827; }
    &:disabled { opacity: 0.35; cursor: not-allowed; }
}
.bm-icon-btn--light { color: rgba(255,255,255,0.7); &:hover:not(:disabled) { background: rgba(255,255,255,0.15); color: #fff; } }
.bm-icon-btn--sm { width: 24px; height: 24px; }

/* ══════════════════════════════════════════════════
   EXPAND ANIMATION (grid-template-rows trick)
   ══════════════════════════════════════════════════ */
.bm-expand-wrap {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.3s ease;
}
.bm-expand-wrap.is-open {
    grid-template-rows: 1fr;
}
.bm-expand-overflow {
    overflow: hidden;
    min-height: 0;
}

/* ── Expand Content ───────────────────────────── */
.bm-expand-content {
    padding: 10px 14px;
}
.bm-expand-bar {
    background: #f9fafb;
    border-bottom: 1px solid var(--bm-card-border);
}
.bm-expand-line {
    background: #fafbfc;
    border-top: 1px solid #e5e7eb;
}

/* ── Expand: Actions (horizontal right-aligned buttons) ── */
.bm-expand-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

/* ── Expand: Confirm ──────────────────────────── */
.bm-expand-confirm {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.bm-confirm-msg {
    margin: 0;
    font-size: 0.9em;
    color: #374151;
    white-space: pre-line;
    line-height: 1.45;
}

/* ── Expand: Status row ───────────────────────── */
.bm-expand-status-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

/* ── Status Chips ─────────────────────────────── */
.bm-status-chip {
    display: inline-block;
    padding: 6px 16px;
    border-radius: var(--bm-act-radius);
    font-size: 0.88em;
    font-weight: 500;
    white-space: nowrap;
}
.bm-status-chip--attempting { background: #9ca3af; color: #fff; }
.bm-status-chip--succeeded { background: #16a34a; color: #fff; }
.bm-status-chip--failed { background: #fef2f2; color: #991b1b; }

/* ── Action Button (customizable) ─────────────── */
.bm-action-btn {
    padding: 7px 16px;
    border: none;
    border-radius: var(--bm-act-radius);
    font-size: 0.88em;
    font-weight: 500;
    cursor: pointer;
    background: var(--bm-act-bg);
    color: var(--bm-act-text);
    white-space: nowrap;
    transition: background 0.15s;
    &:hover:not(:disabled) { background: var(--bm-act-hover); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.bm-action-btn--danger {
    background: #dc2626;
    color: #fff;
    &:hover:not(:disabled) { background: #b91c1c; }
}

/* ── Secondary Button ─────────────────────────── */
.bm-secondary-btn {
    padding: 7px 16px;
    border: 1px solid #d1d5db;
    border-radius: var(--bm-act-radius);
    font-size: 0.88em;
    font-weight: 500;
    cursor: pointer;
    background: #fff;
    color: #374151;
    white-space: nowrap;
    transition: background 0.15s;
    &:hover { background: #f3f4f6; }
}

/* ── Inline Edit (Update Qty) ─────────────────── */
.bm-inline-edit {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.bm-ie-header {
    display: flex;
    gap: 6px;
    align-items: baseline;
}
.bm-ie-model { font-weight: 700; font-size: 0.95em; color: #111827; }
.bm-ie-variant { font-weight: 400; font-size: 0.9em; color: #111827; }
.bm-ie-sku { font-size: 0.82em; color: #9ca3af; }
.bm-ie-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}
.bm-ie-label { font-size: 0.82em; font-weight: 500; color: #6b7280; white-space: nowrap; }
.bm-ie-input {
    width: 80px;
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.95em;
    outline: none;
    &:focus { border-color: #6366f1; }
}
.bm-ie-avail {
    font-size: 0.85em;
    padding: 4px 10px;
    border-radius: 4px;
    background: #f0fdf4;
    color: #166534;
    &.is-neg { background: #fef2f2; color: #991b1b; }
    &.is-warning { background: #fff7ed; color: #c2410c; }
    &.is-del { background: #fef2f2; color: #991b1b; }
}
.bm-ie-err { margin: 0; font-size: 0.8em; color: #dc2626; font-weight: 500; }

/* ── Responsive ───────────────────────────────── */
@media (max-width: 640px) {
    .bm-lines-head, .bm-line { grid-template-columns: 36px 1fr 80px 44px 60px 40px 28px; gap: 4px; padding-left: 8px; padding-right: 8px; }
    .bm-product-img, .bm-img-ph { width: 28px; height: 28px; }
    .bm-global-header { padding: 10px 12px; }
    .bm-body { padding: 8px; gap: 8px; }
    .bm-card-head { padding: 10px; }
    .bm-expand-content { padding: 8px 10px; }
}
</style>
