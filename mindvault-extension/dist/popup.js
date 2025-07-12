document.addEventListener("DOMContentLoaded",()=>{let r=[],l=[],f=[],g=[],d=!1,u=!1,p=[],b=[];const a=window.chrome;function A(){typeof a<"u"&&a.storage?a.storage.local.get(["clipboard","websites"],t=>{r=t.clipboard||[],l=t.websites||[],w(),m()}):m()}function m(){F(),R(),W()}function F(){const t=document.getElementById("clipboardCount"),e=document.getElementById("websiteCount");t&&(t.textContent=f.length),e&&(e.textContent=g.length)}function R(){const t=document.getElementById("clipboard-list");if(t){if(f.length===0){t.innerHTML=`
        <div class="empty-state">
          <p>No clipboard data yet</p>
          <small>Copy some text to get started!</small>
        </div>
      `;return}t.innerHTML=f.map(e=>`
        <div class="item" data-id="${e.id}">
          ${d?`<input type="checkbox" class="item-checkbox" data-id="${e.id}" ${p.includes(e.id)?"checked":""}>`:""}
          <div class="item-content">
            <div class="item-text">${c(v(e.content,100))}</div>
            ${e.sourceTitle?`<div class="item-source">From: ${c(e.sourceTitle)}</div>`:""}
            <div class="item-timestamp">${new Date(e.timestamp).toLocaleString()}</div>
          </div>
          <div class="item-meta">
            <div class="timestamp">${E(e.timestamp)}</div>
            <button class="action-btn" data-content="${c(e.content)}" data-original-icon="${y(e.content)?"🔗":"📋"}">
              ${y(e.content)?"🔗":"📋"}
            </button>
            <button class="delete-btn" data-id="${e.id}">🗑️</button>
          </div>
        </div>
      `).join(""),t.querySelectorAll(".action-btn").forEach(e=>{e.addEventListener("click",n=>{const o=n.currentTarget.dataset.content;window.handleClipboardAction(o,n.currentTarget)})}),t.querySelectorAll(".delete-btn").forEach(e=>{e.addEventListener("click",n=>{const o=n.currentTarget.dataset.id;T("clipboard",o)})}),d&&t.querySelectorAll(".item-checkbox").forEach(e=>{e.addEventListener("change",n=>{const o=n.currentTarget.dataset.id;S("clipboard",o,n.currentTarget.checked)})})}}function W(){const t=document.getElementById("websites-list");if(t){if(g.length===0){t.innerHTML=`
        <div class="empty-state">
          <p>No websites tracked yet</p>
          <small>Browse some sites to get started!</small>
        </div>
      `;return}t.innerHTML=g.map(e=>`
        <div class="item" data-id="${e.id}">
          ${u?`<input type="checkbox" class="item-checkbox" data-id="${e.id}" ${b.includes(e.id)?"checked":""}>`:""}
          <div class="item-content">
            <div class="website-header">
              ${e.favicon?`<img src="${e.favicon}" alt="" class="favicon" onerror="this.style.display='none'">`:""}
              <div class="website-title">${c(v(e.title,50))}</div>
            </div>
            <div class="website-url">${c(v(e.url,70))}</div>
            <div class="item-timestamp">Last Visited: ${new Date(e.timestamp).toLocaleString()}</div>
            <div class="item-time-spent">Time Spent: ${L(e.totalTimeSpent||0)}</div>
          </div>
          <div class="item-meta">
            <div class="timestamp">${E(e.timestamp)}</div>
            <button class="action-btn" data-url="${c(e.url)}">🔗</button>
            <button class="delete-btn" data-id="${e.id}">🗑️</button>
          </div>
        </div>
      `).join(""),t.querySelectorAll(".action-btn").forEach(e=>{e.addEventListener("click",n=>{const o=n.currentTarget.dataset.url;window.openWebsite(o)})}),t.querySelectorAll(".delete-btn").forEach(e=>{e.addEventListener("click",n=>{const o=n.currentTarget.dataset.id;T("websites",o)})}),u&&t.querySelectorAll(".item-checkbox").forEach(e=>{e.addEventListener("change",n=>{const o=n.currentTarget.dataset.id;S("websites",o,n.currentTarget.checked)})})}}function v(t,e){return t?t.length>e?t.substring(0,e)+"...":t:""}function E(t){const e=new Date(t),o=new Date-e,i=Math.floor(o/6e4),s=Math.floor(o/36e5),h=Math.floor(o/864e5);return i<1?"Just now":i<60?`${i}m ago`:s<24?`${s}h ago`:h<7?`${h}d ago`:e.toLocaleDateString()}function L(t){if(t==null||isNaN(t))return"0s";const e=Math.floor(t/1e3),n=Math.floor(e/60),o=Math.floor(n/60),i=Math.floor(o/24),s=[];return i>0&&s.push(`${i}d`),o%24>0&&s.push(`${o%24}h`),n%60>0&&s.push(`${n%60}m`),(e%60>0||s.length===0)&&s.push(`${e%60}s`),s.join(" ")}function c(t){if(!t)return"";const e=document.createElement("div");return e.textContent=t,e.innerHTML}function y(t){try{return new URL(t),!0}catch{return!1}}window.handleClipboardAction=async(t,e)=>{if(y(t))window.openWebsite(t);else try{if(await navigator.clipboard.writeText(t),e){const n=e.dataset.originalIcon||"📋";e.textContent="✅",e.style.pointerEvents="none",setTimeout(()=>{e.textContent=n,e.style.pointerEvents="auto"},1500)}}catch(n){console.error("Failed to copy:",n)}},window.openWebsite=t=>{if(typeof a<"u"&&a.tabs){const e=t.startsWith("http://")||t.startsWith("https://")?t:`https://${t}`;a.tabs.create({url:e})}};function w(){const t=document.getElementById("searchInput"),e=document.getElementById("dateFilter"),n=t?t.value.toLowerCase():"",o=e?e.value:"";f=r.filter(i=>{const s=!n||i.content&&i.content.toLowerCase().includes(n)||i.sourceTitle&&i.sourceTitle.toLowerCase().includes(n),h=!o||new Date(i.timestamp).toDateString()===new Date(o).toDateString();return s&&h}),g=l.filter(i=>{const s=!n||i.title&&i.title.toLowerCase().includes(n)||i.url&&i.url.toLowerCase().includes(n),h=!o||new Date(i.timestamp).toDateString()===new Date(o).toDateString();return s&&h}),m()}function P(){let t=`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MindVault Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.6; }
          h1 { color: #4A90E2; text-align: center; margin-bottom: 20px; }
          h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 30px; margin-bottom: 15px; }
          .section { margin-bottom: 30px; }
          .item { background: #f9f9f9; border: 1px solid #e0e0e0; padding: 15px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
          .item p { margin: 0 0 8px 0; }
          .item strong { color: #555; display: inline-block; min-width: 120px; }
          .item .timestamp, .item .source, .item .time-spent { font-size: 0.9em; color: #777; }
          .url-link { color: #007bff; text-decoration: none; word-break: break-all; }
          .url-link:hover { text-decoration: underline; }
          @media print {
            body { margin: 0; padding: 20px; }
            .item { page-break-inside: avoid; margin-bottom: 15px; }
            h1, h2 { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>MindVault Data Report</h1>
        <p style="text-align: center; font-size: 0.9em; color: #666;">Generated on: ${new Date().toLocaleString()}</p>
    `;r.length>0&&(t+=`
        <div class="section">
          <h2>Clipboard History</h2>
      `,r.forEach(i=>{t+=`
          <div class="item">
            <p><strong>Content Copied:</strong> ${c(i.content)}</p>
            <p class="timestamp"><strong>Date & Time:</strong> ${new Date(i.timestamp).toLocaleString()}</p>
            ${i.sourceTitle?`<p class="source"><strong>Source:</strong> ${c(i.sourceTitle)}</p>`:""}
          </div>
        `}),t+="</div>"),l.length>0&&(t+=`
        <div class="section">
          <h2>Website History</h2>
      `,l.forEach(i=>{t+=`
          <div class="item">
            <p><strong>Title:</strong> ${c(i.title)}</p>
            <p><strong>URL Link:</strong> <a href="${c(i.url)}" class="url-link" target="_blank" rel="noopener noreferrer">${c(i.url)}</a></p>
            <p class="timestamp"><strong>Date & Time Visited:</strong> ${new Date(i.timestamp).toLocaleString()}</p>
            <p class="time-spent"><strong>Time Spent:</strong> ${L(i.totalTimeSpent||0)}</p>
          </div>
        `}),t+="</div>"),t+=`
      </body>
      </html>
    `;const e=new Blob([t],{type:"text/html"}),n=URL.createObjectURL(e),o=document.createElement("a");o.href=n,o.download=`mindvault-report-${new Date().toISOString().split("T")[0]}.html`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(n),alert(`Report downloaded as HTML. Open the file in your browser and use the browser's print function (Ctrl+P or Cmd+P) to save it as a PDF.

Steps to save as PDF:
1. Open the downloaded HTML file in your web browser.
2. Press Ctrl+P (Windows/Linux) or Cmd+P (macOS) to open the print dialog.
3. In the print dialog, select 'Save as PDF' or 'Microsoft Print to PDF' (or similar) as your printer destination.
4. Click 'Save' to save the report as a PDF file.`)}function $(t){t==="clipboard"?(d=!d,p=[],document.getElementById("clipboard-select-btn").textContent=d?"Done":"Select",document.getElementById("clipboard-delete-selected-btn").classList.toggle("hidden",!d)):t==="websites"&&(u=!u,b=[],document.getElementById("websites-select-btn").textContent=u?"Done":"Select",document.getElementById("websites-delete-selected-btn").classList.toggle("hidden",!u)),m()}function S(t,e,n){t==="clipboard"?n?p.push(e):p=p.filter(o=>o!==e):t==="websites"&&(n?b.push(e):b=b.filter(o=>o!==e))}async function T(t,e){confirm(`Are you sure you want to delete this ${t==="clipboard"?"clipboard entry":"website entry"}?`)&&(t==="clipboard"?(r=r.filter(n=>n.id!==e),await a.storage.local.set({clipboard:r})):t==="websites"&&(l=l.filter(n=>n.id!==e),await a.storage.local.set({websites:l})),w())}async function C(t){let e,n,o;if(t==="clipboard"?(e=p,n=r,o="clipboard"):t==="websites"&&(e=b,n=l,o="websites"),e.length===0){alert("No items selected for deletion.");return}if(!confirm(`Are you sure you want to delete ${e.length} selected ${t} entries? This action cannot be undone.`))return;const i=n.filter(s=>!e.includes(s.id));t==="clipboard"?(r=i,p=[],d=!1,document.getElementById("clipboard-select-btn").textContent="Select",document.getElementById("clipboard-delete-selected-btn").classList.add("hidden")):t==="websites"&&(l=i,b=[],u=!1,document.getElementById("websites-select-btn").textContent="Select",document.getElementById("websites-delete-selected-btn").classList.add("hidden")),await a.storage.local.set({[o]:i}),w()}const x=document.getElementById("searchInput"),D=document.getElementById("dateFilter");x&&x.addEventListener("input",w),D&&D.addEventListener("change",w),document.querySelectorAll(".tab").forEach(t=>{t.addEventListener("click",()=>{const e=t.dataset.tab;document.querySelectorAll(".tab").forEach(o=>o.classList.remove("active")),t.classList.add("active"),document.querySelectorAll(".tab-content").forEach(o=>{o.classList.remove("active")});const n=document.getElementById(`${e}-tab`);n&&n.classList.add("active")})});const I=document.getElementById("clearClipboard"),k=document.getElementById("clearWebsites"),B=document.getElementById("clearAll");I&&I.addEventListener("click",()=>{confirm("Are you sure you want to clear all clipboard history? This action cannot be undone.")&&typeof a<"u"&&a.storage&&a.storage.local.set({clipboard:[]},()=>{r=[],f=[],m()})}),k&&k.addEventListener("click",()=>{confirm("Are you sure you want to clear all website history? This action cannot be undone.")&&typeof a<"u"&&a.storage&&a.storage.local.set({websites:[]},()=>{l=[],g=[],m()})}),B&&B.addEventListener("click",()=>{confirm("Are you sure you want to clear ALL MindVault history (clipboard and websites)? This action cannot be undone.")&&typeof a<"u"&&a.storage&&a.storage.local.clear(()=>{r=[],l=[],f=[],g=[],m()})});const M=document.getElementById("downloadReport");M&&M.addEventListener("click",P),document.getElementById("clipboard-select-btn").addEventListener("click",()=>$("clipboard")),document.getElementById("clipboard-delete-selected-btn").addEventListener("click",()=>C("clipboard")),document.getElementById("websites-select-btn").addEventListener("click",()=>$("websites")),document.getElementById("websites-delete-selected-btn").addEventListener("click",()=>C("websites")),A()});
