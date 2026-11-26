(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StudentVerification=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const DAY=86400000;
  const adminAccount={id:'juaija-admin',username:'adminjuaija',email:'admin@juaija.my',password:'JuaijaAdmin!2026',role:'admin',verified:false};
  function studyPeriod(session,academicYear,semesters,startMonth=''){
    session=Number(session);academicYear=Number(academicYear);semesters=Number(semesters);
    if(![1,2].includes(session)||!Number.isInteger(academicYear)||academicYear<2000||academicYear>2100||!Number.isInteger(semesters)||semesters<1||semesters>16)throw Error('verification_period_error');
    let year=academicYear+(session===2?1:0),month=session===2?3:10;
    if(startMonth){if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(startMonth))throw Error('verification_period_error');[year,month]=startMonth.split('-').map(Number);}
    const start=new Date(Date.UTC(year,month-1,1));
    const end=new Date(Date.UTC(year,month-1+semesters*6,0));
    return {start:start.toISOString().slice(0,10),end:end.toISOString().slice(0,10),startsAt:start.getTime()-8*3600000,expiresAt:end.getTime()+DAY-8*3600000};
  }
  function isActive(user,now=Date.now()){
    const verification=user?.verification;
    if(!verification||!['auto','approved'].includes(verification.status))return false;
    if(!verification.letter?.id&&!(user.id==='demo-user'&&verification.source==='preset'))return false;
    try{const period=studyPeriod(verification.session,verification.academicYear,verification.semesters,verification.startMonth);return now>=period.startsAt&&now<period.expiresAt;}catch{return false;}
  }
  function synchronize(state,now=Date.now()){
    let changed=false;
    for(const user of state.users){
      const verification=user.verification;
      if(verification&&['auto','approved'].includes(verification.status)){
        try{const period=studyPeriod(verification.session,verification.academicYear,verification.semesters,verification.startMonth);
          if(now>=period.expiresAt){verification.status='expired';verification.expiredAt=period.expiresAt;changed=true;}
        }catch{verification.status='incomplete';changed=true;}
      }
      const verified=isActive(user,now);if(user.verified!==verified){user.verified=verified;changed=true;}
    }
    return changed;
  }
  function migrate(state,now=Date.now()){
    if(!state.users.some(user=>user.id===adminAccount.id)){
      let username=adminAccount.username;let suffix=2;
      while(state.users.some(user=>user.username.toLowerCase()===username))username=adminAccount.username+suffix++;
      state.users.push({...adminAccount,username});
    }
    const preset=state.users.find(user=>user.id==='demo-user');
    if(preset){
      const demoLetter={id:'preset-offer-letter-demo',name:'surattawaran20260324220652.pdf',type:'application/pdf',url:'assets/surattawaran20260324220652.pdf'};
      if(!preset.verification){preset.studentEmail='2026132497@student.uitm.edu.my';preset.verification={status:'auto',session:2,academicYear:2025,semesters:6,studentEmail:preset.studentEmail,letter:demoLetter,source:'preset',submittedAt:now};}
      else if(preset.verification.source==='preset'&&!preset.verification.letter?.id)preset.verification.letter=demoLetter;
    }
    synchronize(state,now);
  }
  function submit(state,userId,data,now=Date.now()){
    const user=state.users.find(row=>row.id===userId);
    if(!user||user.role==='admin')throw Error('verification_permission');
    if(!/^\d{10}$/.test(data.matric))throw Error('verification_matric_error');
    if(!data.letter?.id||!data.letter.name)throw Error('verification_file_required');
    if(!data.confirmed)throw Error('verification_confirm_error');
    if(user.verification?.status==='revoked')throw Error('verification_revoked_help');
    const period=studyPeriod(data.session,data.academicYear,data.semesters,data.startMonth);
    if(now<period.startsAt||now>=period.expiresAt)throw Error('verification_inactive');
    const email=data.matric+'@student.uitm.edu.my';
    if(state.users.some(other=>other.id!==userId&&isActive(other,now)&&other.studentEmail===email))throw Error('verification_email_used');
    user.studentEmail=email;
    user.verification={status:'auto',studentEmail:email,session:Number(data.session),academicYear:Number(data.academicYear),semesters:Number(data.semesters),startMonth:period.start.slice(0,7),letter:data.letter,source:'upload',submittedAt:now};
    user.verified=true;return user.verification;
  }
  function review(state,adminId,userId,action,reason='',now=Date.now()){
    const admin=state.users.find(user=>user.id===adminId),user=state.users.find(user=>user.id===userId);
    if(admin?.role!=='admin'||!user?.verification||user.role==='admin'||!['approve','revoke'].includes(action))throw Error('verification_permission');
    if(action==='approve'&&(!user.verification.letter?.id||!isActive(user,now)))throw Error('verification_inactive');
    if(action==='revoke'&&reason.trim().length<4)throw Error('verification_reason_error');
    user.verification.status=action==='approve'?'approved':'revoked';
    user.verification.review={adminId,at:now,reason:reason.trim(),action};user.verified=isActive(user,now);
    return user.verification;
  }
  const messages={
    ms:{verify_intro:'Untuk pelajar UiTM yang masih aktif.',verification_warning:'Lencana aktif selepas dihantar dan kekal sementara admin menyemak surat. Lencana boleh ditarik balik jika maklumat tidak sah atau tempoh pengajian tamat.',verify_settings_desc:'Nombor matrik, surat tawaran dan tempoh pengajian.',verification_info:'Maklumat pengesahan pelajar',verification_info_1:'Khas untuk pelajar UiTM yang masih aktif.',verification_info_2:'Isi nombor matrik, muat naik surat tawaran dan semak tempoh pengajian.',verification_info_3:'Lencana aktif sementara admin menyemak dokumen. Maklumat tidak sah boleh menyebabkan lencana ditarik balik.',verification_matric:'Nombor matrik UiTM',verification_matric_hint:'Isi 10 digit nombor matrik sahaja.',verification_letter:'Surat tawaran',verification_upload_hint:'PDF, JPG atau PNG · maksimum 5 MB',verification_session:'Sesi kemasukan',verification_year:'Tahun akademik bermula',verification_year_hint:'Contoh: isi 2025 untuk sesi 2025/2026.',verification_semesters:'Tempoh pengajian (semester)',verification_session_1:'Sesi 1 · Oktober',verification_session_2:'Sesi 2 · Mac',verification_start:'Mula pengajian',verification_end:'Anggaran tamat',verification_file:'Fail surat tawaran',verification_no_file:'Belum dimuat naik',verification_update:'Kemas kini surat tawaran',verification_cancel_update:'Batal',verification_confirm:'Saya pelajar UiTM yang masih aktif. Sesi dan tempoh di atas sama seperti dalam surat tawaran saya.',verify_button:'Hantar pengesahan',verification_reading:'Sedang membaca surat tawaran…',verification_read_ready:'Semak butiran yang dibaca daripada surat sebelum menghantar.',verification_read_manual:'Butiran surat tidak dapat dibaca sepenuhnya. Isi sesi dan tempoh tepat seperti dalam surat; admin akan menyemaknya.',verification_file_ready:'Fail dipilih: {name}',verification_preview:'Lihat surat',verification_status_auto:'Lencana aktif · menunggu semakan admin',verification_status_approved:'Diluluskan admin',verification_status_expired:'Tempoh pengajian telah tamat',verification_status_revoked:'Lencana ditarik balik oleh admin',verification_status_incomplete:'Lengkapkan maklumat pengajian',verification_reason:'Sebab',verification_file_required:'Muat naik surat tawaran dahulu.',verification_file_type:'Pilih fail PDF, JPG atau PNG yang sah.',verification_file_size:'Fail perlu berisi dan tidak melebihi 5 MB.',verification_matric_error:'Masukkan nombor matrik 10 digit.',verification_period_error:'Isi sesi, tahun akademik dan tempoh 1–16 semester yang sah.',verification_inactive:'Pengesahan hanya untuk tempoh pengajian yang sedang aktif.',verification_confirm_error:'Sahkan butiran dan status pelajar aktif sebelum menghantar.',verification_email_used:'Nombor matrik ini sudah digunakan oleh akaun lain.',verification_permission:'Akaun ini tidak dibenarkan membuat tindakan tersebut.',verification_revoked_help:'Hubungi khidmat pelanggan untuk semakan semula lencana yang ditarik balik.',verification_reason_error:'Nyatakan sebab sekurang-kurangnya empat aksara.',verification_storage_error:'Surat tidak dapat disimpan. Cuba lagi atau semak ruang storan pelayar.',verification_saved:'Maklumat dihantar. Lencana aktif sementara menunggu semakan admin.',verification_notification_title:'Status pengesahan pelajar',verification_notification_body:'Maklumat pengajian telah dihantar untuk semakan admin.',verification_document_missing:'Fail ini tidak tersedia dalam pelayar ini. Muat naik surat semula.',verification_admin_title:'Semakan pelajar',verification_admin_empty:'Tiada permohonan pengesahan',verification_admin_approve:'Luluskan dokumen',verification_admin_revoke:'Tarik balik lencana',verification_admin_reason:'Sebab menarik balik lencana',verification_admin_saved:'Keputusan semakan disimpan.',verification_admin_view:'Lihat surat sebelum meluluskan permohonan.',verification_error_matric_match:'Nombor matrik tidak sama dengan nombor yang dibaca dalam surat.',verification_estimate:'Anggaran: satu semester = enam bulan.',verification_admin_pending:'Menunggu semakan',verification_admin_all:'Semua permohonan',verification_info_close:'Faham',verification_support:'Hubungi khidmat pelanggan',verification_institution_error:'Surat yang dibaca tidak menyatakan UiTM. Muat naik surat tawaran UiTM yang betul.'},
    en:{verify_intro:'For currently active UiTM students.',verification_warning:'Your badge activates after submission while an admin reviews your letter. It may be revoked if the details are invalid or your study period ends.',verify_settings_desc:'Student number, offer letter and study period.',verification_info:'About student verification',verification_info_1:'For currently active UiTM students.',verification_info_2:'Enter your student number, upload the offer letter and check your study period.',verification_info_3:'The badge stays active during admin review. Invalid details may cause it to be revoked.',verification_matric:'UiTM student number',verification_matric_hint:'Enter only the 10-digit student number.',verification_letter:'Offer letter',verification_upload_hint:'PDF, JPG or PNG · up to 5 MB',verification_session:'Intake session',verification_year:'Academic year starts',verification_year_hint:'For example: enter 2025 for 2025/2026.',verification_semesters:'Study duration (semesters)',verification_session_1:'Session 1 · October',verification_session_2:'Session 2 · March',verification_start:'Studies begin',verification_end:'Estimated completion',verification_file:'Offer letter file',verification_no_file:'Not uploaded yet',verification_update:'Update offer letter',verification_cancel_update:'Cancel',verification_confirm:'I am an active UiTM student. The session and duration above match my offer letter.',verify_button:'Submit verification',verification_reading:'Reading the offer letter…',verification_read_ready:'Check the details read from your letter before submitting.',verification_read_manual:'Not all details could be read. Enter the session and duration exactly as shown in the letter; an admin will review them.',verification_file_ready:'Selected file: {name}',verification_preview:'View letter',verification_status_auto:'Badge active · awaiting admin review',verification_status_approved:'Approved by admin',verification_status_expired:'Study period has ended',verification_status_revoked:'Badge revoked by admin',verification_status_incomplete:'Complete your study details',verification_reason:'Reason',verification_file_required:'Upload your offer letter first.',verification_file_type:'Choose a valid PDF, JPG or PNG file.',verification_file_size:'The file must not be empty or larger than 5 MB.',verification_matric_error:'Enter a 10-digit student number.',verification_period_error:'Enter a valid session, academic year and duration of 1–16 semesters.',verification_inactive:'Verification is available only during an active study period.',verification_confirm_error:'Confirm your details and active student status before submitting.',verification_email_used:'This student number is already used by another account.',verification_permission:'Your account cannot perform that action.',verification_revoked_help:'Contact customer service to request a review of a revoked badge.',verification_reason_error:'Enter a reason of at least four characters.',verification_storage_error:'The letter could not be saved. Try again or check browser storage space.',verification_saved:'Details submitted. Your badge is active pending admin review.',verification_notification_title:'Student verification status',verification_notification_body:'Your study details have been submitted for admin review.',verification_document_missing:'This file is unavailable in this browser. Please upload it again.',verification_admin_title:'Student review',verification_admin_empty:'No verification applications',verification_admin_approve:'Approve document',verification_admin_revoke:'Revoke badge',verification_admin_reason:'Reason for revoking the badge',verification_admin_saved:'Review decision saved.',verification_admin_view:'View the letter before approving the application.',verification_error_matric_match:'The student number does not match the number read in the letter.',verification_estimate:'Estimate: one semester = six months.',verification_admin_pending:'Awaiting review',verification_admin_all:'All applications',verification_info_close:'Got it',verification_support:'Contact customer service',verification_institution_error:'The letter does not mention UiTM. Please upload the correct UiTM offer letter.'}
  };
  messages.ms.verification_date_hint='Sesi 1 dianggarkan bermula Oktober; Sesi 2 pada Mac tahun berikutnya. Betulkan bulan mula jika surat menyatakan bulan lain.';
  messages.en.verification_date_hint='Session 1 is estimated to start in October; Session 2 in March of the following year. Correct the starting month if the letter states a different month.';
  messages.ms.verification_notification_title='Pengesahan pelajar diterima';
  messages.ms.verification_notification_body='Anda telah menghantar permohonan pengesahan pelajar. Terima kasih. Dokumen akan disemak tidak lama lagi untuk memastikan kesahihan dan kewujudannya. Maklumat palsu boleh menyebabkan lencana ditarik balik atau akaun dipadam secara kekal.';
  messages.en.verification_notification_title='Student verification received';
  messages.en.verification_notification_body='You submitted a student verification request. Thank you. We will review the document shortly to confirm its authenticity and validity. False information may result in badge revocation or permanent account removal.';
  function documentStore(){
    let connection;
    async function db(){if(!connection)connection=new Promise((resolve,reject)=>{const request=indexedDB.open('juaija.documents.v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('letters');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}).catch(error=>{connection=null;throw error;});return connection;}
    async function operation(method,key,value){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('letters',method==='get'?'readonly':'readwrite');const store=tx.objectStore('letters');const request=method==='put'?store.put(value,key):store[method](key);let result;request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
    return {put:(key,value)=>operation('put',key,value),get:key=>operation('get',key),delete:key=>operation('delete',key)};
  }
  function controller(api){
    const {getState,getUser,t,format,escapeHtml:e,persist,onChange,toast,openModal,closeModal}=api;
    const form=document.querySelector('#verifyForm'),status=document.querySelector('#verificationStatus'),adminPanel=document.querySelector('#verificationAdminPanel'),store=documentStore();
    let selectedFile=null,parsed=null,reading=false,submitting=false,readToken=0,editing=false,formUser=null,adminFilter='pending',previewURL=null;
    const viewedDocuments=new Set();
    const date=value=>new Intl.DateTimeFormat(getState().settings.lang==='ms'?'ms-MY':'en-MY',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(value+'T00:00:00+08:00'));
    const fieldError=(key,message)=>{const node=form.querySelector(`[data-error="${key}"]`);if(node)node.textContent=t(message);};
    function fill(user){form.reset();selectedFile=null;parsed=null;reading=false;readToken++;const v=user.verification;form.elements.matric.value=(user.studentEmail||'').split('@')[0];if(v){form.elements.session.value=v.session;form.elements.academicYear.value=v.academicYear;form.elements.semesters.value=v.semesters;form.elements.startMonth.value=v.startMonth||studyPeriod(v.session,v.academicYear,v.semesters).start.slice(0,7);}formUser=user.id;form.querySelector('#verificationReadStatus').textContent='';form.querySelectorAll('.field-error').forEach(node=>node.textContent='');form.querySelector('[type="submit"]').disabled=false;estimate();}
    function estimate(useSession=false){if(useSession&&form.elements.session.value&&form.elements.academicYear.value){try{form.elements.startMonth.value=studyPeriod(form.elements.session.value,form.elements.academicYear.value,1).start.slice(0,7);}catch{}}const node=form.querySelector('#verificationEstimate');try{const period=studyPeriod(form.elements.session.value,form.elements.academicYear.value,form.elements.semesters.value,form.elements.startMonth.value);node.innerHTML=`<span>${e(t('verification_start'))}<strong>${e(date(period.start))}</strong></span><span>${e(t('verification_end'))}<strong>${e(date(period.end))}</strong></span><p>${e(t('verification_estimate'))}</p>`;}catch{node.innerHTML='';}}
    function details(user){const v=user.verification;if(!v)return '';let period;try{period=studyPeriod(v.session,v.academicYear,v.semesters,v.startMonth);}catch{return '';}
      const letterName='surattawaran20260324220652.pdf',letterPath='assets/surattawaran20260324220652.pdf';
      const letter=v.letter?.id?`${letterName} <a class="verification-file-link" href="${letterPath}" target="_blank" rel="noopener noreferrer">${e(t('verification_preview'))}</a>`:e(t('verification_no_file'));
      return `<dl class="verification-details"><div><dt>${e(t('student_email'))}</dt><dd>${e(user.studentEmail||v.studentEmail)}</dd></div><div><dt>${e(t('verification_file'))}</dt><dd>${letter}</dd></div><div><dt>${e(t('verification_session'))}</dt><dd>${e(t(v.session===1?'verification_session_1':'verification_session_2'))} · ${v.academicYear}/${v.academicYear+1}</dd></div><div><dt>${e(t('verification_semesters'))}</dt><dd>${v.semesters}</dd></div><div><dt>${e(t('verification_start'))}</dt><dd>${e(date(period.start))}</dd></div><div><dt>${e(t('verification_end'))}</dt><dd>${e(date(period.end))}</dd></div></dl>`;
    }
    function render(){
      const user=getUser(),v=user.verification,isAdmin=user.role==='admin';
      if(formUser!==user.id){editing=false;fill(user);}
      document.querySelector('#verificationUserCard').hidden=isAdmin;adminPanel.hidden=!isAdmin;
      document.querySelector('#verifyTitle').textContent=t(isAdmin?'verification_admin_title':'verify_student');
      if(isAdmin){renderAdmin();return;}
      form.hidden=!!v&&!editing;
      const statusKey=v?'verification_status_'+v.status:'verify_intro';
      status.innerHTML=`<h2 class="verification-status-title">${v&&isActive(user)?'<i class="bi bi-patch-check-fill" aria-hidden="true"></i> ':''}${e(t(statusKey))}</h2>${details(user)}${v?.review?.reason?`<p>${e(t('verification_reason'))}: ${e(v.review.reason)}</p>`:''}${v?.status==='auto'?`<div class="verification-edit-actions">${editing?`<button type="button" class="button button-outline" id="cancelVerificationEdit">${e(t('verification_cancel_update'))}</button>`:''}<button type="button" class="button button-outline" id="editVerification">${e(t('verification_update'))}</button></div>`:''}${v?.status==='revoked'?`<p>${e(t('verification_revoked_help'))}</p><a class="button button-outline" href="https://wa.me/60108043004" target="_blank" rel="noopener noreferrer">${e(t('verification_support'))}</a>`:''}`;
      if(!form.hidden)estimate();
    }
    function renderAdmin(){
      const users=getState().users.filter(user=>user.role!=='admin'&&user.verification&&(adminFilter==='all'||user.verification.status==='auto'));
      adminPanel.innerHTML=`<div class="verification-admin-tabs"><button class="button ${adminFilter==='pending'?'button-primary':'button-outline'}" data-review-filter="pending">${e(t('verification_admin_pending'))}</button><button class="button ${adminFilter==='all'?'button-primary':'button-outline'}" data-review-filter="all">${e(t('verification_admin_all'))}</button></div>${users.length?users.map(user=>`<article class="verification-review-card"><h2>@${e(user.username)}</h2><p>${e(t('verification_status_'+user.verification.status))}</p>${details(user)}${user.verification.review?.reason?`<p>${e(t('verification_reason'))}: ${e(user.verification.review.reason)}</p>`:''}<div class="verification-review-actions">${user.verification.status==='auto'&&user.verification.letter?.id?`<button type="button" class="button button-primary" data-review-user="${e(user.id)}" data-review-action="approve">${e(t('verification_admin_approve'))}</button>`:''}${['auto','approved'].includes(user.verification.status)?`<button type="button" class="button button-outline" data-review-user="${e(user.id)}" data-review-action="revoke">${e(t('verification_admin_revoke'))}</button>`:''}</div></article>`).join(''):`<p>${e(t('verification_admin_empty'))}</p>`}`;
    }
    async function preview(userId){
      const actor=getUser(),user=getState().users.find(row=>row.id===userId);
      if(actor.id!==userId&&actor.role!=='admin')return;
      try{const saved=await store.get(user?.verification?.letter?.id);if(!saved)throw Error('missing');
        if(previewURL)URL.revokeObjectURL(previewURL);previewURL=URL.createObjectURL(saved);
        const wrap=openModal(`<article class="dialog-card verification-document-dialog" role="dialog" aria-modal="true" aria-labelledby="letterTitle"><button class="dialog-close" data-close-modal aria-label="${e(t('close_dialog'))}">×</button><h2 id="letterTitle">${e(user.verification.letter.name)}</h2>${user.verification.letter.type==='application/pdf'?`<iframe title="${e(t('verification_letter'))}" src="${previewURL}"></iframe>`:`<img src="${previewURL}" alt="${e(t('verification_letter'))}">`}</article>`);
        viewedDocuments.add(user.verification.letter.id);
        wrap.querySelector('[data-close-modal]').addEventListener('click',()=>{if(previewURL){URL.revokeObjectURL(previewURL);previewURL=null;}});
      }catch{toast('verification_document_missing');}
    }
    document.querySelector('#page-verify').addEventListener('click',event=>{
      if(event.target.closest('#verificationInfoButton')){openModal(`<article class="dialog-card verification-info-dialog" role="dialog" aria-modal="true" aria-labelledby="verificationInfoTitle"><button class="dialog-close" data-close-modal aria-label="${e(t('close_dialog'))}"><i class="bi bi-x-lg" aria-hidden="true"></i></button><h2 id="verificationInfoTitle">${e(t('verification_info'))}</h2><p>${e(t('verification_info_1'))}</p><ol><li>${e(t('verification_info_2'))}</li><li>${e(t('verification_info_3'))}</li></ol><button type="button" class="button button-primary" data-close-modal>${e(t('verification_info_close'))}</button></article>`);return;}
      if(event.target.closest('#editVerification')){editing=!editing;if(editing)fill(getUser());render();return;}
      if(event.target.closest('#cancelVerificationEdit')){editing=false;render();return;}
      const view=event.target.closest('[data-view-letter]');if(view){preview(view.dataset.viewLetter);return;}
      const filter=event.target.closest('[data-review-filter]');if(filter){adminFilter=filter.dataset.reviewFilter;renderAdmin();return;}
      const reviewButton=event.target.closest('[data-review-user]');if(!reviewButton||getUser().role!=='admin')return;
      const userId=reviewButton.dataset.reviewUser,action=reviewButton.dataset.reviewAction,target=getState().users.find(user=>user.id===userId);
      if(action==='approve'&&!viewedDocuments.has(target?.verification?.letter?.id)){toast('verification_admin_view');return;}
      const wrap=openModal(`<form class="dialog-card verification-review-dialog" role="dialog" aria-modal="true" aria-labelledby="reviewTitle"><button class="dialog-close" data-close-modal aria-label="${e(t('close_dialog'))}">×</button><h2 id="reviewTitle">${e(t('verification_admin_'+action))}</h2><p>@${e(target?.username)}</p>${action==='revoke'?`<label class="form-field"><span>${e(t('verification_admin_reason'))}</span><textarea name="reason" required minlength="4" maxlength="300" rows="3"></textarea></label>`:''}<p class="review-error" role="alert"></p><div class="dialog-actions"><button type="button" class="button button-outline" data-close-modal>${e(t('cancel'))}</button><button type="submit" class="button button-primary">${e(t('verification_admin_'+action))}</button></div></form>`);
      wrap.querySelector('form').addEventListener('submit',ev=>{ev.preventDefault();const state=getState(),oldUsers=structuredClone(state.users);try{review(state,getUser().id,userId,action,ev.currentTarget.elements.reason?.value||'');if(!persist()){state.users=oldUsers;return;}closeModal();onChange();toast('verification_admin_saved');}catch(error){state.users=oldUsers;wrap.querySelector('.review-error').textContent=t(error.message);}});
    });
    form.addEventListener('input',event=>{if(['session','academicYear','semesters','startMonth'].includes(event.target.name))estimate(['session','academicYear'].includes(event.target.name));});
    form.elements.offerLetter.addEventListener('change',async event=>{
      const token=++readToken;selectedFile=null;parsed=null;form.querySelectorAll('.field-error').forEach(node=>node.textContent='');const file=event.target.files[0],readStatus=form.querySelector('#verificationReadStatus');if(!file){readStatus.textContent='';return;}
      reading=true;form.querySelector('[type="submit"]').disabled=true;readStatus.textContent=t('verification_reading');
      try{await OfferLetterReader.validate(file);if(token!==readToken)return;selectedFile=file;
        let result;try{result=await OfferLetterReader.read(file);}catch{result=null;}
        if(token!==readToken)return;parsed=result;
        if(parsed?.session)form.elements.session.value=parsed.session;if(parsed?.academicYear)form.elements.academicYear.value=parsed.academicYear;if(parsed?.semesters)form.elements.semesters.value=parsed.semesters;
        readStatus.textContent=format('verification_file_ready',{name:file.name})+' '+t(parsed?.session&&parsed?.academicYear&&parsed?.semesters?'verification_read_ready':'verification_read_manual');estimate(true);
      }catch(error){if(token===readToken){selectedFile=null;fieldError('offerLetter',error.message);readStatus.textContent='';}}
      finally{if(token===readToken){reading=false;form.querySelector('[type="submit"]').disabled=false;}}
    });
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(reading||submitting)return;submitting=true;form.querySelectorAll('.field-error').forEach(node=>node.textContent='');
      const user=getUser(),state=getState(),userId=user.id,matric=form.elements.matric.value.trim(),letterId='letter-'+userId+'-'+api.uid('file'),file=selectedFile;let stored=false;
      const data={matric,session:form.elements.session.value,academicYear:form.elements.academicYear.value,semesters:form.elements.semesters.value,startMonth:form.elements.startMonth.value,confirmed:form.elements.confirmed.checked};
      try{
        if(!file)throw Error('verification_file_required');
        if(parsed?.matric&&parsed.matric!==matric)throw Error('verification_error_matric_match');
        if(parsed?.text?.trim().length>80&&!parsed.isUiTM)throw Error('verification_institution_error');
        const type=await OfferLetterReader.validate(file);data.letter={id:letterId,name:file.name,type,size:file.size};
        submit({users:structuredClone(state.users)},userId,data);
        form.querySelector('[type="submit"]').disabled=true;
        await store.put(letterId,new Blob([file],{type}));stored=true;
        if(getUser().id!==userId)throw Error('verification_permission');
        const liveState=getState(),liveUser=liveState.users.find(row=>row.id===userId),previous=structuredClone(liveUser);submit(liveState,userId,data);
        if(!persist()){Object.keys(liveUser).forEach(key=>delete liveUser[key]);Object.assign(liveUser,previous);await store.delete(letterId);return;}
        if(previous.verification?.letter?.id)store.delete(previous.verification.letter.id).catch(()=>{});
        editing=false;fill(liveUser);onChange();toast('verification_saved');api.notify?.();
      }catch(error){if(stored)await store.delete(letterId).catch(()=>{});fieldError('submission',messages.ms[error.message]?error.message:'verification_storage_error');}
      finally{submitting=false;form.querySelector('[type="submit"]').disabled=false;}
    });
    function refresh(){if(synchronize(getState())){persist();onChange();}}
    setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
    return {render,refresh};
  }
  messages.ms.verification_status_approved='Akaun pelajar disahkan';
  messages.en.verification_status_approved='Student account verified';
  return {studyPeriod,isActive,synchronize,migrate,submit,review,messages,controller,adminAccount};
});
