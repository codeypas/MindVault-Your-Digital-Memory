document.addEventListener("DOMContentLoaded",()=>{let s=[],l=[],r=[],d=[];const a=window.chrome;function S(){typeof a<"u"&&a.storage?a.storage.local.get(["clipboard","websites"],e=>{s=e.clipboard||[],l=e.websites||[],r=[...s],d=[...l],u()}):u()}function u(){$(),C(),I()}function $(){const e=document.getElementById("clipboardCount"),t=document.getElementById("websiteCount");e&&(e.textContent=r.length),t&&(t.textContent=d.length)}function C(){const e=document.getElementById("clipboard-list");if(e){if(r.length===0){e.innerHTML=`
        <div class="empty-state">
          <p>No clipboard data yet</p>
          <small>Copy some text to get started!</small>
        </div>
      `;return}e.innerHTML=r.map(t=>`
        <div class="item">
          <div class="item-content">
            <div class="item-text">${f(p(t.content,80))}</div>
            ${t.sourceTitle?`<div class="item-source">From: ${f(t.sourceTitle)}</div>`:""}
            <div class="item-timestamp">${new Date(t.timestamp).toLocaleString()}</div>
          </div>
          <div class="item-meta">
            <div class="timestamp">${v(t.timestamp)}</div>
            <button class="action-btn" onclick="copyToClipboard('${b(t.content)}')">📋</button>
          </div>
        </div>
      `).join("")}}function I(){const e=document.getElementById("websites-list");if(e){if(d.length===0){e.innerHTML=`
        <div class="empty-state">
          <p>No websites tracked yet</p>
          <small>Browse some sites to get started!</small>
        </div>
      `;return}e.innerHTML=d.map(t=>`
        <div class="item">
          <div class="item-content">
            <div class="website-header">
              ${t.favicon?`<img src="${t.favicon}" alt="" class="favicon" onerror="this.style.display='none'">`:""}
              <div class="website-title">${f(p(t.title,40))}</div>
            </div>
            <div class="website-url">${f(p(t.url,50))}</div>
            <div class="item-timestamp">${new Date(t.timestamp).toLocaleString()}</div>
          </div>
          <div class="item-meta">
            <div class="timestamp">${v(t.timestamp)}</div>
            <button class="action-btn" onclick="openWebsite('${b(t.url)}')">🔗</button>
          </div>
        </div>
      `).join("")}}function p(e,t){return e?e.length>t?e.substring(0,t)+"...":e:""}function v(e){const t=new Date(e),o=new Date-t,n=Math.floor(o/6e4),c=Math.floor(o/36e5),m=Math.floor(o/864e5);return n<1?"Just now":n<60?`${n}m ago`:c<24?`${c}h ago`:m<7?`${m}d ago`:t.toLocaleDateString()}function f(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function b(e){return e?e.replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/\n/g,"\\n"):""}window.copyToClipboard=async e=>{try{await navigator.clipboard.writeText(e)}catch(t){console.error("Failed to copy:",t)}},window.openWebsite=e=>{typeof a<"u"&&a.tabs&&a.tabs.create({url:e})};function g(){const e=document.getElementById("searchInput"),t=document.getElementById("dateFilter"),i=e?e.value.toLowerCase():"",o=t?t.value:"";r=s.filter(n=>{const c=!i||n.content&&n.content.toLowerCase().includes(i)||n.sourceTitle&&n.sourceTitle.toLowerCase().includes(i),m=!o||new Date(n.timestamp).toDateString()===new Date(o).toDateString();return c&&m}),d=l.filter(n=>{const c=!i||n.title&&n.title.toLowerCase().includes(i)||n.url&&n.url.toLowerCase().includes(i),m=!o||new Date(n.timestamp).toDateString()===new Date(o).toDateString();return c&&m}),u()}function B(){const e={exportDate:new Date().toISOString(),clipboard:s,websites:l},t=JSON.stringify(e,null,2),i=new Blob([t],{type:"application/json"}),o=URL.createObjectURL(i),n=document.createElement("a");n.href=o,n.download=`mindvault-${new Date().toISOString().split("T")[0]}.json`,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(o)}function O(){let e=`MINDVAULT EXPORT
=================

`;e+=`Exported: ${new Date().toLocaleString()}

`,s.length>0&&(e+=`CLIPBOARD HISTORY
-----------------
`,s.forEach((n,c)=>{e+=`${c+1}. ${new Date(n.timestamp).toLocaleString()}
`,n.sourceTitle&&(e+=`   Source: ${n.sourceTitle}
`),e+=`   Content: ${n.content}

`})),l.length>0&&(e+=`WEBSITE HISTORY
---------------
`,l.forEach((n,c)=>{e+=`${c+1}. ${new Date(n.timestamp).toLocaleString()}
`,e+=`   Title: ${n.title}
`,e+=`   URL: ${n.url}

`}));const t=new Blob([e],{type:"text/plain"}),i=URL.createObjectURL(t),o=document.createElement("a");o.href=i,o.download=`mindvault-${new Date().toISOString().split("T")[0]}.txt`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(i)}const w=document.getElementById("searchInput"),y=document.getElementById("dateFilter");w&&w.addEventListener("input",g),y&&y.addEventListener("change",g),document.querySelectorAll(".tab").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.tab;document.querySelectorAll(".tab").forEach(o=>o.classList.remove("active")),e.classList.add("active"),document.querySelectorAll(".tab-content").forEach(o=>{o.classList.remove("active")});const i=document.getElementById(`${t}-tab`);i&&i.classList.add("active")})});const L=document.getElementById("clearClipboard"),h=document.getElementById("clearWebsites"),E=document.getElementById("clearAll");L&&L.addEventListener("click",()=>{typeof a<"u"&&a.storage&&a.storage.local.set({clipboard:[]},()=>{s=[],r=[],u()})}),h&&h.addEventListener("click",()=>{typeof a<"u"&&a.storage&&a.storage.local.set({websites:[]},()=>{l=[],d=[],u()})}),E&&E.addEventListener("click",()=>{typeof a<"u"&&a.storage&&a.storage.local.clear(()=>{s=[],l=[],r=[],d=[],u()})});const T=document.getElementById("downloadJSON"),D=document.getElementById("downloadTXT");T&&T.addEventListener("click",B),D&&D.addEventListener("click",O),S()});
