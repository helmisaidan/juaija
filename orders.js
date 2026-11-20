(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JuaijaOrders = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const active = order => ['pending', 'accepted'].includes(order.status);
  const handle = name => String(name||'').replace(/^@/,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const wallet = (state,userId) => {state.wallets=state.wallets||{};return state.wallets[userId]||(state.wallets[userId]={balance:0,transactions:[]});};
  function migrate(state) {
    for(const order of state.orders){
      const item=state.listings.find(row=>row.id===order.listingId);
      if(!order.sellerId&&item)order.sellerId=item.userId;
      if(!order.sellerUsername&&item)order.sellerUsername=state.users.find(user=>user.id===item.userId)?.username||handle(item.seller);
      if(order.title===undefined)order.title=item?.title||'';
      if(order.price===undefined)order.price=Number(item?.price||0);
      if(order.image===undefined)order.image=item?.image||'';
      if(!order.contactPhone)order.contactPhone='012-345 6789';
      if(!Number.isFinite(order.createdAt))order.createdAt=Date.now();
      if(!['pending','accepted','done','cancelled'].includes(order.status))order.status='pending';
      if(item&&order.status==='done')item.status='sold';
      if(item&&order.status==='accepted'&&item.status!=='sold')item.status='reserved';
    }
  }
  function create(state, buyerId, listingId, id, now = Date.now(), delivery = {}) {
    const item = state.listings.find(row => row.id === listingId);
    const buyer = state.users.find(row => row.id === buyerId);
    if (!buyer || !item || !item.userId) throw Error('order_unavailable');
    if (item.userId === buyerId) throw Error('order_own');
    if (state.orders.some(order => order.listingId === listingId && order.buyerId === buyerId && active(order))) throw Error('order_duplicate');
    if (['sold', 'reserved'].includes(item.status) || state.orders.some(order => order.listingId === listingId && ['accepted', 'done'].includes(order.status))) throw Error('order_unavailable');
    const seller = state.users.find(row => row.id === item.userId);
    const order = {id, listingId, buyerId, sellerId:item.userId, buyerUsername:buyer.username,
      sellerUsername:seller?.username || handle(item.seller),
      title:item.title, price:Number(item.price), image:item.image || '', deliveryMethod:delivery.method||'meetup', deliveryAddress:delivery.address||'', contactPhone:delivery.phone||'', createdAt:now, updatedAt:now, status:'pending'};
    state.orders.unshift(order);
    return order;
  }
  function pay(state,buyerId,listingId,id,now=Date.now(),delivery={}){
    const item=state.listings.find(row=>row.id===listingId),amount=Number(item?.price||0),buyerWallet=wallet(state,buyerId);
    if(!item||buyerWallet.balance<amount)throw Error('wallet_insufficient');
    const order=create(state,buyerId,listingId,id,now,delivery);buyerWallet.balance-=amount;
    order.payment={id:'pay-'+id,status:'held',amount,paidAt:now};buyerWallet.transactions.unshift({id:order.payment.id,type:'payment',amount:-amount,orderId:id,at:now});
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
      if(order.payment?.status==='held'){const sellerWallet=wallet(state,order.sellerId);sellerWallet.balance+=Number(order.payment.amount||0);sellerWallet.transactions.unshift({id:'payout-'+order.id,type:'sale',amount:Number(order.payment.amount||0),orderId:order.id,at:now});order.payment.status='released';}
      state.orders.filter(other => other.id !== order.id && other.listingId === order.listingId && active(other)).forEach(other => {
        other.status = 'cancelled'; other.cancelReason = 'sold'; other.updatedAt = now;
      });
    } else {
      order.status = 'cancelled'; order.cancelReason = action; order.cancelledAt = now;
      if(order.payment?.status==='held'){const buyerWallet=wallet(state,order.buyerId);buyerWallet.balance+=Number(order.payment.amount||0);buyerWallet.transactions.unshift({id:'refund-'+order.id,type:'refund',amount:Number(order.payment.amount||0),orderId:order.id,at:now});order.payment.status='refunded';}
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
    ms:{order_search:'Cari nama barang atau ID pesanan',order_role:'Jenis pesanan',order_all_roles:'Pembelian & jualan',order_buying:'Pembelian',order_selling:'Jualan',order_newest:'Terbaharu',order_oldest:'Terlama',order_name:'Nama barang',order_cancelled:'Dibatalkan',order_accepted:'Diterima penjual',order_pending:'Menunggu penjual',order_action_needed:'Tindakan awak diperlukan',order_waiting_seller:'Menunggu respons penjual',order_accept:'Terima pesanan',order_reject:'Tolak pesanan',order_cancel:'Batalkan pesanan',order_complete:'Sahkan barang diterima',order_create:'Buat pesanan',order_action_confirm:'Teruskan tindakan ini untuk pesanan {id}?',order_receive_confirm:'Sahkan hanya selepas barang diterima dan urusan selesai.',order_updated:'Pesanan dikemas kini.',order_unavailable:'Barang ini sudah ditempah, dijual atau tidak tersedia.',order_own:'Awak tidak boleh memesan barang sendiri.',order_duplicate:'Awak sudah mempunyai pesanan aktif untuk barang ini.',order_action_denied:'Tindakan ini tidak tersedia untuk akaun atau status pesanan ini.',order_no_matches:'Tiada pesanan sepadan',order_page:'Halaman {page} daripada {pages} · {total} pesanan',order_id:'ID pesanan',order_wait_seller:'Menunggu penjual menerima pesanan.',order_wait_buyer:'Pembeli perlu mengesahkan penerimaan barang.',order_created:'Pesanan dihantar kepada penjual.',order_notification_title:'Kemas kini pesanan',order_notification_body:'Pesanan {id} telah dikemas kini.',delivery_method:'Kaedah serahan',delivery_meetup:'Jumpa / ambil sendiri',delivery_post:'Pos',delivery_address:'Alamat penghantaran',delivery_address_none:'Tiada alamat diperlukan',wallet_insufficient:'Baki juaija Pay tidak mencukupi.',wallet_payment_saved:'Pembayaran juaija Pay berjaya. Dana ditahan sehingga serahan selesai.'},
    en:{order_search:'Search item name or order ID',order_role:'Order type',order_all_roles:'Purchases & sales',order_buying:'Purchases',order_selling:'Sales',order_newest:'Newest',order_oldest:'Oldest',order_name:'Item name',order_cancelled:'Cancelled',order_accepted:'Accepted by seller',order_pending:'Awaiting seller',order_action_needed:'Your action is needed',order_waiting_seller:'Waiting for seller response',order_accept:'Accept order',order_reject:'Decline order',order_cancel:'Cancel order',order_complete:'Confirm item received',order_create:'Place order',order_action_confirm:'Continue with this action for order {id}?',order_receive_confirm:'Confirm only after receiving the item and completing the transaction.',order_updated:'Order updated.',order_unavailable:'This item is reserved, sold or unavailable.',order_own:'You cannot order your own item.',order_duplicate:'You already have an active order for this item.',order_action_denied:'This action is unavailable for your account or the current order status.',order_no_matches:'No matching orders',order_page:'Page {page} of {pages} · {total} orders',order_id:'Order ID',order_wait_seller:'Waiting for the seller to accept.',order_wait_buyer:'The buyer needs to confirm receipt.',order_created:'Order sent to the seller.',order_notification_title:'Order update',order_notification_body:'Order {id} has been updated.',wallet_insufficient:'Your juaija Pay balance is insufficient.',wallet_payment_saved:'juaija Pay payment completed. Funds are held until handoff is complete.'}
  };
  function controller(api) {
    const {getState, getUser, t, format, escapeHtml:e, money, persist, onChange, toast, openModal, closeModal, badge} = api;
    const view = {status:'all',role:'all',search:'',sort:'newest',perPage:10,page:1};
    const section = document.querySelector('#page-orders');
    function commit(operation, success) {
      const state = getState(), oldOrders = structuredClone(state.orders), oldListings = structuredClone(state.listings),oldWallets=structuredClone(state.wallets||{});
      try {
        const result = operation(state);
        if (!persist()) {state.orders=oldOrders;state.listings=oldListings;state.wallets=oldWallets;return false;}
        onChange(); toast(success); return result;
      } catch (error) {state.orders=oldOrders;state.listings=oldListings;state.wallets=oldWallets;toast(error.message in messages.ms ? error.message : 'order_action_denied');return false;}
    }
    function render() {
      const state = getState(), user = getUser(), result = query(state,user.id,view); view.page=result.page;
      const statusControl=section.querySelector('#ordersStatus');if(statusControl)statusControl.value=view.status;
      section.querySelector('#ordersList').innerHTML = result.rows.length ? result.rows.map(order => {
        const item=state.listings.find(row=>row.id===order.listingId), seller=state.users.find(row=>row.id===order.sellerId), buyer=state.users.find(row=>row.id===order.buyerId);
        const person=(key,person,name)=>`<span>${e(t(key))}: <strong>@${e(person?.username||String(name||'').replace(/^@/,''))}${badge(person)}</strong></span>`;
        const date=new Intl.DateTimeFormat(state.settings.lang==='ms'?'ms-MY':'en-MY',{dateStyle:'medium',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(order.createdAt));
        const statusKey=order.status==='pending'?(order.sellerId===user.id?'order_action_needed':'order_waiting_seller'):{pending:'order_pending',accepted:'order_accepted',done:'order_done',cancelled:'order_cancelled'}[order.status]||'order_pending';
        const isSelling=order.sellerId===getUser().id,other=isSelling?buyer:seller,otherName=isSelling?(buyer?.username||order.buyerUsername):(seller?.username||order.sellerUsername),otherKey=isSelling?'order_buyer':'order_seller';
        const rowActions=actions(order,user.id).map(action=>`<button type="button" class="order-row-action" data-order-action="${e(action)}" data-order-id="${e(order.id)}">${e(t('order_'+action))}</button>`).join('');
        return `<article class="order-list-row">${(order.image||item?.image)?`<img class="order-entry-image" src="${e(order.image||item.image)}" alt="">`:''}<button type="button" class="order-list-main" data-order-detail="${e(order.id)}"><span class="order-list-copy"><small>${e(t(otherKey))}: @${e(otherName||'')}</small><strong>${e(order.title||item?.title||t('item_unavailable'))}</strong></span><strong class="order-entry-price">${money(order.price??item?.price)}</strong><span class="order-state">${e(t(statusKey))}</span><time>${e(date)}</time><i class="bi bi-chevron-right"></i></button>${rowActions?`<span class="order-row-actions">${rowActions}</span>`:''}</article>`;
      }).join('') : `<p class="orders-empty">${e(t(result.mine?'order_no_matches':'no_orders'))}</p>`;
      const pagination=section.querySelector('#ordersPagination');pagination.hidden=result.total===0;
      section.querySelector('#ordersPageLabel').textContent=format('order_page',{page:result.page,pages:result.pages,total:result.total});
      section.querySelector('#ordersPrevious').disabled=result.page<=1;
      section.querySelector('#ordersNext').disabled=result.page>=result.pages;
    }
    section.addEventListener('click',event=>{
      if(event.target.closest('#ordersPrevious')){view.page--;render();return;}
      if(event.target.closest('#ordersNext')){view.page++;render();return;}
      const detail=event.target.closest('[data-order-detail]');
      if(detail){const state=getState(),order=state.orders.find(row=>row.id===detail.dataset.orderDetail),item=state.listings.find(row=>row.id===order?.listingId),seller=state.users.find(row=>row.id===order?.sellerId),buyer=state.users.find(row=>row.id===order?.buyerId);if(!order)return;const date=new Intl.DateTimeFormat(state.settings.lang==='ms'?'ms-MY':'en-MY',{dateStyle:'medium',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(order.createdAt));const statusKey={pending:'order_pending',accepted:'order_accepted',done:'order_done',cancelled:'order_cancelled'}[order.status],deliveryKey=order.deliveryMethod==='post'?'delivery_post':'delivery_meetup',phone=String(order.contactPhone||'').replace(/\D/g,'');const wrap=openModal(`<article class="dialog-card order-detail-dialog"><button class="dialog-close" data-close-modal aria-label="${e(t('close_dialog'))}">×</button><p class="eyebrow">${e(t('order_id'))}: ${e(order.id)}</p><h2>${e(order.title||item?.title||'')}</h2><strong class="order-detail-price">${money(order.price)}</strong><dl class="order-detail-facts"><div><dt>${e(t('order_seller'))}</dt><dd>@${e(seller?.username||order.sellerUsername||'')}</dd></div><div><dt>${e(t('order_buyer'))}</dt><dd>@${e(buyer?.username||order.buyerUsername||'')}</dd></div><div><dt>${e(t('order_status'))}</dt><dd class="order-state">${e(t(statusKey))}</dd></div><div><dt>${e(t('delivery_method'))}</dt><dd>${e(t(deliveryKey))}</dd></div><div><dt>${e(t('location_label'))}</dt><dd>${e(order.deliveryMethod==='post'?(order.deliveryAddress||t('delivery_address_none')):(item?.location||''))}</dd></div>${phone?`<div><dt>${e(t('contact_phone'))}</dt><dd><a href="https://wa.me/${e(phone)}" target="_blank" rel="noopener">${e(order.contactPhone)}</a></dd></div>`:''}<div><dt>${e(t('order_date'))}</dt><dd>${e(date)}</dd></div></dl>${active(order)?`<p class="order-detail-note">${e(t(order.status==='pending'?'order_wait_seller':'order_wait_buyer'))}</p>`:''}<div class="dialog-actions">${actions(order,getUser().id).map(action=>`<button type="button" class="button ${['accept','complete'].includes(action)?'button-primary':'button-outline'}" data-detail-order-action="${action}">${e(t('order_'+action))}</button>`).join('')}</div></article>`);wrap.querySelectorAll('[data-detail-order-action]').forEach(button=>button.addEventListener('click',()=>{const result=commit(s=>transition(s,getUser().id,order.id,button.dataset.detailOrderAction),'order_updated');if(result)closeModal();}));return;}
      const button=event.target.closest('[data-order-action]'); if(!button)return;
      const {orderAction:action,orderId:id}=button.dataset;
      const wrap=openModal(`<article class="dialog-card order-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="orderConfirmTitle"><button class="dialog-close" data-close-modal aria-label="${e(t('close_dialog'))}">×</button><h2 id="orderConfirmTitle">${e(t('order_'+action))}</h2><p>${e(action==='complete'?t('order_receive_confirm'):format('order_action_confirm',{id}))}</p><div class="dialog-actions"><button type="button" class="button button-outline" data-close-modal>${e(t('cancel'))}</button><button type="button" class="button button-primary" id="confirmOrderAction">${e(t('order_'+action))}</button></div></article>`);
      wrap.querySelector('#confirmOrderAction').addEventListener('click',()=>{
        const result=commit(state=>transition(state,getUser().id,id,action),'order_updated');
        if(result){closeModal();api.notify?.(result);}
      });
    });
    for(const [id,key,event] of [['ordersSearch','search','input'],['ordersStatus','status','change'],['ordersRole','role','change'],['ordersSort','sort','change'],['ordersShow','perPage','change']]) {
      section.querySelector('#'+id).addEventListener(event,ev=>{view[key]=ev.target.value;view.page=1;render();});
    }
    return {render,create(listingId,delivery){const result=commit(state=>create(state,getUser().id,listingId,api.uid('order'),Date.now(),delivery),'order_created');if(result)api.notify?.(result);return result;},pay(listingId,delivery){const result=commit(state=>pay(state,getUser().id,listingId,api.uid('order'),Date.now(),delivery),'wallet_payment_saved');if(result)api.notify?.(result);return result;}};
  }
  messages.ms.order_view='Lihat pesanan';messages.en.order_view='View order';
  messages.ms.order_status='Status';messages.en.order_status='Status';
  messages.ms.order_date='Tarikh';messages.en.order_date='Date';
  messages.ms.contact_phone='Nombor WhatsApp';messages.en.contact_phone='WhatsApp number';
  messages.ms.order_place=messages.ms.order_create;messages.en.order_place=messages.en.order_create;
  return {create,pay,actions,transition,query,migrate,messages,controller};
});
