const base=()=>process.env.OLLAMA_URL||'http://127.0.0.1:11434'; const model=()=>process.env.OLLAMA_MODEL||'llama3.2:3b';
async function generate(prompt){const r=await fetch(base()+'/api/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model:model(),prompt,stream:false,options:{temperature:0.2}})}); if(!r.ok)throw new Error('Ollama unavailable'); const j=await r.json(); return j.response||'';}
async function available(){try{const r=await fetch(base()+'/api/tags');return r.ok}catch{return false}}
module.exports={generate,available};
