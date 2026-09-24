window.Offline={
 key:"memorysaathi_queue_v2",
 queue(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch{return[]}},
 add(item){const q=this.queue();if(!q.some(x=>x.id&&item.id&&x.id===item.id)){q.push(item);localStorage.setItem(this.key,JSON.stringify(q))}},
 async sync(){if(!navigator.onLine)return;const q=this.queue();if(!q.length)return;const remaining=[];for(const item of q){try{const r=await fetch("/api/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:[item]})});if(!r.ok)throw 0;if(window.firebaseReady&&window.firebaseDb){try{await window.firebaseDb.collection("sessions").doc(item.id).set({...item,syncedAt:new Date().toISOString()})}catch(e){remaining.push(item)}}}catch(e){remaining.push(item)}}if(remaining.length)localStorage.setItem(this.key,JSON.stringify(remaining));else localStorage.removeItem(this.key)}
};
window.addEventListener("online",()=>Offline.sync());
window.addEventListener("firebase-ready",()=>Offline.sync());
