<template>
    <div class="booking-manager" :style="rootStyles">
        <!-- ═══════════ GLOBAL HEADER ═══════════ -->
        <div class="bm-global-header">
            <div class="bm-global-left">
                <h2 class="bm-title">Booking Manager</h2>
                <span class="bm-summary">{{ selectionSummary }}</span>
            </div>
            <div class="bm-global-right">
                <div v-if="headers.length >= 2" class="bm-menu-wrap">
                    <button class="bm-icon-btn bm-icon-btn--light" @click.stop="toggleMenu('global')">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="3" r="1.5" />
                            <circle cx="8" cy="8" r="1.5" />
                            <circle cx="8" cy="13" r="1.5" />
                        </svg>
                    </button>
                    <transition name="bm-drop">
                        <div v-if="openMenu === 'global'" class="bm-dropdown">
                            <button
                                class="bm-dd-item"
                                :class="actionBtnClasses(combineKey)"
                                :disabled="getButtonState(combineKey) === 'attempting'"
                                @click="onCombineClick"
                            >
                                {{ getButtonLabel(combineKey, 'Combine Selected') }}
                            </button>
                        </div>
                    </transition>
                </div>
            </div>
        </div>

        <!-- ═══════════ BODY ═══════════ -->
        <div class="bm-body">
            <div v-if="!resolvedHeaders.length" class="bm-empty">
                <svg class="bm-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="18" rx="2" />
                    <path d="M8 7h8M8 12h5" />
                </svg>
                <p>No bookings selected</p>
            </div>

            <div v-for="hdr in resolvedHeaders" :key="hdr.id" class="bm-card">
                <!-- Card header -->
                <div class="bm-card-head">
                    <div class="bm-card-info">
                        <div class="bm-card-top">
                            <span class="bm-bn">{{ hdr.bookingnumber }}</span>
                            <span class="bm-status-pill">{{ hdr.status || '-' }}</span>
                        </div>
                        <div class="bm-card-title">{{ hdr.bookingtitle || '-' }}</div>
                        <div class="bm-card-meta">
                            <span>{{ hdr.picName }}</span>
                            <span class="bm-sep">·</span>
                            <span>{{ hdr.formattedDate }}</span>
                        </div>
                        <div class="bm-card-counts">
                            {{ hdr.unique_skus ?? 0 }} Unique SKUs · {{ hdr.total_quantity ?? 0 }} Total Qty
                        </div>
                    </div>
                    <div class="bm-menu-wrap">
                        <button class="bm-icon-btn" @click.stop="toggleMenu(`h:${hdr.id}`)">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="8" cy="3" r="1.5" />
                                <circle cx="8" cy="8" r="1.5" />
                                <circle cx="8" cy="13" r="1.5" />
                            </svg>
                        </button>
                        <transition name="bm-drop">
                            <div v-if="openMenu === `h:${hdr.id}`" class="bm-dropdown">
                                <button
                                    class="bm-dd-item"
                                    :class="actionBtnClasses(`delete_header:${hdr.id}`)"
                                    :disabled="getButtonState(`delete_header:${hdr.id}`) === 'attempting'"
                                    @click="onDeleteHeaderClick(hdr)"
                                >
                                    {{ getButtonLabel(`delete_header:${hdr.id}`, 'Release Booking') }}
                                </button>
                            </div>
                        </transition>
                    </div>
                </div>

                <!-- Line items column header -->
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
                <div v-for="item in hdr.items" :key="item._key" class="bm-line">
                    <div class="bm-l bm-l-img">
                        <img v-if="item.imagelink" :src="item.imagelink" :alt="item.sku" class="bm-product-img" />
                        <div v-else class="bm-img-ph">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M21 15l-5-5L5 21" />
                            </svg>
                        </div>
                    </div>
                    <div class="bm-l bm-l-product">
                        <span class="bm-l-model">{{ item.model || 'Unknown' }}</span>
                        <span class="bm-l-variant">{{ [item.color, item.size].filter(Boolean).join(' · ') || '-' }}</span>
                    </div>
                    <div class="bm-l bm-l-sku">{{ item.sku }}</div>
                    <div class="bm-l bm-l-avail" :class="{ 'is-low': item.balance <= 0 }">{{ item.balance }}</div>
                    <div class="bm-l bm-l-status">
                        <span class="bm-status-pill bm-status-pill--sm">{{ item.status || '-' }}</span>
                    </div>
                    <div class="bm-l bm-l-qty">{{ item.quantity }}</div>
                    <div class="bm-l bm-l-action">
                        <div class="bm-menu-wrap">
                            <button class="bm-icon-btn bm-icon-btn--sm" @click.stop="toggleMenu(`l:${hdr.id}:${item._key}`)">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                    <circle cx="8" cy="3" r="1.5" />
                                    <circle cx="8" cy="8" r="1.5" />
                                    <circle cx="8" cy="13" r="1.5" />
                                </svg>
                            </button>
                            <transition name="bm-drop">
                                <div v-if="openMenu === `l:${hdr.id}:${item._key}`" class="bm-dropdown bm-dropdown--right">
                                    <button
                                        class="bm-dd-item"
                                        :class="actionBtnClasses(`delete_lineitem:${hdr.id}:${item.sku}`)"
                                        :disabled="getButtonState(`delete_lineitem:${hdr.id}:${item.sku}`) === 'attempting'"
                                        @click="onDeleteLineClick(hdr, item)"
                                    >
                                        {{ getButtonLabel(`delete_lineitem:${hdr.id}:${item.sku}`, 'Release Line') }}
                                    </button>
                                    <button
                                        class="bm-dd-item"
                                        :class="actionBtnClasses(`updatequantity:${hdr.id}:${item.sku}`)"
                                        :disabled="getButtonState(`updatequantity:${hdr.id}:${item.sku}`) === 'attempting'"
                                        @click="onUpdateQtyClick(hdr, item)"
                                    >
                                        {{ getButtonLabel(`updatequantity:${hdr.id}:${item.sku}`, 'Update Quantity') }}
                                    </button>
                                </div>
                            </transition>
                        </div>
                    </div>
                </div>

                <div v-if="!hdr.items.length" class="bm-no-lines">No line items</div>
            </div>
        </div>

        <!-- ═══════════ CONFIRMATION MODAL ═══════════ -->
        <transition name="bm-fade">
            <div v-if="confirmState" class="bm-overlay" @click.self="closeConfirm">
                <div class="bm-modal">
                    <h3 class="bm-modal-title">{{ confirmState.title }}</h3>
                    <p class="bm-modal-msg">{{ confirmState.message }}</p>
                    <div class="bm-modal-footer">
                        <button class="bm-btn bm-btn--cancel" @click="closeConfirm">Cancel</button>
                        <button class="bm-btn bm-btn--confirm" @click="onConfirmAction">Confirm</button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- ═══════════ EDIT QUANTITY MODAL ═══════════ -->
        <transition name="bm-fade">
            <div v-if="editState" class="bm-overlay" @click.self="closeEdit">
                <div class="bm-modal">
                    <h3 class="bm-modal-title">Update Quantity</h3>
                    <div class="bm-edit-meta">
                        <span class="bm-edit-sku">{{ editState.item.sku }}</span>
                        <span class="bm-edit-model">{{ editState.item.model || 'Unknown' }}</span>
                    </div>
                    <div class="bm-edit-field">
                        <label class="bm-edit-label">New Quantity</label>
                        <input
                            type="number"
                            class="bm-edit-input"
                            v-model.number="editState.desiredQty"
                            min="0"
                        />
                    </div>
                    <div class="bm-edit-avail" :class="{ 'bm-edit-avail--neg': editAvailability < 0 }">
                        <span>Availability after Update</span>
                        <strong>{{ editAvailability }}</strong>
                    </div>
                    <p v-if="editAvailability < 0" class="bm-edit-err">Cannot exceed available stock</p>
                    <div class="bm-modal-footer">
                        <button class="bm-btn bm-btn--cancel" @click="closeEdit">Cancel</button>
                        <button class="bm-btn bm-btn--confirm" :disabled="editAvailability < 0" @click="onEditSubmit">Submit</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue';

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
    return {
        id: h.id,
        bookingnumber: h.bookingnumber,
        created_at: h.created_at,
        bookingtitle: h.bookingtitle,
        pic_id: h.pic_id,
    };
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

const referenceData = computed(() =>
    wwLib.wwUtils.getDataFromCollection(props.content?.referenceData) || []
);
const headers = computed(() =>
    wwLib.wwUtils.getDataFromCollection(props.content?.selectedHeaders) || []
);
const lineItems = computed(() =>
    wwLib.wwUtils.getDataFromCollection(props.content?.selectedLineItems) || []
);
const picReference = computed(() =>
    wwLib.wwUtils.getDataFromCollection(props.content?.picReference) || []
);
const stagingData = computed(() => {
    const raw = props.content?.stagingData;
    if (!raw) return null;
    const resolved = wwLib.wwUtils.getDataFromCollection(raw);
    if (Array.isArray(resolved)) return resolved[0] || null;
    return resolved;
});
const lineItemFK = computed(() => props.content?.lineItemHeaderKey || 'header_id');

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

// ── Resolved Headers (enriched for display) ────────────────

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
        return {
            ...h,
            picName: picLookup.value[h.pic_id] || h.pic_id || '-',
            formattedDate: formatDate(h.created_at),
            items,
        };
    })
);

// ── Selection Summary ──────────────────────────────────────

const selectionSummary = computed(() => {
    let unique = 0;
    let total = 0;
    headers.value.forEach(h => {
        unique += Number(h.unique_skus) || 0;
        total += Number(h.total_quantity) || 0;
    });
    return `${unique} Unique, ${total} Total`;
});

// ── Root Styles (CSS variables from config) ────────────────

const rootStyles = computed(() => ({
    '--bm-card-bg': props.content?.cardBgColor || '#ffffff',
    '--bm-card-border': props.content?.cardBorderColor || '#e5e7eb',
    '--bm-header-bg': props.content?.headerBgColor || '#f9fafb',
    '--bm-line-bg': props.content?.lineBgColor || '#ffffff',
    '--bm-line-hover': props.content?.lineHoverColor || '#f3f4f6',
    '--bm-global-bg': props.content?.globalHeaderBgColor || '#111827',
    '--bm-global-text': props.content?.globalHeaderTextColor || '#ffffff',
    '--bm-font': props.content?.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    '--bm-font-size': props.content?.fontSize || '13px',
}));

// ── Dropdown Menu State ────────────────────────────────────

const openMenu = ref(null);

function toggleMenu(key) {
    openMenu.value = openMenu.value === key ? null : key;
}
function closeAllMenus() {
    openMenu.value = null;
}

// ── Pending Actions & Button State ─────────────────────────

const pendingActions = reactive(new Map());

function getPendingKey(action, headerId, sku) {
    if (sku) return `${action}:${headerId}:${sku}`;
    if (headerId && headerId !== 'all') return `${action}:${headerId}`;
    return `${action}:all`;
}

function getButtonState(key) {
    const entry = pendingActions.get(key);
    return entry ? entry.status : 'idle';
}

function getButtonLabel(key, defaultLabel) {
    const state = getButtonState(key);
    if (state === 'attempting') return 'Attempting\u2026';
    if (state === 'succeeded') return 'Succeeded';
    if (state === 'failed') return 'Failed \u2014 Retry';
    return defaultLabel;
}

function actionBtnClasses(key) {
    const s = getButtonState(key);
    return {
        'bm-dd-item--attempting': s === 'attempting',
        'bm-dd-item--succeeded': s === 'succeeded',
        'bm-dd-item--failed': s === 'failed',
    };
}

// Combine key for global action
const combineKey = computed(() => getPendingKey('combine_selected', 'all'));

// ── Dispatch & Retry ───────────────────────────────────────

function dispatchAction(key, payload) {
    const requestId = generateId();
    payload.request_id = requestId;
    payload.staging_status = 'Sending';
    payload.updated_at = new Date().toISOString();

    pendingActions.set(key, {
        requestId,
        action: payload.action,
        headerId: payload.booking_header?.id,
        status: 'attempting',
        errorMessage: null,
        startedAt: Date.now(),
        payload: deepClone(payload),
    });

    /* wwEditor:start */
    if (props.wwEditorState?.isEditing) return;
    /* wwEditor:end */

    emit('trigger-event', { name: 'actionRequest', event: { value: payload } });
}

function retryAction(key) {
    const entry = pendingActions.get(key);
    if (!entry || entry.status !== 'failed') return;

    const newId = generateId();
    const payload = deepClone(entry.payload);
    payload.request_id = newId;
    payload.updated_at = new Date().toISOString();

    entry.requestId = newId;
    entry.status = 'attempting';
    entry.errorMessage = null;
    entry.startedAt = Date.now();
    entry.payload = payload;

    /* wwEditor:start */
    if (props.wwEditorState?.isEditing) return;
    /* wwEditor:end */

    emit('trigger-event', { name: 'actionRequest', event: { value: payload } });
}

// ── Staging Watcher (matching rule §3.3) ───────────────────

watch(stagingData, (newVal) => {
    if (!newVal || !newVal.action || !newVal.staging_status) return;
    if (newVal.staging_status === 'Sending') return;

    for (const [key, entry] of pendingActions.entries()) {
        if (entry.status !== 'attempting') continue;

        const actionMatch = newVal.action === entry.action;
        const headerMatch = newVal.booking_header?.id === entry.headerId;
        const reqMatch = !entry.requestId || !newVal.request_id || newVal.request_id === entry.requestId;

        if (actionMatch && headerMatch && reqMatch) {
            if (newVal.staging_status === 'Successful') {
                entry.status = 'succeeded';
                setTimeout(() => {
                    if (pendingActions.get(key)?.status === 'succeeded') {
                        pendingActions.delete(key);
                    }
                }, 3000);
            } else if (newVal.staging_status === 'Failed') {
                entry.status = 'failed';
                entry.errorMessage = newVal.error_message || 'Action failed';
            }
            break;
        }
    }
}, { deep: true });

// ── 60-second Timeout ──────────────────────────────────────

let timeoutInterval = null;

// ── Confirmation Modal ─────────────────────────────────────

const confirmState = ref(null);

function closeConfirm() {
    confirmState.value = null;
}

function onConfirmAction() {
    if (confirmState.value?.onConfirm) confirmState.value.onConfirm();
    closeConfirm();
}

// ── Edit Quantity Modal ────────────────────────────────────

const editState = ref(null);

/*
 * Inventory meaning 1 (balance = available after all bookings including this line):
 *   availability_after_update = balance + original_qty - desired_qty
 */
const editAvailability = computed(() => {
    if (!editState.value) return 0;
    return editState.value.balance + editState.value.originalQty - (editState.value.desiredQty ?? 0);
});

function closeEdit() {
    editState.value = null;
}

// ── Action Handlers ────────────────────────────────────────

function onCombineClick() {
    const key = combineKey.value;
    const state = getButtonState(key);
    if (state === 'attempting') return;
    if (state === 'failed') { retryAction(key); closeAllMenus(); return; }

    const firstHdr = resolvedHeaders.value[0];
    if (!firstHdr) return;

    // Capture snapshot at confirmation-open time (§7 gotcha 1)
    const snapshotHeader = deepClone(firstHdr);
    const snapshotAllItems = resolvedHeaders.value.flatMap(h =>
        (h.items || []).map(i => cleanItem(i))
    );

    closeAllMenus();

    confirmState.value = {
        title: 'Combine Selected Bookings',
        message:
            `This will combine all ${headers.value.length} selected bookings under:\n` +
            `Booking Number: ${firstHdr.bookingnumber}\n` +
            `Title: ${firstHdr.bookingtitle || '-'}`,
        onConfirm: () => {
            dispatchAction(key, {
                action: 'combine_selected',
                is_edit: false,
                booking_header: cleanHeader(snapshotHeader),
                booking_items: snapshotAllItems,
            });
        },
    };
}

function onDeleteHeaderClick(hdr) {
    const key = getPendingKey('delete_header', hdr.id);
    const state = getButtonState(key);
    if (state === 'attempting') return;
    if (state === 'failed') { retryAction(key); closeAllMenus(); return; }

    const snapshotHeader = deepClone(hdr);
    const snapshotItems = (hdr.items || []).map(i => cleanItem(i));

    closeAllMenus();

    confirmState.value = {
        title: 'Release Booking',
        message: `This will release booking ${hdr.bookingnumber} and all its line items.`,
        onConfirm: () => {
            dispatchAction(key, {
                action: 'delete_header',
                is_edit: false,
                booking_header: cleanHeader(snapshotHeader),
                booking_items: snapshotItems,
            });
        },
    };
}

function onDeleteLineClick(hdr, item) {
    const key = getPendingKey('delete_lineitem', hdr.id, item.sku);
    const state = getButtonState(key);
    if (state === 'attempting') return;
    if (state === 'failed') { retryAction(key); closeAllMenus(); return; }

    const snapshotHeader = deepClone(hdr);
    const snapshotItems = (hdr.items || []).map(i => cleanItem(i));

    closeAllMenus();

    confirmState.value = {
        title: 'Release Line Item',
        message: `This will release ${item.sku} from booking ${hdr.bookingnumber}.`,
        onConfirm: () => {
            dispatchAction(key, {
                action: 'delete_lineitem',
                is_edit: false,
                booking_header: cleanHeader(snapshotHeader),
                booking_items: snapshotItems,
                target: {
                    header_id: hdr.id,
                    sku: item.sku,
                    ...(item.line_id ? { line_id: item.line_id } : {}),
                },
            });
        },
    };
}

function onUpdateQtyClick(hdr, item) {
    const key = getPendingKey('updatequantity', hdr.id, item.sku);
    const state = getButtonState(key);
    if (state === 'attempting') return;
    if (state === 'failed') { retryAction(key); closeAllMenus(); return; }

    closeAllMenus();

    editState.value = {
        header: hdr,
        item: item,
        desiredQty: item.quantity ?? 0,
        originalQty: item.quantity ?? 0,
        balance: item.balance ?? 0,
    };
}

function onEditSubmit() {
    if (editAvailability.value < 0) return;

    const hdr = editState.value.header;
    const item = editState.value.item;
    const desiredQty = editState.value.desiredQty;
    const originalQty = editState.value.originalQty;

    // Snapshot items at confirmation-open time, with target qty replaced
    const snapshotHeader = deepClone(hdr);
    const snapshotItems = (headerItemsMap.value[hdr.id] || []).map(i => {
        const c = cleanItem(i);
        const isTarget = i.sku === item.sku && (!item.line_id || i.line_id === item.line_id);
        if (isTarget) c.quantity = desiredQty;
        return c;
    });

    closeEdit();

    confirmState.value = {
        title: 'Confirm Quantity Update',
        message:
            `Update ${item.sku} in booking ${hdr.bookingnumber}\n` +
            `from ${originalQty} to ${desiredQty}?`,
        onConfirm: () => {
            const key = getPendingKey('updatequantity', hdr.id, item.sku);
            dispatchAction(key, {
                action: 'updatequantity',
                is_edit: true,
                booking_header: cleanHeader(snapshotHeader),
                booking_items: snapshotItems,
                target: {
                    header_id: hdr.id,
                    sku: item.sku,
                    ...(item.line_id ? { line_id: item.line_id } : {}),
                },
            });
        },
    };
}

// ── Lifecycle ──────────────────────────────────────────────

onMounted(() => {
    document.addEventListener('click', closeAllMenus);
    timeoutInterval = setInterval(() => {
        const now = Date.now();
        for (const [, entry] of pendingActions.entries()) {
            if (entry.status === 'attempting' && now - entry.startedAt > 60000) {
                entry.status = 'failed';
                entry.errorMessage = 'Timed out';
            }
        }
    }, 5000);
});

onUnmounted(() => {
    document.removeEventListener('click', closeAllMenus);
    if (timeoutInterval) clearInterval(timeoutInterval);
});
</script>

<style lang="scss" scoped>
/* ── Reset & Root ─────────────────────────────────── */
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

/* ── Global Header ────────────────────────────────── */
.bm-global-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--bm-global-bg);
    color: var(--bm-global-text);
    flex-shrink: 0;
}
.bm-global-left {
    display: flex;
    align-items: baseline;
    gap: 12px;
    min-width: 0;
}
.bm-title {
    margin: 0;
    font-size: 1.05em;
    font-weight: 600;
    white-space: nowrap;
}
.bm-summary {
    font-size: 0.85em;
    opacity: 0.75;
    white-space: nowrap;
}

/* ── Body ─────────────────────────────────────────── */
.bm-body {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #f3f4f6;
}
.bm-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    color: #9ca3af;
    text-align: center;
    gap: 8px;
}
.bm-empty-icon { width: 40px; height: 40px; }

/* ── Card ─────────────────────────────────────────── */
.bm-card {
    background: var(--bm-card-bg);
    border: 1px solid var(--bm-card-border);
    border-radius: 8px;
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
.bm-card-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
}
.bm-bn {
    font-weight: 600;
    font-size: 0.95em;
}
.bm-card-title {
    font-size: 0.9em;
    color: #374151;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.bm-card-meta {
    font-size: 0.8em;
    color: #6b7280;
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}
.bm-sep { color: #d1d5db; }
.bm-card-counts {
    font-size: 0.8em;
    color: #6b7280;
    margin-top: 4px;
}

/* ── Status Pill ──────────────────────────────────── */
.bm-status-pill {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 9999px;
    font-size: 0.78em;
    font-weight: 500;
    background: #e5e7eb;
    color: #374151;
    white-space: nowrap;
}
.bm-status-pill--sm {
    padding: 0 6px;
    font-size: 0.75em;
}

/* ── Line Items Grid ──────────────────────────────── */
.bm-lines-head,
.bm-line {
    display: grid;
    grid-template-columns: 44px 1fr 110px 56px 76px 52px 36px;
    align-items: center;
    gap: 6px;
    padding: 4px 14px;
}
.bm-lines-head {
    border-bottom: 1px solid var(--bm-card-border);
    padding-top: 6px;
    padding-bottom: 6px;
}
.bm-lh {
    font-size: 0.72em;
    font-weight: 600;
    text-transform: uppercase;
    color: #9ca3af;
    letter-spacing: 0.04em;
}
.bm-line {
    background: var(--bm-line-bg);
    border-bottom: 1px solid #f3f4f6;
    padding-top: 6px;
    padding-bottom: 6px;
    transition: background 0.15s;
    &:hover { background: var(--bm-line-hover); }
    &:last-child { border-bottom: none; }
}
.bm-no-lines {
    padding: 16px;
    text-align: center;
    color: #9ca3af;
    font-size: 0.85em;
}

/* ── Line Item Cells ──────────────────────────────── */
.bm-l { min-width: 0; }
.bm-l-img {
    display: flex;
    align-items: center;
    justify-content: center;
}
.bm-product-img {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    object-fit: cover;
}
.bm-img-ph {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #d1d5db;
}
.bm-l-product {
    display: flex;
    flex-direction: column;
    gap: 1px;
}
.bm-l-model {
    font-weight: 500;
    font-size: 0.9em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.bm-l-variant {
    font-size: 0.78em;
    color: #6b7280;
}
.bm-l-sku {
    font-size: 0.85em;
    font-family: monospace;
    color: #4b5563;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.bm-l-avail {
    font-weight: 600;
    font-size: 0.9em;
    text-align: center;
    &.is-low { color: #dc2626; }
}
.bm-l-status { text-align: center; }
.bm-l-qty {
    font-weight: 600;
    font-size: 0.9em;
    text-align: center;
}
.bm-l-action {
    display: flex;
    justify-content: center;
}

/* ── Icon Button ──────────────────────────────────── */
.bm-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    &:hover { background: #e5e7eb; color: #111827; }
}
.bm-icon-btn--light {
    color: rgba(255,255,255,0.7);
    &:hover { background: rgba(255,255,255,0.15); color: #fff; }
}
.bm-icon-btn--sm { width: 24px; height: 24px; }

/* ── Dropdown Menu ────────────────────────────────── */
.bm-menu-wrap {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
}
.bm-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 30;
    min-width: 180px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.bm-dropdown--right { left: auto; right: 0; }

/* ── Dropdown Item (Action Buttons) ───────────────── */
.bm-dd-item {
    display: block;
    width: 100%;
    padding: 7px 12px;
    border: none;
    border-radius: 6px;
    font-size: 0.88em;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    background: #111827;
    color: #fff;
    transition: background 0.15s, opacity 0.15s;
    white-space: nowrap;
    &:hover:not(:disabled) { background: #1f2937; }
    &:disabled { cursor: not-allowed; }
}
.bm-dd-item--attempting {
    background: #9ca3af;
    color: #fff;
    &:hover { background: #9ca3af; }
}
.bm-dd-item--succeeded {
    background: #16a34a;
    color: #fff;
    &:hover { background: #16a34a; }
}
.bm-dd-item--failed {
    background: #dc2626;
    color: #fff;
    cursor: pointer;
    &:hover { background: #b91c1c; }
}

/* ── Overlay & Modal ──────────────────────────────── */
.bm-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}
.bm-modal {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    padding: 24px;
    max-width: 420px;
    width: 100%;
}
.bm-modal-title {
    margin: 0 0 8px;
    font-size: 1.05em;
    font-weight: 600;
}
.bm-modal-msg {
    margin: 0 0 20px;
    font-size: 0.92em;
    color: #374151;
    white-space: pre-line;
    line-height: 1.5;
}
.bm-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
}

/* ── Buttons ──────────────────────────────────────── */
.bm-btn {
    padding: 8px 18px;
    border: none;
    border-radius: 6px;
    font-size: 0.9em;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
}
.bm-btn--cancel {
    background: #f3f4f6;
    color: #374151;
    &:hover { background: #e5e7eb; }
}
.bm-btn--confirm {
    background: #111827;
    color: #fff;
    &:hover { background: #1f2937; }
    &:disabled {
        background: #d1d5db;
        color: #9ca3af;
        cursor: not-allowed;
    }
}

/* ── Edit Quantity Modal ──────────────────────────── */
.bm-edit-meta {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin-bottom: 16px;
}
.bm-edit-sku {
    font-family: monospace;
    font-weight: 600;
    font-size: 0.95em;
}
.bm-edit-model {
    font-size: 0.88em;
    color: #6b7280;
}
.bm-edit-field {
    margin-bottom: 12px;
}
.bm-edit-label {
    display: block;
    font-size: 0.82em;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 4px;
}
.bm-edit-input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1em;
    outline: none;
    transition: border-color 0.15s;
    &:focus { border-color: #6366f1; }
}
.bm-edit-avail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-radius: 6px;
    background: #f0fdf4;
    font-size: 0.9em;
    color: #166534;
}
.bm-edit-avail--neg {
    background: #fef2f2;
    color: #991b1b;
}
.bm-edit-err {
    margin: 8px 0 0;
    font-size: 0.82em;
    color: #dc2626;
    font-weight: 500;
}

/* ── Transitions ──────────────────────────────────── */
.bm-fade-enter-active,
.bm-fade-leave-active {
    transition: opacity 0.2s ease;
}
.bm-fade-enter-from,
.bm-fade-leave-to {
    opacity: 0;
}
.bm-drop-enter-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}
.bm-drop-leave-active {
    transition: opacity 0.1s ease, transform 0.1s ease;
}
.bm-drop-enter-from,
.bm-drop-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 640px) {
    .bm-lines-head,
    .bm-line {
        grid-template-columns: 36px 1fr 80px 44px 60px 40px 28px;
        gap: 4px;
        padding-left: 8px;
        padding-right: 8px;
    }
    .bm-product-img,
    .bm-img-ph {
        width: 28px;
        height: 28px;
    }
    .bm-global-header { padding: 10px 12px; }
    .bm-body { padding: 8px; gap: 8px; }
    .bm-card-head { padding: 10px; }
}
</style>
