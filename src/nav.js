/* =========================================================
   NAVIGATION : le pied de chaque décor est un obstacle.
   Grille sur la zone praticable, A* 8 directions, lissage en ligne de vue.
   ========================================================= */
const NAV_C=12,NAV_Y0=Y0-6,NAV_Y1=Y1+6,NAV_RX=13,NAV_RY=7;
function buildNav(m){
  const foot=[];
  for(const g of m.props)for(const r of g.block){
    if(r[3]<NAV_Y0-30||r[3]>NAV_Y1+30)continue;
    const d=clamp((r[2]-r[0])*.28,8,38);foot.push([r[0]+2,r[3]-d,r[2]-2,r[3]+2]);
  }
  const cols=Math.ceil(W/NAV_C),rows=Math.ceil((NAV_Y1-NAV_Y0)/NAV_C)+1;
  const blk=new Uint8Array(cols*rows);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=i*NAV_C+NAV_C/2,y=NAV_Y0+j*NAV_C;
    if(foot.some(f=>x>f[0]-NAV_RX&&x<f[2]+NAV_RX&&y>f[1]-NAV_RY&&y<f[3]+NAV_RY))blk[j*cols+i]=1}
  return{foot,cols,rows,blk};
}
function navCell(x,y){const N=M.nav;return[clamp(Math.floor(x/NAV_C),0,N.cols-1),clamp(Math.round((y-NAV_Y0)/NAV_C),0,N.rows-1)]}
function navFree(x,y){const N=M.nav;if(!N)return true;return!N.foot.some(f=>x>f[0]-NAV_RX&&x<f[2]+NAV_RX&&y>f[1]-NAV_RY&&y<f[3]+NAV_RY)}
function navLine(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/5);for(let k=1;k<n;k++){const t=k/n;if(!navFree(x0+(x1-x0)*t,y0+(y1-y0)*t))return false}return true}
function navNearestFree(x,y){if(navFree(x,y))return[x,y];for(let r=6;r<160;r+=6)for(let a=0;a<16;a++){const t=a/16*Math.PI*2,px=x+Math.cos(t)*r,py=clamp(y+Math.sin(t)*r*.6,NAV_Y0,NAV_Y1);if(px>4&&px<W-4&&navFree(px,py))return[px,py]}return[x,y]}
/* renvoie les points intermédiaires (sans le point d'arrivée) */
function navPath(x0,y0,x1,y1){
  const N=M.nav;if(!N||navLine(x0,y0,x1,y1))return[];
  const[si,sj]=navCell(x0,y0),[ti,tj]=navCell(x1,y1),C=N.cols,R=N.rows,S=sj*C+si,T=tj*C+ti;
  const g=new Float32Array(C*R).fill(1e9),from=new Int32Array(C*R).fill(-1),done=new Uint8Array(C*R);
  const open=[S];g[S]=0;const h=k=>{const i=k%C,j=k/C|0;return Math.hypot(i-ti,j-tj)};
  while(open.length){
    let bi=0;for(let k=1;k<open.length;k++)if(g[open[k]]+h(open[k])<g[open[bi]]+h(open[bi]))bi=k;
    const cur=open.splice(bi,1)[0];if(cur===T)break;done[cur]=1;const ci=cur%C,cj=cur/C|0;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=C||nj>=R)continue;const nk=nj*C+ni;
      if(done[nk]||(N.blk[nk]&&nk!==T))continue;if(di&&dj&&(N.blk[cj*C+ni]||N.blk[nj*C+ci]))continue;
      const ng=g[cur]+(di&&dj?1.414:1);if(ng<g[nk]){g[nk]=ng;from[nk]=cur;if(!open.includes(nk))open.push(nk)}}
  }
  if(from[T]<0)return[];
  const pts=[];for(let k=from[T];k>=0&&k!==S;k=from[k])pts.unshift([(k%C)*NAV_C+NAV_C/2,NAV_Y0+(k/C|0)*NAV_C]);
  // lissage : on ne garde que les coins nécessaires
  const out=[];let ax=x0,ay=y0;
  for(let k=0;k<pts.length;k++){const nx=k+1<pts.length?pts[k+1]:[x1,y1];if(!navLine(ax,ay,nx[0],nx[1])){out.push(pts[k]);ax=pts[k][0];ay=pts[k][1]}}
  return out;
}
function navReach(x0,y0,x1,y1){const N=M.nav;const[si,sj]=navCell(x0,y0),[ti,tj]=navCell(x1,y1),C=N.cols,R=N.rows,S=sj*C+si,T=tj*C+ti;
  const seen=new Uint8Array(C*R),q=[S];seen[S]=1;while(q.length){const cur=q.pop();if(cur===T)return true;const ci=cur%C,cj=cur/C|0;
    for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=C||nj>=R)continue;const k=nj*C+ni;if(seen[k]||(N.blk[k]&&k!==T))continue;seen[k]=1;q.push(k)}}return false}
