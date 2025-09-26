import React from 'react';
const imgs = Array.from({length:12}).map((_,i)=>`/gallery/${String(i+1).padStart(2,'0')}.jpg`);

export default function Gallery(){
  return (
    <div>
      <h3 style={{color:'var(--gold)'}}>Gallery</h3>
      <div className="bo-grid">
        {imgs.map(src=>(
          <div key={src} className="bo-card" style={{padding:0,overflow:'hidden'}}>
            <img src={src} alt="" style={{display:'block',width:'100%',height:220,objectFit:'cover'}} onError={(e:any)=>{e.currentTarget.style.display='none'}} />
          </div>
        ))}
      </div>
      <p style={{color:'#aaa',marginTop:8}}>Add JPGs to <code>/public/gallery</code> named <code>01.jpg</code>, <code>02.jpg</code>, …</p>
    </div>
  );
}
