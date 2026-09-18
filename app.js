const C=window.rentalConfig,$=s=>document.querySelector(s),money=n=>'Sob consulta',esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cart=new Map();let category='Todos',favoritesOnly=false,favorites=new Set();try{const data=JSON.parse(localStorage.getItem('la-bella-favorites')||'[]');if(Array.isArray(data))favorites=new Set(data);}catch{}
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function rentalDays(){const start=$('#start').value,end=$('#end').value;if(!start||!end)return 1;return Math.max(1,Math.round((Date.parse(end+'T12:00:00Z')-Date.parse(start+'T12:00:00Z'))/86400000));}
function calc(){return [...cart].reduce((t,[id,n])=>t+C.products.find(p=>p.id===id).price*n,0)*rentalDays();}
function toast(text){$('#toast').innerHTML=`<span>${esc(text)}</span>`;$('#toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('visible'),1900);}
function render(){const term=$('#search').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const list=C.products.filter(p=>(category==='Todos'||category===p.category)&&(!favoritesOnly||favorites.has(p.id))&&(p.name+' '+p.category).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(term));$('#categories').innerHTML=['Todos',...new Set(C.products.map(p=>p.category))].map(c=>`<button data-category="${esc(c)}" class="${category===c?'active':''}" aria-pressed="${category===c}">${esc(c)}</button>`).join('');$('#result-count').textContent=`${favoritesOnly?'Seus favoritos · ':''}${list.length} artigos`;
$('#grid').innerHTML=list.map(p=>{const qty=cart.get(p.id)||0,inCart=qty>0;return `<article class="card ${inCart?'in-cart-active':''}"><div class="card-media-wrap"><button class="card-photo" data-detail="${p.id}" aria-label="Ver ${esc(p.name)}"><img src="assets/${p.id}.jpg" alt="${esc(p.name)} — imagem ilustrativa" width="500" height="400" loading="lazy"></button>${inCart?`<span class="card-qty-badge" aria-label="${qty} no orçamento"><strong>${qty}</strong> no orçamento</span>`:''}<button class="heart ${favorites.has(p.id)?'active':''}" data-favorite="${p.id}" aria-label="Favoritar ${esc(p.name)}" aria-pressed="${favorites.has(p.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button></div><div class="card-top"><p class="category">${esc(p.category)}</p></div><div class="card-body"><h3><button data-detail="${p.id}">${esc(p.name)}</button></h3><p class="description"><span class="desc-text">${esc(p.description)}</span><button type="button" class="learn-more" data-detail="${p.id}">Saiba mais</button></p><div class="card-action-row"><div class="price"><strong>${money(p.price)}</strong></div>${inCart?`<div class="qty-stepper" role="group" aria-label="Quantidade de ${esc(p.name)}"><button type="button" class="stepper-btn minus" data-quantity="${p.id}" data-delta="-1" aria-label="Diminuir ${esc(p.name)}">−</button><div class="stepper-display"><span class="stepper-num">${qty}</span></div><button type="button" class="stepper-btn plus" data-quantity="${p.id}" data-delta="1" aria-label="Aumentar ${esc(p.name)}">+</button></div>`:`<button class="add" data-add="${p.id}" aria-label="Incluir ${esc(p.name)} na minha festa"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Incluir<span class="add-rest"> na minha festa</span></span></button>`}</div></div></article>`;}).join('');$('#empty').hidden=!!list.length;$('#favorites').setAttribute('aria-pressed',favoritesOnly);updateCart();}
function updateCart(){const count=[...cart.values()].reduce((a,b)=>a+b,0);$('#count').textContent=count;const fl=$('#floating');if(fl){fl.hidden=!count;if(count){fl.classList.add('visible');const fit=$('#floating-items-text');if(fit)fit.innerHTML=`<b id="floating-count">${count}</b> ${count===1?'item no orçamento':'itens no orçamento'}`;}else{fl.classList.remove('visible');}}$('#floating-total').textContent=money(calc());$('#days').textContent=`${rentalDays()} diária${rentalDays()>1?'s':''} estimada${rentalDays()>1?'s':''}`;$('#total').textContent=money(calc());$('#preview').disabled=!count;$('#cart-items').innerHTML=[...cart].map(([id,n])=>{const p=C.products.find(p=>p.id===id);return `<div class="cart-row"><div><strong>${esc(p.name)}</strong><small>${money(p.price)} </small></div><div class="quantity"><button type="button" data-quantity="${id}" data-delta="-1" aria-label="Diminuir ${esc(p.name)}">−</button><span aria-label="Quantidade">${n}</span><button type="button" data-quantity="${id}" data-delta="1" aria-label="Aumentar ${esc(p.name)}">+</button></div></div>`;}).join('')||'<p class="note">Seu orçamento está vazio. Adicione artigos do catálogo para começar.</p>';}
function openCart(){$('#start').min=today();$('#end').min=$('#start').value||today();updateCart();$('#cart').showModal();}
function validDates(){const start=$('#start'),end=$('#end');start.setCustomValidity(start.value&&start.value<today()?'Escolha uma data a partir de hoje.':'');end.min=start.value||today();end.setCustomValidity(end.value&&start.value&&end.value<start.value?'A devolução deve ser no mesmo dia ou depois do início.':'');updateCart();}
function quote(){const date=s=>s.split('-').reverse().join('/');return `${C.demo?'[ORÇAMENTO DEMONSTRATIVO]\n\n':''}Olá, ${C.name}! Gostaria de um orçamento para minha festa.\n\nNome: ${$('#name').value.trim()}\nEvento: ${$('#event').value}\nLocal: ${$('#location').value.trim()}\nPeríodo: ${date($('#start').value)} a ${date($('#end').value)}\nLogística: ${$('#delivery').value}\n${$('#guests').value?'Convidados: '+$('#guests').value+'\n':''}\nArtigos:\n${[...cart].map(([id,n])=>{const p=C.products.find(p=>p.id===id);return `• ${n} × ${p.name}`;}).join('\n')}\n\nPeríodo estimado: ${rentalDays()} diária(s)\nValor: ${money(calc())}\nEntrega, montagem e condições a combinar.\n${$('#notes').value.trim()?'\nObservações: '+$('#notes').value.trim()+'\n':''}\nPodem confirmar a disponibilidade, o valor final e as condições de locação?`;}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.close){$('#'+b.dataset.close).close();return;}if(b.dataset.category){category=b.dataset.category;render();}if(b.dataset.add){const id=b.dataset.add;cart.set(id,(cart.get(id)||0)+1);render();toast('Artigo adicionado ao orçamento.');}if(b.dataset.quantity){const id=b.dataset.quantity,n=cart.get(id)+Number(b.dataset.delta);if(n<=0)cart.delete(id);else cart.set(id,n);render();}if(b.dataset.favorite){const id=b.dataset.favorite;favorites.has(id)?favorites.delete(id):favorites.add(id);try{localStorage.setItem('la-bella-favorites',JSON.stringify([...favorites]));}catch{}render();}if(b.dataset.detail){const p=C.products.find(p=>p.id===b.dataset.detail);$('#detail-content').innerHTML=`<img class="detail-photo" src="assets/${p.id}.jpg" alt="${esc(p.name)} — imagem ilustrativa"><p class="eyebrow">${esc(p.category)}</p><h2>${esc(p.name)}</h2><p>${esc(p.detail)}</p><p><strong>${money(p.price)}</strong> </p><button class="primary" data-add="${p.id}">Incluir na minha festa</button>`;$('#detail').showModal();}});
$('#open-cart').onclick=openCart;$('#floating').onclick=openCart;$('#search').oninput=render;$('#favorites').onclick=()=>{favoritesOnly=!favoritesOnly;render();$('#catalogo').scrollIntoView();};$('#reset').onclick=()=>{category='Todos';favoritesOnly=false;$('#search').value='';render();};$('#start').onchange=validDates;$('#end').onchange=validDates;
for(const id of ['name','location'])$('#'+id).oninput=()=>$('#'+id).setCustomValidity('');
$('#quote-form').onsubmit=e=>{e.preventDefault();validDates();for(const id of ['name','location'])$('#'+id).setCustomValidity($('#'+id).value.trim()?'':'Preencha este campo.');if(!cart.size||!$('#quote-form').reportValidity())return;$('#message-text').textContent=quote();const configured=/^\d{10,15}$/.test(C.whatsapp);$('#send').hidden=!configured;$('#contact-note').textContent=configured?'Revise a mensagem antes de enviá-la. A reserva depende de confirmação.':'WhatsApp da locadora ainda não configurado. Você pode copiar a solicitação abaixo.';$('#message').showModal();};
$('#send').onclick=()=>{if(/^\d{10,15}$/.test(C.whatsapp))window.open('https://wa.me/'+C.whatsapp+'?text='+encodeURIComponent($('#message-text').textContent),'_blank','noopener,noreferrer');};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText($('#message-text').textContent);$('#copy').textContent='Solicitação copiada ✓';setTimeout(()=>$('#copy').textContent='Copiar solicitação',2500);}catch{const r=document.createRange();r.selectNodeContents($('#message-text'));const s=window.getSelection();s.removeAllRanges();s.addRange(r);$('#contact-note').textContent='Texto selecionado. Use Copiar no seu navegador.';}};

// Carrossel horizontal para os passos no mobile com autoplay automático
const stepsCarousel = document.getElementById('steps-carousel');
const stepDots = document.querySelectorAll('.step-dot');
if (stepsCarousel && stepDots.length) {
  const cards = stepsCarousel.querySelectorAll('.step-card');
  let currentIndex = 0;
  let autoplayInterval = null;
  let pauseTimeout = null;
  let isUserInteracting = false;

  const setActiveDot = (index) => {
    currentIndex = index;
    stepDots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
  };

  const scrollToStep = (index) => {
    if (!cards[index]) return;
    const card = cards[index];
    const targetLeft = card.offsetLeft - stepsCarousel.offsetLeft - (stepsCarousel.clientWidth - card.clientWidth) / 2;
    stepsCarousel.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth'
    });
    setActiveDot(index);
  };

  const startAutoplay = () => {
    if (autoplayInterval) clearInterval(autoplayInterval);
    autoplayInterval = setInterval(() => {
      if (isUserInteracting) return;
      if (stepsCarousel.scrollWidth > stepsCarousel.clientWidth + 5) {
        const nextIndex = (currentIndex + 1) % cards.length;
        scrollToStep(nextIndex);
      }
    }, 3200);
  };

  const pauseAutoplay = () => {
    isUserInteracting = true;
    if (pauseTimeout) clearTimeout(pauseTimeout);
    pauseTimeout = setTimeout(() => {
      isUserInteracting = false;
    }, 4000);
  };

  stepsCarousel.addEventListener('scroll', () => {
    const scrollCenter = stepsCarousel.scrollLeft + stepsCarousel.clientWidth / 2;
    let closestIndex = 0;
    let minDiff = Infinity;
    cards.forEach((card, idx) => {
      const cardCenter = (card.offsetLeft - stepsCarousel.offsetLeft) + card.clientWidth / 2;
      const diff = Math.abs(cardCenter - scrollCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });
    setActiveDot(closestIndex);
  }, { passive: true });

  stepsCarousel.addEventListener('touchstart', pauseAutoplay, { passive: true });
  stepsCarousel.addEventListener('touchend', pauseAutoplay, { passive: true });
  stepsCarousel.addEventListener('mouseenter', pauseAutoplay);
  stepsCarousel.addEventListener('mouseleave', () => { isUserInteracting = false; });

  stepDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      pauseAutoplay();
      scrollToStep(idx);
    });
  });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startAutoplay();
}

render();
