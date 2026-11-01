import sharp from 'sharp';

const W=2500,H=1686,cellW=W/3,cellH=H/2;
const ink='#173D39',gold='#C8AD7F',cream='#F7F6F2',muted='#65736C';
const actions=[
 {title:'本月收入',detail:'日常收入 · 公司收入 · 總收入',icon:'<path d="M34 18v28m-12-12 12 12 12-12"/><path d="M18 54h32"/>'},
 {title:'本月支出',detail:'日常支出 · 公司支出 · 總支出',icon:'<path d="M34 46V18m-12 12 12-12 12 12"/><path d="M18 54h32"/>'},
 {title:'本月結餘',detail:'收入 − 支出',icon:'<path d="M13 45h13l7-22 9 34 7-18h9"/><path d="M16 14h36"/>'},
 {title:'公司收支',detail:'美國 · 英國 · 歐盟',icon:'<path d="M13 54h42M18 54V27h30v27M24 27v-9h18v9M24 34h5m8 0h5M24 42h5m8 0h5"/>'},
 {title:'目前存款',detail:'共同存款 · 本月存取',icon:'<path d="M14 25h40v28H14zM18 25v-7h32v7M14 34h40"/><path d="M39 43h8"/>'},
 {title:'財務中控',detail:'開啟共享財務儀表板',icon:'<rect x="13" y="15" width="42" height="34" rx="2"/><path d="M22 57h24M34 49v8M22 38l8-8 7 6 10-11"/>'},
];
const tiles=actions.map((a,i)=>{
 const x=(i%3)*cellW,y=Math.floor(i/3)*cellH,highlight=i===5;
 const fg=ink,accent=highlight?ink:gold,detail=highlight?'#405B4E':muted;
 const cx=x+cellW/2,iconY=y+cellH*.31;
 return `${highlight?`<rect x="${x+10}" y="${y+10}" width="${cellW-20}" height="${cellH-20}" fill="${gold}"/>`:''}
  <g transform="translate(${cx-34} ${iconY-34})" fill="none" stroke="${fg}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${a.icon}</g>
  <path d="M${cx-43} ${iconY+50}h86" stroke="${accent}" stroke-width="2"/>
  <text x="${cx}" y="${y+cellH*.66}" fill="${fg}" font-family="Noto Sans TC, sans-serif" font-size="66" font-weight="600" text-anchor="middle">${a.title}</text>
  <text x="${cx}" y="${y+cellH*.74}" fill="${detail}" font-family="Noto Sans TC, sans-serif" font-size="25" text-anchor="middle">${a.detail}</text>`;
}).join('');
const svg=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
 <rect width="${W}" height="${H}" fill="${cream}"/>${tiles}
 <path d="M${cellW} 0v${H}M${cellW*2} 0v${H}M0 ${cellH}h${W}" stroke="${gold}" stroke-opacity=".52" stroke-width="2"/>
 <path d="M0 1h${W}M0 ${H-1}h${W}" stroke="${ink}" stroke-opacity=".16" stroke-width="2"/>
 </svg>`;

(async()=>{
 await sharp(Buffer.from(svg)).png({compressionLevel:9,palette:false}).toFile('public/rich-menu.png');
 console.log('Generated public/rich-menu.png (2500 x 1686)');
})();
