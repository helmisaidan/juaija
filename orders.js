(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JuaijaOrders = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const active = order => ['pending', 'accepted'].includes(order.status);
  const handle = name => String(name||'').replace(/^@/,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  function migrate(state) {
    for(const order of state.orders){
      const item=state.listings.find(row=>row.id===order.listingId);
      if(!order.sellerId&&item)order.sellerId=item.userId;
      if(!order.sellerUsername&&item)order.sellerUsername=state.users.find(user=>user.id===item.userId)?.username||handle(item.seller);
      if(order.title===undefined)order.title=item?.title||'';
      if(order.price===undefined)order.price=Number(item?.price||0);
      if(order.image===undefined)order.image=item?.image||'';
      if(!Number.isFinite(order.createdAt))order.createdAt=Date.now();
      if(!['pending','accepted','done','cancelled'].includes(order.status))order.status='pending';
      if(item&&order.status==='done')item.status='sold';
      if(item&&order.status==='accepted'&&item.status!=='sold')item.status='reserved';
    }
  }
  function create(state, buyerId, listingId, id, now = Date.now()) {
    const item = state.listings.find(row => row.id === listingId);
    const buyer = state.users.find(row => row.id === buyerId);
    if (!buyer || !item || !item.userId) throw Error('order_unavailable');
    if (item.userId === buyerId) throw Error('order_own');
    if (state.orders.some(order => order.listingId === listingId && order.buyerId === buyerId && active(order))) throw Error('order_duplicate');
    if (['sold', 'reserved'].includes(item.status) || state.orders.some(order => order.listingId === listingId && ['accepted', 'done'].includes(order.status))) throw Error('order_unavailable');
    const seller = state.users.find(row => row.id === item.userId);
    const order = {id, listingId, buyerId, sellerId:item.userId, buyerUsername:buyer.username,
      sellerUsername:seller?.username || handle(item.seller),
      title:item.title, price:Number(item.price), image:item.image || '', createdAt:now, updatedAt:now, status:'pending'};
    state.orders.unshift(order);
    return order;
  }
  function actions(order, userId) {
    if (order.status === 'pending') return order.sellerId === userId ? ['accept', 'reject'] : order.buyerId === userId ? ['cancel'] : [];
    if (order.status === 'accepted') return order.buyerId === userId ? ['complete', 'cancel'] : order.sellerId === userId ? ['cancel'] : [];
    return [];
  }
  function transition(state, userId, orderId, action, now = Date.now()) {
    const order = state.orders.find(row => row.id === orderId);
    if (!order || !actions(order, userId).includes(action)) throw Error('order_action_denied');
    const item = state.listings.find(row => row.id === order.listingId);
    if (action === 'accept' || action === 'complete') {
      if (!item || item.userId !== order.sellerId || item.status === 'sold' || state.orders.some(other => other.id !== order.id && other.listingId === order.listingId && ['accepted', 'done'].includes(other.status))) throw Error('order_unavailable');
    }
    order.updatedAt = now;
    if (action === 'accept') { order.status = 'accepted'; order.acceptedAt = now; item.status = 'reserved'; }
    else if (action === 'complete') {
      order.status = 'done'; order.completedAt = now; item.status = 'sold';
      state.orders.filter(other => other.id !== order.id && other.listingId === order.listingId && active(other)).forEach(other => {
        other.status = 'cancelled'; other.cancelReason = 'sold'; other.updatedAt = now;
      });
    } else {
      order.status = 'cancelled'; order.cancelReason = action; order.cancelledAt = now;
      if (item?.status === 'reserved' && !state.orders.some(other => other.listingId === item.id && other.status === 'accepted')) item.status = 'available';
    }
    return order;
  }
  function query(state, userId, options = {}) {
    const mine = state.orders.filter(order => order.buyerId === userId || order.sellerId === userId);
    const search = String(options.search || '').trim().toLocaleLowerCase();
    let rows = mine.filter(order => {
      const item = state.listings.find(row => row.id === order.listingId);
      return (!options.status || options.status === 'all' || (options.status === 'active' ? active(order) : order.status === options.status))
        && (!options.role || options.role === 'all' || (options.role === 'buying' ? order.buyerId === userId : order.sellerId === userId))
        && (!search || [order.id, order.title, item?.title, order.buyerUsername, order.sellerUsername].some(value => String(value || '').toLocaleLowerCase().includes(search)));
    });
    const price = order => Number(order.price ?? state.listings.find(item => item.id === order.listingId)?.price ?? 0);
    const sorts = {newest:(a,b)=>b.createdAt-a.createdAt,oldest:(a,b)=>a.createdAt-b.createdAt,
      'price-low':(a,b)=>price(a)-price(b),'price-high':(a,b)=>price(b)-price(a),name:(a,b)=>String(a.title||'').localeCompare(String(b.title||''))};
    rows.sort(sorts[options.sort] || sorts.newest);
    const perPage = [10,20,50].includes(Number(options.perPage)) ? Number(options.perPage) : 10;
    const pages = Math.max(1, Math.ceil(rows.length / perPage));
    const page = Math.max(1, Math.min(pages, Number(options.page) || 1));
    return {rows:rows.slice((page-1)*perPage,page*perPage),total:rows.length,mine:mine.length,page,pages,perPage};
  }
  const messages = {
    ms:{order_search:'Cari nama barang atau ID pesanan',order_role:'Jenis pesanan',order_all_roles:'Pembelian & jualan',order_buying:'Pembelian',order_selling:'Jualan',order_newest:'Terbaharu',order_oldest:'Terlama',order_name:'Nama barang',order_cancelled:'Dibatalkan',order_accepted:'Diterima penjual',order_pending:'Menunggu penjual',order_accept:'Terima pesanan',order_reject:'Tolak pesanan',order_cancel:'Batalkan pesanan',order_complete:'Sahkan barang diterima',order_create:'Buat pesanan',order_action_confirm:'Teruskan tindakan ini untuk pesanan {id}?',order_receive_confirm:'Sahkan hanya selepas barang diterima dan urusan selesai.',order_updated:'Pesanan dikemas kini.',order_unavailable:'Barang ini sudah ditempah, dijual atau tidak tersedia.',order_own:'Awak tidak boleh memesan barang sendiri.',order_duplicate:'Awak sudah mempunyai pesanan aktif untuk barang ini.',order_action_denied:'Tindakan ini tidak tersedia untuk akaun atau status pesanan ini.',order_no_matches:'Tiada pesanan sepadan',order_page:'Halaman {page} daripada {pages} · {total} pesanan',order_id:'ID pesanan',order_wait_seller:'Menunggu penjual menerima pesanan.',order_wait_buyer:'Pembeli perlu mengesahkan penerimaan barang.',order_created:'Pesanan dihantar kepada penjual.',order_notification_title:'Kemas kini pesanan',order_notification_body:'Pesanan {id} telah dikemas kini.'},
    en:{order_search:'Search item name or order ID',order_role:'Order type',order_all_roles:'Purchases & sales',order_buying:'Purchases',order_selling:'Sales',order_newest:'Newest',order_oldest:'Oldest',order_name:'Item name',order_cancelled:'Cancelled',order_accepted:'Accepted by seller',order_pending:'Awaiting seller',order_accept:'Accept order',order_reject:'Decline order',order_cancel:'Cancel order',order_complete:'Confirm item received',order_create:'Place order',order_action_confirm:'Continue with this action for order {id}?',order_receive_confirm:'Confirm only after receiving the item and completing the transaction.',order_updated:'Order updated.',order_unavailable:'This item is reserved, sold or unavailable.',order_own:'You cannot order your own item.',order_duplicate:'You already have an active order for this item.',order_action_denied:'This action is unavailable for your account or the current order status.',order_no_matches:'No matching orders',order_page:'Page {page} of {pages} · {total} orders',order_id:'Order ID',order_wait_seller:'Waiting for the seller to accept.',order_wait_buyer:'The buyer needs to confirm receipt.',order_created:'Order sent to the seller.',order_notification_title:'Order update',order_notification_body:'Order {id} has been updated.'}
  };
  function controller(api) {
    const {getState, getUser, t, format, escapeHtml:e, money, persist, onChange, toast, openModal, closeModal, badge} = api;
    const view = {status:'all',role:'all',search:'',sort:'newest',perPage:10,page:1};
    const section = document.querySelector('#page-orders');
    function commit(operation, success) {
      const state = getState(), oldOrders = structuredClone(state.orders), oldListings = structuredClone(state.listings);
      try {
        const result = operation(state);
        if (!persist()) {state.orders=oldOrders;state.listings=oldListings;return false;}
        onChange(); toast(success); return result;
      } catch (error) {state.orders=oldOrders;state.listings=oldListings;toast(error.message in messages.ms ? error.message : 'order_action_denied');return false;}
    }
    function render() {
      const state = getState(), user = getUser(), result = query(state,user.id,view); view.page=result.page;
      section.querySelectorAll('[data-order-filter]').forEach(button => {const selected=button.dataset.orderFilter===view.status;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
      section.querySelector('#ordersList').innerHTML = result.rows.length ? result.rows.map(order => {
        const item=state.listings.find(row=>row.id===order.listingId), seller=state.users.find(row=>row.id===order.sellerId), buyer=state.users.find(row=>row.id===order.buyerId);
        const person=(key,person,name)=>`<span>${e(t(key))}: <strong>@${e(person?.username||String(name||'').replace(/^@/,''))}${badge(person)}</strong></span>`;
        const date=new Intl.DateTimeFormat(state.settings.lang==='ms'?'ms-MY':'en-MY',{dateStyle:'medium',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(order.createdAt));
        const statusKey={pending:'order_pending',accepted:'order_accepted',done:'order_done',cancelled:'order_cancelled'}[order.status]||'order_pending';
        return `<button type="button" class="order-list-row" data-order-detail="${e(order.id)}">${(order.image||item?.image)?`<img class="order-entry-image" src="${e(order.image||item.image)}" alt="">`:''}<span class="order-list-copy"><strong>${e(order.title||item?.title||t('item_unavailable'))}</strong><small>${e(t('order_seller'))}: @${e(seller?.username||order.sellerUsername||'')}</small></span><strong class="order-entry-price">${money(order.price??item?.price)}</strong><span class="order-state">${e(t(statusKey))}</span><time>${e(date)}</time><i class="bi bi-chevron-right"></i></button>`;
      }).join('') : `<p class="orders-empty">${e(t(result.mine?'order_no_matches':'no_orders'))}</p>`;
      const pagination=section.querySelector('#ordersPagination');pagination.hidden=result.total===0;
      section.querySelector('#ordersPageLabel').textContent=format('order_page',{page:result.page,pages:result.pages,total:result.total});
      section.querySelector('#ordersPrevious').disabled=result.page<=1;
      section.querySelector('#ordersNext').disabled=result.page>=result.pages;
    }
    section.addEventListener('click',event=>{
      const tab=event.target.closest('[data-order-filter]');
      if(tab){view.status=tab.dataset.orderFilter;view.page=1;render();return;}
      if(event.target.closest('#ordersPrevious')){view.page--;render();return;}
      if(event.target.closest('#ordersNext')){view.page++;render();return;}
      const detail=event.target.closest('[data-order-detail]');
      if(detail){const state=getState(),order=state.orders.find(row=>row.id===detail.dataset.orderDetail),item=state.listings.find(row=>row.id===order?.listingId),seller=state.users.find(row=>row.id===order?.sellerId);if(!order)return;const date=new Intl.DateTimeFormat(state.settings.lang==='ms'?'ms-MY':'en-MY',{dateStyle:'medium',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(order.createdAt));const statusKey={pending:'order_pending',accepted:'order_accepted',done:'order_done',cancelled:'order_cancelled'}[order.status];const wrap=openModal(`<article class="dialog-card order-detail-dialog"><button class="dialog-close" data-close-modal>×</button><p class="eyebrow">${e(t('order_id'))}: ${e(order.id)}</p><h2>${e(order.title||item?.title||'')}</h2><strong class="order-detail-price">${money(order.price)}</strong><p>${e(t('order_seller'))}: <strong>@${e(seller?.username||order.sellerUsername||'')}</strong></p><p class="order-state">${e(t(statusKey))}</p><time>${e(date)}</time>${active(order)?`<p>${e(t(order.status==='pending'?'order_wait_seller':'order_wait_buyer'))}</p>`:''}<div class="dialog-actions">${actions(order,getUser().id).map(action=>`<button type="button" class="button ${['accept','complete'].includes(action)?'button-primary':'button-outline'}" data-detail-order-action="${action}">${e(t('order_'+action))}</button>`).join('')}</div></article>`);wrap.querySelectorAll('[data-detail-order-action]').forEach(button=>button.addEventListener('click',()=>{const result=commit(s=>transition(s,getUser().id,order.id,button.dataset.detailOrderAction),'order_updated');if(result)closeModal();}));return;}
      const button=event.target.closest('[data-order-action]'); if(!button)return;
      const {orderAction:action,orderId:id}=button.dataset;
      const wrap=openModal(`<article class="dialog-card order-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="orderConfirmTitle"><button class="dialog-close" data-close-modal aria-label="${e(t('close_dialog'))}">×</button><h2 id="orderConfirmTitle">${e(t('order_'+action))}</h2><p>${e(action==='complete'?t('order_receive_confirm'):format('order_action_confirm',{id}))}</p><div class="dialog-actions"><button type="button" class="button button-outline" data-close-modal>${e(t('cancel'))}</button><button type="button" class="button button-primary" id="confirmOrderAction">${e(t('order_'+action))}</button></div></article>`);
      wrap.querySelector('#confirmOrderAction').addEventListener('click',()=>{
        const result=commit(state=>transition(state,getUser().id,id,action),'order_updated');
        if(result){closeModal();api.notify?.(result);}
      });
    });
    for(const [id,key,event] of [['ordersSearch','search','input'],['ordersRole','role','change'],['ordersSort','sort','change'],['ordersShow','perPage','change']]) {
      section.querySelector('#'+id).addEventListener(event,ev=>{view[key]=ev.target.value;view.page=1;render();});
    }
    return {render,create(listingId){const result=commit(state=>create(state,getUser().id,listingId,api.uid('order')),'order_created');if(result)api.notify?.(result);return result;}};
  }
  messages.ms.order_view='Lihat pesanan';messages.en.order_view='View order';
  messages.ms.order_place=messages.ms.order_create;messages.en.order_place=messages.en.order_create;
  return {create,actions,transition,query,migrate,messages,controller};
});
