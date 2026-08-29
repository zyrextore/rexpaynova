/* ZYREX PAY AI — presentation-only enhancements.
   No API calls, no auth/session logic, no writes to app state.
   Purely toggles CSS classes / reads input values already used by app.js. */
(function(){
  var $ = function(s){ return document.querySelector(s); };
  var $$ = function(s){ return document.querySelectorAll(s); };

  /* ---- balance show/hide ---- */
  var eyeBtn = $('[data-role="toggle-balance"]');
  if(eyeBtn){
    var hidden = false;
    eyeBtn.addEventListener('click', function(){
      hidden = !hidden;
      $$('#balance,#walletBalance').forEach(function(el){ el.classList.toggle('blurred', hidden); });
      var icon = eyeBtn.querySelector('i');
      if(icon) icon.setAttribute('data-icon', hidden ? 'eye-off' : 'eye');
      eyeBtn.setAttribute('aria-label', hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo');
    });
  }

  /* ---- top up amount chips: just fill the existing input ---- */
  var chipRow = $('[data-role="amount-chips"]');
  if(chipRow){
    chipRow.addEventListener('click', function(e){
      var chip = e.target.closest('.chip');
      if(!chip) return;
      var input = $('#topupAmount');
      if(input) input.value = chip.dataset.amount;
      $$('.chip', chipRow).forEach(function(c){ c.classList.toggle('active', c === chip); });
    });
  }

  /* ---- brief skeleton shimmer while the first balance/tx figures arrive ---- */
  var skeletonTargets = ['#balance', '#walletBalance', '#txCount'];
  skeletonTargets.forEach(function(sel){
    var el = $(sel);
    if(el) el.classList.add('skeleton');
  });
  function clearSkeleton(){
    skeletonTargets.forEach(function(sel){
      var el = $(sel);
      if(el) el.classList.remove('skeleton');
    });
  }
  var appView = $('#appView');
  if(appView){
    var mo = new MutationObserver(function(){
      if(!appView.classList.contains('hidden')) clearSkeleton();
    });
    mo.observe(appView, { attributes:true, attributeFilter:['class'] });
  }
  skeletonTargets.forEach(function(sel){
    var el = $(sel);
    if(!el) return;
    var mo2 = new MutationObserver(function(){ el.classList.remove('skeleton'); });
    mo2.observe(el, { childList:true, characterData:true, subtree:true });
  });
  setTimeout(clearSkeleton, 4000); // safety fallback, never blocks content
})();
