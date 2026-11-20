(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OfferLetterReader=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function parse(text) {
    const normalized=String(text||'').replace(/\s+/g,' ');
    const session=normalized.match(/(?:sesi|session)\s*(?:(?:akademik|kemasukan|academic)\s*)?[:\-]?\s*([12]|i{1,2})\s*(?:[,/:()\-]|tahun|of)*\s*(20\d{2})\s*[\/\-]\s*(20\d{2})/i);
    const duration=normalized.match(/(?:tempoh\s+(?:pengajian|program)|(?:study|programme|program)\s+duration|duration)\s*[:\-]?\s*(\d{1,2})\s*(?:semester|sem\b)/i)
      || normalized.match(/(?:tempoh\s+(?:pengajian|program)|(?:study|programme|program)\s+duration|duration).{0,45}?\b(\d{1,2})\s*semester/i);
    const years=normalized.match(/(?:tempoh\s+(?:pengajian|program)|(?:study|programme|program)\s+duration|duration)\s*[:\-]?\s*(\d(?:\.5)?)\s*(?:tahun|years?)/i);
    const matric=normalized.match(/(?:no\.?\s*(?:matrik|pelajar)|nombor\s*(?:matrik|pelajar)|student\s*(?:id|number)|matric(?:ulation)?\s*(?:no\.?|number)?)\s*[:\-]?\s*(\d{10})\b/i);
    return {text:String(text||''),session:session?(/i/i.test(session[1])?session[1].length:Number(session[1])):null,
      academicYear:session&&Number(session[3])===Number(session[2])+1?Number(session[2]):null,
      semesters:duration?Number(duration[1]):years?Number(years[1])*2:null,matric:matric?.[1]||null,isUiTM:/\buitm\b|universiti\s+teknologi\s+mara/i.test(normalized)};
  }
  let pdfLibrary,ocrLibrary;
  function script(url) {return new Promise((resolve,reject)=>{const node=document.createElement('script');node.src=url;node.onload=resolve;node.onerror=()=>{node.remove();reject(Error('reader_unavailable'));};document.head.append(node);});}
  async function pdfjs(){if(!pdfLibrary){pdfLibrary=import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs').catch(error=>{pdfLibrary=null;throw error;});}const lib=await pdfLibrary;lib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';return lib;}
  async function ocr(){if(!ocrLibrary)ocrLibrary=script('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js').catch(error=>{ocrLibrary=null;throw error;});await ocrLibrary;return globalThis.Tesseract.createWorker('eng+msa',1,{workerPath:'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js'});}
  async function validate(file) {
    if(!file||file.size===0||file.size>5*1024*1024)throw Error('verification_file_size');
    const bytes=new Uint8Array(await file.slice(0,8).arrayBuffer());
    const pdf=bytes[0]===37&&bytes[1]===80&&bytes[2]===68&&bytes[3]===70;
    const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;
    const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
    if(!pdf&&!png&&!jpg)throw Error('verification_file_type');
    return pdf?'application/pdf':png?'image/png':'image/jpeg';
  }
  async function read(file) {
    const type=await validate(file);let worker,documentPDF;
    try {
      if(type!=='application/pdf'){worker=await ocr();return parse((await worker.recognize(file)).data.text);}
      const lib=await pdfjs();documentPDF=await lib.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;
      let text='';const pageCount=Math.min(documentPDF.numPages,6);
      for(let i=1;i<=pageCount;i++){
        const page=await documentPDF.getPage(i),content=await page.getTextContent();
        let pageText=content.items.map(item=>item.str+(item.hasEOL?'\n':' ')).join('');
        if(pageText.trim().length<40){
          worker=worker||await ocr();const viewport=page.getViewport({scale:1.4}),canvas=document.createElement('canvas');
          canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
          await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
          pageText=(await worker.recognize(canvas)).data.text;canvas.width=0;canvas.height=0;
        }
        text+='\n'+pageText;page.cleanup();
      }
      return {...parse(text),pagesRead:pageCount,totalPages:documentPDF.numPages};
    } finally {if(worker)await worker.terminate();if(documentPDF)await documentPDF.destroy();}
  }
  return {parse,validate,read};
});
