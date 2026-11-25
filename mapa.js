/* Ápice · mapa de músculos anatômico (frente e costas). Metade direita desenhada, a esquerda é espelhada. */
(function(){
const SIL='M100,8 C109,8 115,15 115,27 C115,37 111,44 108,47 L108,54 C114,60 124,63 134,65 C147,67 155,76 156,92 C157,104 156,116 155,128 C156,140 156,150 155,156 C159,172 158,196 153,222 L152,230 C156,236 156,246 151,252 C147,256 142,252 141,246 C140,240 142,234 143,228 C141,206 138,184 139,164 C137,150 136,138 134,124 L131,110 C130,128 127,150 124,176 C123,188 125,198 128,208 C134,226 136,258 134,288 C133,306 129,322 126,336 C130,352 131,376 126,396 C124,404 121,412 121,420 C126,424 128,430 124,433 L106,433 C104,426 106,420 109,416 C106,398 104,376 106,352 C104,342 104,334 104,326 C102,296 101,262 100,232 Z';
const OMBRO='M134,66 C148,67 156,78 156,94 C156,104 153,112 150,116 C145,106 139,98 131,92 C130,82 131,72 134,66Z';
const ANTE='M144,158 C152,162 157,176 156,192 C155,206 153,218 151,226 L144,226 C141,210 139,192 139,176 C139,168 141,162 144,158Z';
const FRONT={
 trapezio:'M108,54 C114,60 124,63 133,65 C122,68 113,70 106,70 C107,64 108,59 108,54Z',
 ombro:OMBRO,
 peito:'M102,72 C112,70 124,70 131,74 C134,84 134,96 130,106 C122,114 110,116 102,112Z',
 biceps:'M137,100 C147,104 153,116 153,132 C153,142 150,150 146,154 C140,150 137,140 136,128 C135,118 135,108 137,100Z',
 antebraco:ANTE,
 abdomen:'M102,118 h11 q3,0 3,3 v14 q0,2 -2,2 h-12Z M102,140 h12 q3,0 3,3 v14 q0,2 -2,2 h-13Z M102,162 h12 q3,0 3,3 v13 q0,2 -2,2 h-13Z M102,184 h12 q2,0 2,3 v10 q-6,10 -14,14Z',
 obliquo:'M119,116 C125,120 129,132 128,150 C127,166 125,180 125,196 C121,200 119,202 118,204 C119,186 120,170 120,152 C120,138 120,126 119,116Z',
 quadriceps:'M104,226 C112,214 126,214 132,226 C136,250 134,284 128,314 C126,324 122,332 118,334 C112,334 108,330 106,324 C103,296 102,258 104,226Z',
 panturrilha:'M109,352 C116,346 126,350 128,362 C129,380 126,396 122,412 L114,412 C110,396 107,374 109,352Z'
};
const BACK={
 trapezio:'M100,50 L108,52 C112,60 122,63 134,66 C126,74 116,86 108,108 L100,120Z',
 ombro:OMBRO,
 dorsal:'M110,104 C118,94 128,90 132,96 C134,116 130,146 122,176 C116,174 110,170 106,164 C107,142 108,122 110,104Z',
 triceps:'M137,96 C148,100 154,114 154,130 C154,142 151,150 147,154 C141,150 137,138 136,126 C135,114 135,104 137,96Z',
 antebraco:ANTE,
 lombar:'M101,128 L107,124 C107,146 110,164 118,178 L119,200 C112,200 106,201 101,202Z',
 gluteo:'M101,206 C114,198 130,202 134,218 C137,236 132,252 118,256 C110,258 104,256 101,254Z',
 posterior:'M104,262 C114,256 130,258 133,272 C134,294 130,316 124,334 L110,336 C105,312 103,286 104,262Z',
 panturrilha:'M107,346 C118,338 131,350 130,372 C129,390 124,402 119,412 L111,412 C105,392 103,366 107,346Z'
};
const NOMES={peito:'Peitoral',ombro:'Ombros',biceps:'Bíceps',triceps:'Tríceps',antebraco:'Antebraço',abdomen:'Abdômen',obliquo:'Oblíquos',quadriceps:'Quadríceps',panturrilha:'Panturrilha',trapezio:'Trapézio',dorsal:'Dorsais',lombar:'Lombar',gluteo:'Glúteos',posterior:'Posterior da coxa'};
let uid=0;
function bodyMap(side,prim=[],sec=[],click=false,sel=null){
  const M=side==='f'?FRONT:BACK, id='bm'+(++uid);
  const half=Object.entries(M).map(([k,d])=>{
    const c=sel===k?'m sel':prim.includes(k)?'m p':sec.includes(k)?'m s':'m';
    return`<path class="${c}" d="${d}" ${(c==='m p'||c==='m sel')?`filter="url(#${id})"`:''} ${click?`onclick="pickMuscle('${k}')"`:''}><title>${NOMES[k]}</title></path>`}).join('');
  const linhas=side==='f'
    ?'<path class="ln" d="M100,72 L100,212 M104,248 C110,280 112,300 112,318 M120,222 C124,256 125,290 122,322"/>'
    :'<path class="ln" d="M100,50 L100,206 M100,206 C108,214 112,228 112,246"/>';
  const half2=`<path class="sk" d="${SIL}"/>${linhas}${half}`;
  return`<svg class="bmap${click?' click':''}" viewBox="40 0 120 440"><defs><filter id="${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
   <g>${half2}</g><g transform="translate(200 0) scale(-1 1)">${half2}</g></svg>`;
}
window.APICE_MAPA={bodyMap,NOMES,FRONT,BACK};
})();
