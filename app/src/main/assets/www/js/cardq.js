/* Notis module: cardq — v226 card/document edge detector (Parole business cards + notes card crop). See MODULES.md
   Root cause of the old misses: the colour-blob detector (parole xQuad) and the brightness scan (core cropAutoCard) treat a textured
   background (carpet, wood, fabric) as foreground or reject the shape, so the card was never found and the photo kept the background.
   Here: blur (kills texture) → colour Sobel edges → Hough lines (oriented by the gradient) → every pair of near-parallel line pairs
   becomes a candidate quadrilateral → scored by edge support on all 4 sides + inside/outside contrast → best one refined on a bigger
   copy (sub-pixel edge fit per side). Runs on the phone only; the picture never leaves it. Unsure → null → manual crop editor. */
'use strict';
(function(){
function blur3(src,w,h,r){var t=new Float32Array(w*h),o=new Float32Array(w*h),x,y,s,i,k=2*r+1;
 for(y=0;y<h;y++){s=0;var row=y*w;for(x=-r;x<=r;x++)s+=src[row+Math.min(w-1,Math.max(0,x))];for(x=0;x<w;x++){t[row+x]=s/k;s+=src[row+Math.min(w-1,x+r+1)]-src[row+Math.max(0,x-r)]}}
 for(x=0;x<w;x++){s=0;for(y=-r;y<=r;y++)s+=t[Math.min(h-1,Math.max(0,y))*w+x];for(y=0;y<h;y++){o[y*w+x]=s/k;s+=t[Math.min(h-1,y+r+1)*w+x]-t[Math.max(0,y-r)*w+x]}}return o}
function chans(d,w,h,r){var n=w*h,R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n);for(var i=0;i<n;i++){R[i]=d[i*4];G[i]=d[i*4+1];B[i]=d[i*4+2]}
 var c=[R,G,B];for(var j=0;j<3;j++){c[j]=blur3(c[j],w,h,r);c[j]=blur3(c[j],w,h,r)}return c}
function sobel(C,w,h){var n=w*h,M=new Float32Array(n),GX=new Float32Array(n),GY=new Float32Array(n);
 for(var y=1;y<h-1;y++)for(var x=1;x<w-1;x++){var i=y*w+x,bm=0,bx=0,by=0;for(var c=0;c<3;c++){var a=C[c];
   var gx=(a[i-w+1]+2*a[i+1]+a[i+w+1])-(a[i-w-1]+2*a[i-1]+a[i+w-1]),gy=(a[i+w-1]+2*a[i+w]+a[i+w+1])-(a[i-w-1]+2*a[i-w]+a[i-w+1]),m=gx*gx+gy*gy;if(m>bm){bm=m;bx=gx;by=gy}}
  M[i]=Math.sqrt(bm);GX[i]=bx;GY[i]=by}return{M:M,GX:GX,GY:GY}}
function pct(M,p){var a=[],st=Math.max(1,Math.floor(M.length/20000));for(var i=0;i<M.length;i+=st)a.push(M[i]);a.sort(function(x,y){return x-y});return a[Math.min(a.length-1,Math.floor(a.length*p))]}
function lines(E,w,h,thr){var NT=180,diag=Math.ceil(Math.hypot(w,h)),NR=2*diag+1,acc=new Float32Array(NT*NR),cs=[],sn=[];for(var t=0;t<NT;t++){cs.push(Math.cos(t*Math.PI/NT));sn.push(Math.sin(t*Math.PI/NT))}
 for(var y=2;y<h-2;y++)for(var x=2;x<w-2;x++){var i=y*w+x,m=E.M[i];if(m<thr)continue;var th=Math.atan2(E.GY[i],E.GX[i]);if(th<0)th+=Math.PI;var tb=Math.round(th*NT/Math.PI);
  for(var dt=-4;dt<=4;dt++){var tt=(tb+dt+NT)%NT,rr=Math.round(x*cs[tt]+y*sn[tt])+diag;acc[tt*NR+rr]+=m}}
 var pk=[];for(var k=0;k<40;k++){var bi=-1,bv=0;for(var j=0;j<acc.length;j++)if(acc[j]>bv){bv=acc[j];bi=j}if(bi<0)break;var T0=Math.floor(bi/NR),R0=bi%NR-diag;pk.push({t:T0*Math.PI/NT,r:R0,v:bv});
  for(var a=-7;a<=7;a++)for(var b=-10;b<=10;b++){var ta=T0+a,rb=R0+diag+b;if(ta<0){ta+=NT;rb=2*diag-rb}else if(ta>=NT){ta-=NT;rb=2*diag-rb}if(rb>=0&&rb<NR)acc[ta*NR+rb]=0}}
 return pk}
function inter(a,b){var d=Math.cos(a.t)*Math.sin(b.t)-Math.sin(a.t)*Math.cos(b.t);if(Math.abs(d)<1e-6)return null;return[(a.r*Math.sin(b.t)-b.r*Math.sin(a.t))/d,(b.r*Math.cos(a.t)-a.r*Math.cos(b.t))/d]}
function order(P){var cx=0,cy=0;P.forEach(function(p){cx+=p[0];cy+=p[1]});cx/=4;cy/=4;P.sort(function(a,b){return Math.atan2(a[1]-cy,a[0]-cx)-Math.atan2(b[1]-cy,b[0]-cx)});
 var s=0;for(var i=1;i<4;i++)if(P[i][0]+P[i][1]<P[s][0]+P[s][1])s=i;return P.slice(s).concat(P.slice(0,s))} /* TL,TR,BR,BL (screen coords, clockwise) */
function area(Q){var A=0;for(var k=0;k<4;k++){var a=Q[k],b=Q[(k+1)%4];A+=a[0]*b[1]-b[0]*a[1]}return A/2}
function convex(Q){var sg=0;for(var k=0;k<4;k++){var a=Q[k],b=Q[(k+1)%4],c=Q[(k+2)%4],cr=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(!sg)sg=cr>0?1:-1;else if(cr*sg<=0)return false}return true}
function side(E,C,w,h,a,b,thr){var L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(8,Math.round(L/2)),nx=-(b[1]-a[1])/L,ny=(b[0]-a[0])/L,hit=0,tot=0,con=0,cc=0;
 for(var s=0;s<n;s++){var u=(s+.5)/n,x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u,best=0;for(var o=-2;o<=2;o++){var X=Math.round(x+nx*o),Y=Math.round(y+ny*o);if(X<1||Y<1||X>=w-1||Y>=h-1)continue;var i=Y*w+X,m=E.M[i];if(m<thr*0.6)continue;
   var dot=Math.abs(E.GX[i]*nx+E.GY[i]*ny)/(m||1);if(dot>0.85&&m>best)best=m}tot++;if(best>0)hit++;
  var X1=Math.round(x+nx*5),Y1=Math.round(y+ny*5),X2=Math.round(x-nx*5),Y2=Math.round(y-ny*5);if(X1>=0&&Y1>=0&&X1<w&&Y1<h&&X2>=0&&Y2>=0&&X2<w&&Y2<h){var i1=Y1*w+X1,i2=Y2*w+X2,dd=0;for(var c=0;c<3;c++)dd+=Math.abs(C[c][i1]-C[c][i2]);con+=dd;cc++}}
 return{s:tot?hit/tot:0,c:cc?con/cc:0}}
function best(E,C,w,h,thr){var pk=lines(E,w,h,thr),md=Math.min(w,h),A0=w*h,top=null;
 for(var i=0;i<pk.length;i++)for(var j=i+1;j<pk.length;j++){var a=pk[i],b=pk[j],da=Math.abs(a.t-b.t);da=Math.min(da,Math.PI-da);if(da>0.35)continue;
  for(var k=0;k<pk.length;k++){if(k===i||k===j)continue;for(var l=k+1;l<pk.length;l++){if(l===i||l===j)continue;var c=pk[k],d=pk[l],db=Math.abs(c.t-d.t);db=Math.min(db,Math.PI-db);if(db>0.35)continue;
   var x=Math.abs(a.t-c.t);x=Math.min(x,Math.PI-x);if(x<0.9)continue;if(k<i)continue; /* each pair-of-pairs once */
   var P=[inter(a,c),inter(c,b),inter(b,d),inter(d,a)];if(P.some(function(p){return !p||p[0]<-0.04*w||p[1]<-0.04*h||p[0]>1.04*w||p[1]>1.04*h}))continue;
   var Q=order(P);if(!convex(Q))continue;var A=Math.abs(area(Q));if(A<A0*0.06||A>A0*0.97)continue;var ok=true,ms=1,sum=0,cs=0,mc=1e9;
   for(var e=0;e<4;e++){var p0=Q[e],p1=Q[(e+1)%4];if(Math.hypot(p1[0]-p0[0],p1[1]-p0[1])<md*0.15){ok=false;break}var r=side(E,C,w,h,p0,p1,thr);if(r.s<0.45){ok=false;break}ms=Math.min(ms,r.s);sum+=r.s;cs+=r.c;mc=Math.min(mc,r.c)}
   if(!ok)continue;for(e=0;e<4;e++){var pa=Q[(e+3)%4],pb=Q[e],pc=Q[(e+1)%4],v1=[pa[0]-pb[0],pa[1]-pb[1]],v2=[pc[0]-pb[0],pc[1]-pb[1]],an=Math.acos(Math.max(-1,Math.min(1,(v1[0]*v2[0]+v1[1]*v2[1])/(Math.hypot(v1[0],v1[1])*Math.hypot(v2[0],v2[1])))))*180/Math.PI;if(an<55||an>125){ok=false;break}}
   if(!ok)continue;var sc=ms+sum/4+Math.min(1,cs/4/120)*0.6+Math.sqrt(A/A0)*0.35;if(!top||sc>top.sc)top={Q:Q,sc:sc,ms:ms,con:cs/4,av:sum/4,mc:mc}}}}
 return top}
/* sub-pixel refinement of each side on a larger gray copy: strongest gradient across the side, then least squares with outlier trimming */
function refine(Q,G,w,h){var L=[];for(var e=0;e<4;e++){var a=Q[e],b=Q[(e+1)%4],len=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/len,ny=(b[0]-a[0])/len,R=Math.max(4,Math.round(Math.min(w,h)*0.03)),pts=[];
  for(var s=1;s<40;s++){var u=0.1+0.8*s/40,x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u,bv=0,bo=0,bsg=0;for(var o=-R;o<=R;o++){var X1=Math.round(x+nx*(o+1)),Y1=Math.round(y+ny*(o+1)),X0=Math.round(x+nx*(o-1)),Y0=Math.round(y+ny*(o-1));if(X0<0||Y0<0||X1<0||Y1<0||X0>=w||X1>=w||Y0>=h||Y1>=h)continue;var i1=Y1*w+X1,i0=Y0*w+X0,g0=G[0][i1]+G[1][i1]+G[2][i1]-G[0][i0]-G[1][i0]-G[2][i0],g=Math.max(Math.abs(G[0][i1]-G[0][i0]),Math.abs(G[1][i1]-G[1][i0]),Math.abs(G[2][i1]-G[2][i0]));if(g>bv){bv=g;bo=o;bsg=g0>0?1:-1}}if(bv>6)pts.push([x+nx*bo,y+ny*bo,bv,bsg])}
  if(pts.length<10)return null;var fit=function(P){var mx=0,my=0;P.forEach(function(p){mx+=p[0];my+=p[1]});mx/=P.length;my/=P.length;var sxx=0,sxy=0,syy=0;P.forEach(function(p){var dx=p[0]-mx,dy=p[1]-my;sxx+=dx*dx;sxy+=dx*dy;syy+=dy*dy});var th=0.5*Math.atan2(2*sxy,sxx-syy);return{t:th+Math.PI/2,r:mx*Math.cos(th+Math.PI/2)+my*Math.sin(th+Math.PI/2)}};
  var f=fit(pts);for(var it=0;it<2;it++){var ds=pts.map(function(p){return Math.abs(p[0]*Math.cos(f.t)+p[1]*Math.sin(f.t)-f.r)}),srt=ds.slice().sort(function(x,y){return x-y}),cut=Math.max(1.5,srt[Math.floor(srt.length*0.7)]);var P2=pts.filter(function(p,i){return ds[i]<=cut});if(P2.length<8)break;f=fit(P2)}L.push(f)}
 var out=[inter(L[3],L[0]),inter(L[0],L[1]),inter(L[1],L[2]),inter(L[2],L[3])];if(out.some(function(p){return !p}))return null;
 for(var k=0;k<4;k++)if(Math.hypot(out[k][0]-Q[k][0],out[k][1]-Q[k][1])>Math.min(w,h)*0.06)return null;return out}
/* cardQuad(canvasOrImage) → [[x,y]×4] TL,TR,BR,BL in the source's pixel coordinates, or null */
window.cardQuad=function(src,sw,sh){try{var W0=sw||src.naturalWidth||src.width,H0=sh||src.naturalHeight||src.height;if(!W0||!H0)return null;
 var s=Math.min(1,360/Math.max(W0,H0)),w=Math.max(8,Math.round(W0*s)),h=Math.max(8,Math.round(H0*s)),cv=document.createElement('canvas');cv.width=w;cv.height=h;var g=cv.getContext('2d');g.drawImage(src,0,0,w,h);
 var d=g.getImageData(0,0,w,h).data,C=chans(d,w,h,2),E=sobel(C,w,h),thr=Math.max(25,pct(E.M,0.88)),top=best(E,C,w,h,thr);if(!top){C=chans(d,w,h,1);E=sobel(C,w,h);thr=Math.max(20,pct(E.M,0.85));top=best(E,C,w,h,thr)}
 window.cardQuad.last=top;if(!top||top.ms<0.82||top.mc<40||top.con<60)return null;var Q=top.Q.map(function(p){return[p[0]/s,p[1]/s]});
 var s2=Math.min(1,1100/Math.max(W0,H0)),w2=Math.round(W0*s2),h2=Math.round(H0*s2),c2=document.createElement('canvas');c2.width=w2;c2.height=h2;var g2=c2.getContext('2d');g2.drawImage(src,0,0,w2,h2);var d2=g2.getImageData(0,0,w2,h2).data,G=chans(d2,w2,h2,1);var R=refine(Q.map(function(p){return[p[0]*s2,p[1]*s2]}),G,w2,h2);top.ref=!!R;if(R)Q=R.map(function(p){return[p[0]/s2,p[1]/s2]});
 return Q.map(function(p){return[Math.max(0,Math.min(W0,p[0])),Math.max(0,Math.min(H0,p[1]))]})}catch(_){return null}};
function warp(src,W,H,Q){var sw=src.width,sh=src.height,sd=src.data,x0=Q[0][0],y0=Q[0][1],x1=Q[1][0],y1=Q[1][1],x2=Q[2][0],y2=Q[2][1],x3=Q[3][0],y3=Q[3][1],a,b,c,d,e,f,g,hh;
 var dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;if(Math.abs(dx3)<1e-9&&Math.abs(dy3)<1e-9){a=x1-x0;b=x3-x0;c=x0;d=y1-y0;e=y3-y0;f=y0;g=hh=0}else{var den=dx1*dy2-dx2*dy1;g=(dx3*dy2-dx2*dy3)/den;hh=(dx1*dy3-dx3*dy1)/den;a=x1-x0+g*x1;b=x3-x0+hh*x3;c=x0;d=y1-y0+g*y1;e=y3-y0+hh*y3;f=y0}
 var o=new ImageData(W,H),od=o.data;for(var Y=0;Y<H;Y++){var v=(Y+.5)/H;for(var X=0;X<W;X++){var u=(X+.5)/W,z=g*u+hh*v+1,sx=(a*u+b*v+c)/z-.5,sy=(d*u+e*v+f)/z-.5;if(sx<0)sx=0;if(sy<0)sy=0;if(sx>sw-1)sx=sw-1;if(sy>sh-1)sy=sh-1;
  var ix=sx|0,iy=sy|0,fx=sx-ix,fy=sy-iy,ix1=Math.min(ix+1,sw-1),iy1=Math.min(iy+1,sh-1),p00=(iy*sw+ix)*4,p10=(iy*sw+ix1)*4,p01=(iy1*sw+ix)*4,p11=(iy1*sw+ix1)*4,q=(Y*W+X)*4;
  for(var ch=0;ch<3;ch++)od[q+ch]=(sd[p00+ch]*(1-fx)+sd[p10+ch]*fx)*(1-fy)+(sd[p01+ch]*(1-fx)+sd[p11+ch]*fx)*fy;od[q+3]=255}}return o}
/* cardCrop(blob) → Promise<Blob|null>: the card alone, perspective-corrected (tight, edge to edge); null when no card is found for sure */
window.cardCrop=function(blob){return new Promise(function(res){if(!blob)return res(null);var u=URL.createObjectURL(blob),im=new Image();im.onerror=function(){URL.revokeObjectURL(u);res(null)};im.onload=function(){URL.revokeObjectURL(u);try{
  var w=im.naturalWidth,h=im.naturalHeight,Q=window.cardQuad(im,w,h);if(!Q)return res(null);
  /* 0.4% inward so not one background pixel survives on the border */
  var mx=(Q[0][0]+Q[1][0]+Q[2][0]+Q[3][0])/4,my=(Q[0][1]+Q[1][1]+Q[2][1]+Q[3][1])/4;Q=Q.map(function(p){return[mx+(p[0]-mx)*0.992,my+(p[1]-my)*0.992]});
  var W=Math.max(Math.hypot(Q[1][0]-Q[0][0],Q[1][1]-Q[0][1]),Math.hypot(Q[2][0]-Q[3][0],Q[2][1]-Q[3][1])),H=Math.max(Math.hypot(Q[3][0]-Q[0][0],Q[3][1]-Q[0][1]),Math.hypot(Q[2][0]-Q[1][0],Q[2][1]-Q[1][1])),sc=Math.min(1,1600/Math.max(W,H));W=Math.max(8,Math.round(W*sc));H=Math.max(8,Math.round(H*sc));
  var fc=document.createElement('canvas');fc.width=w;fc.height=h;var fx=fc.getContext('2d');fx.drawImage(im,0,0);var o=warp(fx.getImageData(0,0,w,h),W,H,Q),oc=document.createElement('canvas');oc.width=W;oc.height=H;oc.getContext('2d').putImageData(o,0,0);fc.width=fc.height=0;
  oc.toBlob(function(b){res(b||null)},'image/jpeg',0.9)}catch(_){res(null)}};im.src=u})};
})();
