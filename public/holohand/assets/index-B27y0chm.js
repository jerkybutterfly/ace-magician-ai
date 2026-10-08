(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Dh="170",Q0=0,tf=1,tg=2,ap=1,eg=2,Ci=3,ar=0,pn=1,Pi=2,rr=0,hs=1,gl=2,ef=3,nf=4,ng=5,wr=100,ig=101,rg=102,sg=103,og=104,ag=200,cg=201,lg=202,hg=203,_l=204,vl=205,ug=206,fg=207,dg=208,pg=209,mg=210,gg=211,_g=212,vg=213,xg=214,xl=0,Ml=1,yl=2,ms=3,Sl=4,El=5,Tl=6,Al=7,cp=0,Mg=1,yg=2,sr=0,Sg=1,Eg=2,Tg=3,Ag=4,bg=5,wg=6,Rg=7,lp=300,gs=301,_s=302,bl=303,wl=304,Xa=306,Rl=1e3,Pr=1001,Cl=1002,Qn=1003,Cg=1004,Oo=1005,di=1006,xc=1007,Lr=1008,ki=1009,hp=1010,up=1011,po=1012,Ih=1013,Br=1014,Di=1015,Mo=1016,Uh=1017,Nh=1018,vs=1020,fp=35902,dp=1021,pp=1022,Zn=1023,mp=1024,gp=1025,us=1026,xs=1027,_p=1028,Fh=1029,vp=1030,Oh=1031,Bh=1033,ma=33776,ga=33777,_a=33778,va=33779,Pl=35840,Ll=35841,Dl=35842,Il=35843,Ul=36196,Nl=37492,Fl=37496,Ol=37808,Bl=37809,kl=37810,zl=37811,Vl=37812,Gl=37813,Hl=37814,Wl=37815,Xl=37816,ql=37817,Yl=37818,jl=37819,Kl=37820,$l=37821,xa=36492,Zl=36494,Jl=36495,xp=36283,Ql=36284,th=36285,eh=36286,Pg=3200,Lg=3201,Dg=0,Ig=1,nr="",On="srgb",Ls="srgb-linear",qa="linear",ae="srgb",Hr=7680,rf=519,Ug=512,Ng=513,Fg=514,Mp=515,Og=516,Bg=517,kg=518,zg=519,sf=35044,of="300 es",Ii=2e3,Pa=2001;class Ds{addEventListener(t,n){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(n)===-1&&i[t].push(n)}hasEventListener(t,n){if(this._listeners===void 0)return!1;const i=this._listeners;return i[t]!==void 0&&i[t].indexOf(n)!==-1}removeEventListener(t,n){if(this._listeners===void 0)return;const r=this._listeners[t];if(r!==void 0){const s=r.indexOf(n);s!==-1&&r.splice(s,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const i=this._listeners[t.type];if(i!==void 0){t.target=this;const r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,t);t.target=null}}}const Qe=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Mc=Math.PI/180,nh=180/Math.PI;function yo(){const e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Qe[e&255]+Qe[e>>8&255]+Qe[e>>16&255]+Qe[e>>24&255]+"-"+Qe[t&255]+Qe[t>>8&255]+"-"+Qe[t>>16&15|64]+Qe[t>>24&255]+"-"+Qe[n&63|128]+Qe[n>>8&255]+"-"+Qe[n>>16&255]+Qe[n>>24&255]+Qe[i&255]+Qe[i>>8&255]+Qe[i>>16&255]+Qe[i>>24&255]).toLowerCase()}function nn(e,t,n){return Math.max(t,Math.min(n,e))}function Vg(e,t){return(e%t+t)%t}function yc(e,t,n){return(1-n)*e+n*t}function Ws(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("Invalid component type.")}}function un(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("Invalid component type.")}}class ee{constructor(t=0,n=0){ee.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,n){return this.x=t,this.y=n,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const n=this.x,i=this.y,r=t.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,n){return this.x=Math.max(t.x,Math.min(n.x,this.x)),this.y=Math.max(t.y,Math.min(n.y,this.y)),this}clampScalar(t,n){return this.x=Math.max(t,Math.min(n,this.x)),this.y=Math.max(t,Math.min(n,this.y)),this}clampLength(t,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(t)/n;return Math.acos(nn(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const n=this.x-t.x,i=this.y-t.y;return n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this}rotateAround(t,n){const i=Math.cos(n),r=Math.sin(n),s=this.x-t.x,o=this.y-t.y;return this.x=s*i-o*r+t.x,this.y=s*r+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Bt{constructor(t,n,i,r,s,o,a,c,l){Bt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,i,r,s,o,a,c,l)}set(t,n,i,r,s,o,a,c,l){const h=this.elements;return h[0]=t,h[1]=r,h[2]=a,h[3]=n,h[4]=s,h[5]=c,h[6]=i,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(t,n,i){return t.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const n=t.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){const i=t.elements,r=n.elements,s=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],h=i[4],u=i[7],f=i[2],p=i[5],g=i[8],v=r[0],m=r[3],d=r[6],A=r[1],T=r[4],S=r[7],N=r[2],R=r[5],b=r[8];return s[0]=o*v+a*A+c*N,s[3]=o*m+a*T+c*R,s[6]=o*d+a*S+c*b,s[1]=l*v+h*A+u*N,s[4]=l*m+h*T+u*R,s[7]=l*d+h*S+u*b,s[2]=f*v+p*A+g*N,s[5]=f*m+p*T+g*R,s[8]=f*d+p*S+g*b,this}multiplyScalar(t){const n=this.elements;return n[0]*=t,n[3]*=t,n[6]*=t,n[1]*=t,n[4]*=t,n[7]*=t,n[2]*=t,n[5]*=t,n[8]*=t,this}determinant(){const t=this.elements,n=t[0],i=t[1],r=t[2],s=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8];return n*o*h-n*a*l-i*s*h+i*a*c+r*s*l-r*o*c}invert(){const t=this.elements,n=t[0],i=t[1],r=t[2],s=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],u=h*o-a*l,f=a*c-h*s,p=l*s-o*c,g=n*u+i*f+r*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return t[0]=u*v,t[1]=(r*l-h*i)*v,t[2]=(a*i-r*o)*v,t[3]=f*v,t[4]=(h*n-r*c)*v,t[5]=(r*s-a*n)*v,t[6]=p*v,t[7]=(i*c-l*n)*v,t[8]=(o*n-i*s)*v,this}transpose(){let t;const n=this.elements;return t=n[1],n[1]=n[3],n[3]=t,t=n[2],n[2]=n[6],n[6]=t,t=n[5],n[5]=n[7],n[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const n=this.elements;return t[0]=n[0],t[1]=n[3],t[2]=n[6],t[3]=n[1],t[4]=n[4],t[5]=n[7],t[6]=n[2],t[7]=n[5],t[8]=n[8],this}setUvTransform(t,n,i,r,s,o,a){const c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*o+l*a)+o+t,-r*l,r*c,-r*(-l*o+c*a)+a+n,0,0,1),this}scale(t,n){return this.premultiply(Sc.makeScale(t,n)),this}rotate(t){return this.premultiply(Sc.makeRotation(-t)),this}translate(t,n){return this.premultiply(Sc.makeTranslation(t,n)),this}makeTranslation(t,n){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,n,0,0,1),this}makeRotation(t){const n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(t,n){return this.set(t,0,0,0,n,0,0,0,1),this}equals(t){const n=this.elements,i=t.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(t,n=0){for(let i=0;i<9;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){const i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Sc=new Bt;function yp(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function La(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function Gg(){const e=La("canvas");return e.style.display="block",e}const af={};function Qs(e){e in af||(af[e]=!0,console.warn(e))}function Hg(e,t,n){return new Promise(function(i,r){function s(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:r();break;case e.TIMEOUT_EXPIRED:setTimeout(s,n);break;default:i()}}setTimeout(s,n)})}function Wg(e){const t=e.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Xg(e){const t=e.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const $t={enabled:!0,workingColorSpace:Ls,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===ae&&(e.r=Ni(e.r),e.g=Ni(e.g),e.b=Ni(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===ae&&(e.r=fs(e.r),e.g=fs(e.g),e.b=fs(e.b))),e},fromWorkingColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},toWorkingColorSpace:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===nr?qa:this.spaces[e].transfer},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}};function Ni(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function fs(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}const cf=[.64,.33,.3,.6,.15,.06],lf=[.2126,.7152,.0722],hf=[.3127,.329],uf=new Bt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ff=new Bt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);$t.define({[Ls]:{primaries:cf,whitePoint:hf,transfer:qa,toXYZ:uf,fromXYZ:ff,luminanceCoefficients:lf,workingColorSpaceConfig:{unpackColorSpace:On},outputColorSpaceConfig:{drawingBufferColorSpace:On}},[On]:{primaries:cf,whitePoint:hf,transfer:ae,toXYZ:uf,fromXYZ:ff,luminanceCoefficients:lf,outputColorSpaceConfig:{drawingBufferColorSpace:On}}});let Wr;class qg{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Wr===void 0&&(Wr=La("canvas")),Wr.width=t.width,Wr.height=t.height;const i=Wr.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),n=Wr}return n.width>2048||n.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),n.toDataURL("image/jpeg",.6)):n.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const n=La("canvas");n.width=t.width,n.height=t.height;const i=n.getContext("2d");i.drawImage(t,0,0,t.width,t.height);const r=i.getImageData(0,0,t.width,t.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=Ni(s[o]/255)*255;return i.putImageData(r,0,0),n}else if(t.data){const n=t.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(Ni(n[i]/255)*255):n[i]=Ni(n[i]);return{data:n,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Yg=0;class Sp{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Yg++}),this.uuid=yo(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const n=t===void 0||typeof t=="string";if(!n&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(Ec(r[o].image)):s.push(Ec(r[o]))}else s=Ec(r);i.url=s}return n||(t.images[this.uuid]=i),i}}function Ec(e){return typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap?qg.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let jg=0;class mn extends Ds{constructor(t=mn.DEFAULT_IMAGE,n=mn.DEFAULT_MAPPING,i=Pr,r=Pr,s=di,o=Lr,a=Zn,c=ki,l=mn.DEFAULT_ANISOTROPY,h=nr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:jg++}),this.uuid=yo(),this.name="",this.source=new Sp(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new ee(0,0),this.repeat=new ee(1,1),this.center=new ee(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Bt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const n=t===void 0||typeof t=="string";if(!n&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==lp)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Rl:t.x=t.x-Math.floor(t.x);break;case Pr:t.x=t.x<0?0:1;break;case Cl:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Rl:t.y=t.y-Math.floor(t.y);break;case Pr:t.y=t.y<0?0:1;break;case Cl:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}mn.DEFAULT_IMAGE=null;mn.DEFAULT_MAPPING=lp;mn.DEFAULT_ANISOTROPY=1;class Oe{constructor(t=0,n=0,i=0,r=1){Oe.prototype.isVector4=!0,this.x=t,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,n,i,r){return this.x=t,this.y=n,this.z=i,this.w=r,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this.w=t.w+n.w,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this.w+=t.w*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this.w=t.w-n.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const n=this.x,i=this.y,r=this.z,s=this.w,o=t.elements;return this.x=o[0]*n+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*n+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*n+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*n+o[7]*i+o[11]*r+o[15]*s,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const n=Math.sqrt(1-t.w*t.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/n,this.y=t.y/n,this.z=t.z/n),this}setAxisAngleFromRotationMatrix(t){let n,i,r,s;const c=t.elements,l=c[0],h=c[4],u=c[8],f=c[1],p=c[5],g=c[9],v=c[2],m=c[6],d=c[10];if(Math.abs(h-f)<.01&&Math.abs(u-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+v)<.1&&Math.abs(g+m)<.1&&Math.abs(l+p+d-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const T=(l+1)/2,S=(p+1)/2,N=(d+1)/2,R=(h+f)/4,b=(u+v)/4,D=(g+m)/4;return T>S&&T>N?T<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(T),r=R/i,s=b/i):S>N?S<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(S),i=R/r,s=D/r):N<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(N),i=b/s,r=D/s),this.set(i,r,s,n),this}let A=Math.sqrt((m-g)*(m-g)+(u-v)*(u-v)+(f-h)*(f-h));return Math.abs(A)<.001&&(A=1),this.x=(m-g)/A,this.y=(u-v)/A,this.z=(f-h)/A,this.w=Math.acos((l+p+d-1)/2),this}setFromMatrixPosition(t){const n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,n){return this.x=Math.max(t.x,Math.min(n.x,this.x)),this.y=Math.max(t.y,Math.min(n.y,this.y)),this.z=Math.max(t.z,Math.min(n.z,this.z)),this.w=Math.max(t.w,Math.min(n.w,this.w)),this}clampScalar(t,n){return this.x=Math.max(t,Math.min(n,this.x)),this.y=Math.max(t,Math.min(n,this.y)),this.z=Math.max(t,Math.min(n,this.z)),this.w=Math.max(t,Math.min(n,this.w)),this}clampLength(t,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this.w+=(t.w-this.w)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this.w=t.w+(n.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this.w=t[n+3],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t[n+3]=this.w,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this.w=t.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Kg extends Ds{constructor(t=1,n=1,i={}){super(),this.isRenderTarget=!0,this.width=t,this.height=n,this.depth=1,this.scissor=new Oe(0,0,t,n),this.scissorTest=!1,this.viewport=new Oe(0,0,t,n);const r={width:t,height:n,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:di,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const s=new mn(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,n,i=1){if(this.width!==t||this.height!==n||this.depth!==i){this.width=t,this.height=n,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=t,this.textures[r].image.height=n,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,t,n),this.scissor.set(0,0,t,n)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let i=0,r=t.textures.length;i<r;i++)this.textures[i]=t.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const n=Object.assign({},t.texture.image);return this.texture.source=new Sp(n),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class kr extends Kg{constructor(t=1,n=1,i={}){super(t,n,i),this.isWebGLRenderTarget=!0}}class Ep extends mn{constructor(t=null,n=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:n,height:i,depth:r},this.magFilter=Qn,this.minFilter=Qn,this.wrapR=Pr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class $g extends mn{constructor(t=null,n=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:n,height:i,depth:r},this.magFilter=Qn,this.minFilter=Qn,this.wrapR=Pr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Is{constructor(t=0,n=0,i=0,r=1){this.isQuaternion=!0,this._x=t,this._y=n,this._z=i,this._w=r}static slerpFlat(t,n,i,r,s,o,a){let c=i[r+0],l=i[r+1],h=i[r+2],u=i[r+3];const f=s[o+0],p=s[o+1],g=s[o+2],v=s[o+3];if(a===0){t[n+0]=c,t[n+1]=l,t[n+2]=h,t[n+3]=u;return}if(a===1){t[n+0]=f,t[n+1]=p,t[n+2]=g,t[n+3]=v;return}if(u!==v||c!==f||l!==p||h!==g){let m=1-a;const d=c*f+l*p+h*g+u*v,A=d>=0?1:-1,T=1-d*d;if(T>Number.EPSILON){const N=Math.sqrt(T),R=Math.atan2(N,d*A);m=Math.sin(m*R)/N,a=Math.sin(a*R)/N}const S=a*A;if(c=c*m+f*S,l=l*m+p*S,h=h*m+g*S,u=u*m+v*S,m===1-a){const N=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=N,l*=N,h*=N,u*=N}}t[n]=c,t[n+1]=l,t[n+2]=h,t[n+3]=u}static multiplyQuaternionsFlat(t,n,i,r,s,o){const a=i[r],c=i[r+1],l=i[r+2],h=i[r+3],u=s[o],f=s[o+1],p=s[o+2],g=s[o+3];return t[n]=a*g+h*u+c*p-l*f,t[n+1]=c*g+h*f+l*u-a*p,t[n+2]=l*g+h*p+a*f-c*u,t[n+3]=h*g-a*u-c*f-l*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,n,i,r){return this._x=t,this._y=n,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,n=!0){const i=t._x,r=t._y,s=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(i/2),h=a(r/2),u=a(s/2),f=c(i/2),p=c(r/2),g=c(s/2);switch(o){case"XYZ":this._x=f*h*u+l*p*g,this._y=l*p*u-f*h*g,this._z=l*h*g+f*p*u,this._w=l*h*u-f*p*g;break;case"YXZ":this._x=f*h*u+l*p*g,this._y=l*p*u-f*h*g,this._z=l*h*g-f*p*u,this._w=l*h*u+f*p*g;break;case"ZXY":this._x=f*h*u-l*p*g,this._y=l*p*u+f*h*g,this._z=l*h*g+f*p*u,this._w=l*h*u-f*p*g;break;case"ZYX":this._x=f*h*u-l*p*g,this._y=l*p*u+f*h*g,this._z=l*h*g-f*p*u,this._w=l*h*u+f*p*g;break;case"YZX":this._x=f*h*u+l*p*g,this._y=l*p*u+f*h*g,this._z=l*h*g-f*p*u,this._w=l*h*u-f*p*g;break;case"XZY":this._x=f*h*u-l*p*g,this._y=l*p*u-f*h*g,this._z=l*h*g+f*p*u,this._w=l*h*u+f*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,n){const i=n/2,r=Math.sin(i);return this._x=t.x*r,this._y=t.y*r,this._z=t.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){const n=t.elements,i=n[0],r=n[4],s=n[8],o=n[1],a=n[5],c=n[9],l=n[2],h=n[6],u=n[10],f=i+a+u;if(f>0){const p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-c)*p,this._y=(s-l)*p,this._z=(o-r)*p}else if(i>a&&i>u){const p=2*Math.sqrt(1+i-a-u);this._w=(h-c)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+l)/p}else if(a>u){const p=2*Math.sqrt(1+a-i-u);this._w=(s-l)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(c+h)/p}else{const p=2*Math.sqrt(1+u-i-a);this._w=(o-r)/p,this._x=(s+l)/p,this._y=(c+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,n){let i=t.dot(n)+1;return i<Number.EPSILON?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*n.z-t.z*n.y,this._y=t.z*n.x-t.x*n.z,this._z=t.x*n.y-t.y*n.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(nn(this.dot(t),-1,1)))}rotateTowards(t,n){const i=this.angleTo(t);if(i===0)return this;const r=Math.min(1,n/i);return this.slerp(t,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,n){const i=t._x,r=t._y,s=t._z,o=t._w,a=n._x,c=n._y,l=n._z,h=n._w;return this._x=i*h+o*a+r*l-s*c,this._y=r*h+o*c+s*a-i*l,this._z=s*h+o*l+i*c-r*a,this._w=o*h-i*a-r*c-s*l,this._onChangeCallback(),this}slerp(t,n){if(n===0)return this;if(n===1)return this.copy(t);const i=this._x,r=this._y,s=this._z,o=this._w;let a=o*t._w+i*t._x+r*t._y+s*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;const c=1-a*a;if(c<=Number.EPSILON){const p=1-n;return this._w=p*o+n*this._w,this._x=p*i+n*this._x,this._y=p*r+n*this._y,this._z=p*s+n*this._z,this.normalize(),this}const l=Math.sqrt(c),h=Math.atan2(l,a),u=Math.sin((1-n)*h)/l,f=Math.sin(n*h)/l;return this._w=o*u+this._w*f,this._x=i*u+this._x*f,this._y=r*u+this._y*f,this._z=s*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,n,i){return this.copy(t).slerp(n,i)}random(){const t=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(t),r*Math.cos(t),s*Math.sin(n),s*Math.cos(n))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,n=0){return this._x=t[n],this._y=t[n+1],this._z=t[n+2],this._w=t[n+3],this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._w,t}fromBufferAttribute(t,n){return this._x=t.getX(n),this._y=t.getY(n),this._z=t.getZ(n),this._w=t.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class U{constructor(t=0,n=0,i=0){U.prototype.isVector3=!0,this.x=t,this.y=n,this.z=i}set(t,n,i){return i===void 0&&(i=this.z),this.x=t,this.y=n,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,n){return this.x=t.x*n.x,this.y=t.y*n.y,this.z=t.z*n.z,this}applyEuler(t){return this.applyQuaternion(df.setFromEuler(t))}applyAxisAngle(t,n){return this.applyQuaternion(df.setFromAxisAngle(t,n))}applyMatrix3(t){const n=this.x,i=this.y,r=this.z,s=t.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const n=this.x,i=this.y,r=this.z,s=t.elements,o=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(t){const n=this.x,i=this.y,r=this.z,s=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*r-a*i),h=2*(a*n-s*r),u=2*(s*i-o*n);return this.x=n+c*l+o*u-a*h,this.y=i+c*h+a*l-s*u,this.z=r+c*u+s*h-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const n=this.x,i=this.y,r=this.z,s=t.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,n){return this.x=Math.max(t.x,Math.min(n.x,this.x)),this.y=Math.max(t.y,Math.min(n.y,this.y)),this.z=Math.max(t.z,Math.min(n.z,this.z)),this}clampScalar(t,n){return this.x=Math.max(t,Math.min(n,this.x)),this.y=Math.max(t,Math.min(n,this.y)),this.z=Math.max(t,Math.min(n,this.z)),this}clampLength(t,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,n){const i=t.x,r=t.y,s=t.z,o=n.x,a=n.y,c=n.z;return this.x=r*c-s*a,this.y=s*o-i*c,this.z=i*a-r*o,this}projectOnVector(t){const n=t.lengthSq();if(n===0)return this.set(0,0,0);const i=t.dot(this)/n;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Tc.copy(this).projectOnVector(t),this.sub(Tc)}reflect(t){return this.sub(Tc.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(t)/n;return Math.acos(nn(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const n=this.x-t.x,i=this.y-t.y,r=this.z-t.z;return n*n+i*i+r*r}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,n,i){const r=Math.sin(n)*t;return this.x=r*Math.sin(i),this.y=Math.cos(n)*t,this.z=r*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,n,i){return this.x=t*Math.sin(n),this.y=i,this.z=t*Math.cos(n),this}setFromMatrixPosition(t){const n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(t){const n=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),r=this.setFromMatrixColumn(t,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(t,n){return this.fromArray(t.elements,n*4)}setFromMatrix3Column(t,n){return this.fromArray(t.elements,n*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(t),this.y=n,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Tc=new U,df=new Is;class So{constructor(t=new U(1/0,1/0,1/0),n=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=n}set(t,n){return this.min.copy(t),this.max.copy(n),this}setFromArray(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n+=3)this.expandByPoint(Yn.fromArray(t,n));return this}setFromBufferAttribute(t){this.makeEmpty();for(let n=0,i=t.count;n<i;n++)this.expandByPoint(Yn.fromBufferAttribute(t,n));return this}setFromPoints(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n++)this.expandByPoint(t[n]);return this}setFromCenterAndSize(t,n){const i=Yn.copy(n).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,n=!1){return this.makeEmpty(),this.expandByObject(t,n)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,n=!1){t.updateWorldMatrix(!1,!1);const i=t.geometry;if(i!==void 0){const s=i.getAttribute("position");if(n===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Yn):Yn.fromBufferAttribute(s,o),Yn.applyMatrix4(t.matrixWorld),this.expandByPoint(Yn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Bo.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Bo.copy(i.boundingBox)),Bo.applyMatrix4(t.matrixWorld),this.union(Bo)}const r=t.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],n);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,n){return n.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Yn),Yn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let n,i;return t.normal.x>0?(n=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(n=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(n+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(n+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(n+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(n+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),n<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Xs),ko.subVectors(this.max,Xs),Xr.subVectors(t.a,Xs),qr.subVectors(t.b,Xs),Yr.subVectors(t.c,Xs),qi.subVectors(qr,Xr),Yi.subVectors(Yr,qr),gr.subVectors(Xr,Yr);let n=[0,-qi.z,qi.y,0,-Yi.z,Yi.y,0,-gr.z,gr.y,qi.z,0,-qi.x,Yi.z,0,-Yi.x,gr.z,0,-gr.x,-qi.y,qi.x,0,-Yi.y,Yi.x,0,-gr.y,gr.x,0];return!Ac(n,Xr,qr,Yr,ko)||(n=[1,0,0,0,1,0,0,0,1],!Ac(n,Xr,qr,Yr,ko))?!1:(zo.crossVectors(qi,Yi),n=[zo.x,zo.y,zo.z],Ac(n,Xr,qr,Yr,ko))}clampPoint(t,n){return n.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Yn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Yn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Ti[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Ti[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Ti[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Ti[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Ti[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Ti[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Ti[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Ti[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Ti),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const Ti=[new U,new U,new U,new U,new U,new U,new U,new U],Yn=new U,Bo=new So,Xr=new U,qr=new U,Yr=new U,qi=new U,Yi=new U,gr=new U,Xs=new U,ko=new U,zo=new U,_r=new U;function Ac(e,t,n,i,r){for(let s=0,o=e.length-3;s<=o;s+=3){_r.fromArray(e,s);const a=r.x*Math.abs(_r.x)+r.y*Math.abs(_r.y)+r.z*Math.abs(_r.z),c=t.dot(_r),l=n.dot(_r),h=i.dot(_r);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}const Zg=new So,qs=new U,bc=new U;class Eo{constructor(t=new U,n=-1){this.isSphere=!0,this.center=t,this.radius=n}set(t,n){return this.center.copy(t),this.radius=n,this}setFromPoints(t,n){const i=this.center;n!==void 0?i.copy(n):Zg.setFromPoints(t).getCenter(i);let r=0;for(let s=0,o=t.length;s<o;s++)r=Math.max(r,i.distanceToSquared(t[s]));return this.radius=Math.sqrt(r),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const n=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=n*n}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,n){const i=this.center.distanceToSquared(t);return n.copy(t),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;qs.subVectors(t,this.center);const n=qs.lengthSq();if(n>this.radius*this.radius){const i=Math.sqrt(n),r=(i-this.radius)*.5;this.center.addScaledVector(qs,r/i),this.radius+=r}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(bc.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(qs.copy(t.center).add(bc)),this.expandByPoint(qs.copy(t.center).sub(bc))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Ai=new U,wc=new U,Vo=new U,ji=new U,Rc=new U,Go=new U,Cc=new U;class Tp{constructor(t=new U,n=new U(0,0,-1)){this.origin=t,this.direction=n}set(t,n){return this.origin.copy(t),this.direction.copy(n),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,n){return n.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Ai)),this}closestPointToPoint(t,n){n.subVectors(t,this.origin);const i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const n=Ai.subVectors(t,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(t):(Ai.copy(this.origin).addScaledVector(this.direction,n),Ai.distanceToSquared(t))}distanceSqToSegment(t,n,i,r){wc.copy(t).add(n).multiplyScalar(.5),Vo.copy(n).sub(t).normalize(),ji.copy(this.origin).sub(wc);const s=t.distanceTo(n)*.5,o=-this.direction.dot(Vo),a=ji.dot(this.direction),c=-ji.dot(Vo),l=ji.lengthSq(),h=Math.abs(1-o*o);let u,f,p,g;if(h>0)if(u=o*c-a,f=o*a-c,g=s*h,u>=0)if(f>=-g)if(f<=g){const v=1/h;u*=v,f*=v,p=u*(u+o*f+2*a)+f*(o*u+f+2*c)+l}else f=s,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*c)+l;else f=-s,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*c)+l;else f<=-g?(u=Math.max(0,-(-o*s+a)),f=u>0?-s:Math.min(Math.max(-s,-c),s),p=-u*u+f*(f+2*c)+l):f<=g?(u=0,f=Math.min(Math.max(-s,-c),s),p=f*(f+2*c)+l):(u=Math.max(0,-(o*s+a)),f=u>0?s:Math.min(Math.max(-s,-c),s),p=-u*u+f*(f+2*c)+l);else f=o>0?-s:s,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(wc).addScaledVector(Vo,f),p}intersectSphere(t,n){Ai.subVectors(t.center,this.origin);const i=Ai.dot(this.direction),r=Ai.dot(Ai)-i*i,s=t.radius*t.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,n):this.at(a,n)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const n=t.normal.dot(this.direction);if(n===0)return t.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(t.normal)+t.constant)/n;return i>=0?i:null}intersectPlane(t,n){const i=this.distanceToPlane(t);return i===null?null:this.at(i,n)}intersectsPlane(t){const n=t.distanceToPoint(this.origin);return n===0||t.normal.dot(this.direction)*n<0}intersectBox(t,n){let i,r,s,o,a,c;const l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return l>=0?(i=(t.min.x-f.x)*l,r=(t.max.x-f.x)*l):(i=(t.max.x-f.x)*l,r=(t.min.x-f.x)*l),h>=0?(s=(t.min.y-f.y)*h,o=(t.max.y-f.y)*h):(s=(t.max.y-f.y)*h,o=(t.min.y-f.y)*h),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),u>=0?(a=(t.min.z-f.z)*u,c=(t.max.z-f.z)*u):(a=(t.max.z-f.z)*u,c=(t.min.z-f.z)*u),i>c||a>r)||((a>i||i!==i)&&(i=a),(c<r||r!==r)&&(r=c),r<0)?null:this.at(i>=0?i:r,n)}intersectsBox(t){return this.intersectBox(t,Ai)!==null}intersectTriangle(t,n,i,r,s){Rc.subVectors(n,t),Go.subVectors(i,t),Cc.crossVectors(Rc,Go);let o=this.direction.dot(Cc),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;ji.subVectors(this.origin,t);const c=a*this.direction.dot(Go.crossVectors(ji,Go));if(c<0)return null;const l=a*this.direction.dot(Rc.cross(ji));if(l<0||c+l>o)return null;const h=-a*ji.dot(Cc);return h<0?null:this.at(h/o,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class De{constructor(t,n,i,r,s,o,a,c,l,h,u,f,p,g,v,m){De.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,i,r,s,o,a,c,l,h,u,f,p,g,v,m)}set(t,n,i,r,s,o,a,c,l,h,u,f,p,g,v,m){const d=this.elements;return d[0]=t,d[4]=n,d[8]=i,d[12]=r,d[1]=s,d[5]=o,d[9]=a,d[13]=c,d[2]=l,d[6]=h,d[10]=u,d[14]=f,d[3]=p,d[7]=g,d[11]=v,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new De().fromArray(this.elements)}copy(t){const n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(t){const n=this.elements,i=t.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(t){const n=t.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(t,n,i){return t.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,n,i){return this.set(t.x,n.x,i.x,0,t.y,n.y,i.y,0,t.z,n.z,i.z,0,0,0,0,1),this}extractRotation(t){const n=this.elements,i=t.elements,r=1/jr.setFromMatrixColumn(t,0).length(),s=1/jr.setFromMatrixColumn(t,1).length(),o=1/jr.setFromMatrixColumn(t,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*o,n[9]=i[9]*o,n[10]=i[10]*o,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(t){const n=this.elements,i=t.x,r=t.y,s=t.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(r),l=Math.sin(r),h=Math.cos(s),u=Math.sin(s);if(t.order==="XYZ"){const f=o*h,p=o*u,g=a*h,v=a*u;n[0]=c*h,n[4]=-c*u,n[8]=l,n[1]=p+g*l,n[5]=f-v*l,n[9]=-a*c,n[2]=v-f*l,n[6]=g+p*l,n[10]=o*c}else if(t.order==="YXZ"){const f=c*h,p=c*u,g=l*h,v=l*u;n[0]=f+v*a,n[4]=g*a-p,n[8]=o*l,n[1]=o*u,n[5]=o*h,n[9]=-a,n[2]=p*a-g,n[6]=v+f*a,n[10]=o*c}else if(t.order==="ZXY"){const f=c*h,p=c*u,g=l*h,v=l*u;n[0]=f-v*a,n[4]=-o*u,n[8]=g+p*a,n[1]=p+g*a,n[5]=o*h,n[9]=v-f*a,n[2]=-o*l,n[6]=a,n[10]=o*c}else if(t.order==="ZYX"){const f=o*h,p=o*u,g=a*h,v=a*u;n[0]=c*h,n[4]=g*l-p,n[8]=f*l+v,n[1]=c*u,n[5]=v*l+f,n[9]=p*l-g,n[2]=-l,n[6]=a*c,n[10]=o*c}else if(t.order==="YZX"){const f=o*c,p=o*l,g=a*c,v=a*l;n[0]=c*h,n[4]=v-f*u,n[8]=g*u+p,n[1]=u,n[5]=o*h,n[9]=-a*h,n[2]=-l*h,n[6]=p*u+g,n[10]=f-v*u}else if(t.order==="XZY"){const f=o*c,p=o*l,g=a*c,v=a*l;n[0]=c*h,n[4]=-u,n[8]=l*h,n[1]=f*u+v,n[5]=o*h,n[9]=p*u-g,n[2]=g*u-p,n[6]=a*h,n[10]=v*u+f}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Jg,t,Qg)}lookAt(t,n,i){const r=this.elements;return yn.subVectors(t,n),yn.lengthSq()===0&&(yn.z=1),yn.normalize(),Ki.crossVectors(i,yn),Ki.lengthSq()===0&&(Math.abs(i.z)===1?yn.x+=1e-4:yn.z+=1e-4,yn.normalize(),Ki.crossVectors(i,yn)),Ki.normalize(),Ho.crossVectors(yn,Ki),r[0]=Ki.x,r[4]=Ho.x,r[8]=yn.x,r[1]=Ki.y,r[5]=Ho.y,r[9]=yn.y,r[2]=Ki.z,r[6]=Ho.z,r[10]=yn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){const i=t.elements,r=n.elements,s=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],h=i[1],u=i[5],f=i[9],p=i[13],g=i[2],v=i[6],m=i[10],d=i[14],A=i[3],T=i[7],S=i[11],N=i[15],R=r[0],b=r[4],D=r[8],y=r[12],x=r[1],w=r[5],G=r[9],k=r[13],j=r[2],K=r[6],H=r[10],$=r[14],z=r[3],it=r[7],ht=r[11],Et=r[15];return s[0]=o*R+a*x+c*j+l*z,s[4]=o*b+a*w+c*K+l*it,s[8]=o*D+a*G+c*H+l*ht,s[12]=o*y+a*k+c*$+l*Et,s[1]=h*R+u*x+f*j+p*z,s[5]=h*b+u*w+f*K+p*it,s[9]=h*D+u*G+f*H+p*ht,s[13]=h*y+u*k+f*$+p*Et,s[2]=g*R+v*x+m*j+d*z,s[6]=g*b+v*w+m*K+d*it,s[10]=g*D+v*G+m*H+d*ht,s[14]=g*y+v*k+m*$+d*Et,s[3]=A*R+T*x+S*j+N*z,s[7]=A*b+T*w+S*K+N*it,s[11]=A*D+T*G+S*H+N*ht,s[15]=A*y+T*k+S*$+N*Et,this}multiplyScalar(t){const n=this.elements;return n[0]*=t,n[4]*=t,n[8]*=t,n[12]*=t,n[1]*=t,n[5]*=t,n[9]*=t,n[13]*=t,n[2]*=t,n[6]*=t,n[10]*=t,n[14]*=t,n[3]*=t,n[7]*=t,n[11]*=t,n[15]*=t,this}determinant(){const t=this.elements,n=t[0],i=t[4],r=t[8],s=t[12],o=t[1],a=t[5],c=t[9],l=t[13],h=t[2],u=t[6],f=t[10],p=t[14],g=t[3],v=t[7],m=t[11],d=t[15];return g*(+s*c*u-r*l*u-s*a*f+i*l*f+r*a*p-i*c*p)+v*(+n*c*p-n*l*f+s*o*f-r*o*p+r*l*h-s*c*h)+m*(+n*l*u-n*a*p-s*o*u+i*o*p+s*a*h-i*l*h)+d*(-r*a*h-n*c*u+n*a*f+r*o*u-i*o*f+i*c*h)}transpose(){const t=this.elements;let n;return n=t[1],t[1]=t[4],t[4]=n,n=t[2],t[2]=t[8],t[8]=n,n=t[6],t[6]=t[9],t[9]=n,n=t[3],t[3]=t[12],t[12]=n,n=t[7],t[7]=t[13],t[13]=n,n=t[11],t[11]=t[14],t[14]=n,this}setPosition(t,n,i){const r=this.elements;return t.isVector3?(r[12]=t.x,r[13]=t.y,r[14]=t.z):(r[12]=t,r[13]=n,r[14]=i),this}invert(){const t=this.elements,n=t[0],i=t[1],r=t[2],s=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],u=t[9],f=t[10],p=t[11],g=t[12],v=t[13],m=t[14],d=t[15],A=u*m*l-v*f*l+v*c*p-a*m*p-u*c*d+a*f*d,T=g*f*l-h*m*l-g*c*p+o*m*p+h*c*d-o*f*d,S=h*v*l-g*u*l+g*a*p-o*v*p-h*a*d+o*u*d,N=g*u*c-h*v*c-g*a*f+o*v*f+h*a*m-o*u*m,R=n*A+i*T+r*S+s*N;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const b=1/R;return t[0]=A*b,t[1]=(v*f*s-u*m*s-v*r*p+i*m*p+u*r*d-i*f*d)*b,t[2]=(a*m*s-v*c*s+v*r*l-i*m*l-a*r*d+i*c*d)*b,t[3]=(u*c*s-a*f*s-u*r*l+i*f*l+a*r*p-i*c*p)*b,t[4]=T*b,t[5]=(h*m*s-g*f*s+g*r*p-n*m*p-h*r*d+n*f*d)*b,t[6]=(g*c*s-o*m*s-g*r*l+n*m*l+o*r*d-n*c*d)*b,t[7]=(o*f*s-h*c*s+h*r*l-n*f*l-o*r*p+n*c*p)*b,t[8]=S*b,t[9]=(g*u*s-h*v*s-g*i*p+n*v*p+h*i*d-n*u*d)*b,t[10]=(o*v*s-g*a*s+g*i*l-n*v*l-o*i*d+n*a*d)*b,t[11]=(h*a*s-o*u*s-h*i*l+n*u*l+o*i*p-n*a*p)*b,t[12]=N*b,t[13]=(h*v*r-g*u*r+g*i*f-n*v*f-h*i*m+n*u*m)*b,t[14]=(g*a*r-o*v*r-g*i*c+n*v*c+o*i*m-n*a*m)*b,t[15]=(o*u*r-h*a*r+h*i*c-n*u*c-o*i*f+n*a*f)*b,this}scale(t){const n=this.elements,i=t.x,r=t.y,s=t.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){const t=this.elements,n=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],r=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(t,n,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(t){const n=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(t){const n=Math.cos(t),i=Math.sin(t);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(t){const n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,n){const i=Math.cos(n),r=Math.sin(n),s=1-i,o=t.x,a=t.y,c=t.z,l=s*o,h=s*a;return this.set(l*o+i,l*a-r*c,l*c+r*a,0,l*a+r*c,h*a+i,h*c-r*o,0,l*c-r*a,h*c+r*o,s*c*c+i,0,0,0,0,1),this}makeScale(t,n,i){return this.set(t,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,n,i,r,s,o){return this.set(1,i,s,0,t,1,o,0,n,r,1,0,0,0,0,1),this}compose(t,n,i){const r=this.elements,s=n._x,o=n._y,a=n._z,c=n._w,l=s+s,h=o+o,u=a+a,f=s*l,p=s*h,g=s*u,v=o*h,m=o*u,d=a*u,A=c*l,T=c*h,S=c*u,N=i.x,R=i.y,b=i.z;return r[0]=(1-(v+d))*N,r[1]=(p+S)*N,r[2]=(g-T)*N,r[3]=0,r[4]=(p-S)*R,r[5]=(1-(f+d))*R,r[6]=(m+A)*R,r[7]=0,r[8]=(g+T)*b,r[9]=(m-A)*b,r[10]=(1-(f+v))*b,r[11]=0,r[12]=t.x,r[13]=t.y,r[14]=t.z,r[15]=1,this}decompose(t,n,i){const r=this.elements;let s=jr.set(r[0],r[1],r[2]).length();const o=jr.set(r[4],r[5],r[6]).length(),a=jr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),t.x=r[12],t.y=r[13],t.z=r[14],jn.copy(this);const l=1/s,h=1/o,u=1/a;return jn.elements[0]*=l,jn.elements[1]*=l,jn.elements[2]*=l,jn.elements[4]*=h,jn.elements[5]*=h,jn.elements[6]*=h,jn.elements[8]*=u,jn.elements[9]*=u,jn.elements[10]*=u,n.setFromRotationMatrix(jn),i.x=s,i.y=o,i.z=a,this}makePerspective(t,n,i,r,s,o,a=Ii){const c=this.elements,l=2*s/(n-t),h=2*s/(i-r),u=(n+t)/(n-t),f=(i+r)/(i-r);let p,g;if(a===Ii)p=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===Pa)p=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=l,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,n,i,r,s,o,a=Ii){const c=this.elements,l=1/(n-t),h=1/(i-r),u=1/(o-s),f=(n+t)*l,p=(i+r)*h;let g,v;if(a===Ii)g=(o+s)*u,v=-2*u;else if(a===Pa)g=s*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*l,c[4]=0,c[8]=0,c[12]=-f,c[1]=0,c[5]=2*h,c[9]=0,c[13]=-p,c[2]=0,c[6]=0,c[10]=v,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){const n=this.elements,i=t.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(t,n=0){for(let i=0;i<16;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){const i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t[n+9]=i[9],t[n+10]=i[10],t[n+11]=i[11],t[n+12]=i[12],t[n+13]=i[13],t[n+14]=i[14],t[n+15]=i[15],t}}const jr=new U,jn=new De,Jg=new U(0,0,0),Qg=new U(1,1,1),Ki=new U,Ho=new U,yn=new U,pf=new De,mf=new Is;class pi{constructor(t=0,n=0,i=0,r=pi.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,n,i,r=this._order){return this._x=t,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,n=this._order,i=!0){const r=t.elements,s=r[0],o=r[4],a=r[8],c=r[1],l=r[5],h=r[9],u=r[2],f=r[6],p=r[10];switch(n){case"XYZ":this._y=Math.asin(nn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-nn(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(nn(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-nn(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(nn(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-nn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,n,i){return pf.makeRotationFromQuaternion(t),this.setFromRotationMatrix(pf,n,i)}setFromVector3(t,n=this._order){return this.set(t.x,t.y,t.z,n)}reorder(t){return mf.setFromEuler(this),this.setFromQuaternion(mf,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}pi.DEFAULT_ORDER="XYZ";class Ap{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let t_=0;const gf=new U,Kr=new Is,bi=new De,Wo=new U,Ys=new U,e_=new U,n_=new Is,_f=new U(1,0,0),vf=new U(0,1,0),xf=new U(0,0,1),Mf={type:"added"},i_={type:"removed"},$r={type:"childadded",child:null},Pc={type:"childremoved",child:null};class gn extends Ds{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:t_++}),this.uuid=yo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=gn.DEFAULT_UP.clone();const t=new U,n=new pi,i=new Is,r=new U(1,1,1);function s(){i.setFromEuler(n,!1)}function o(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new De},normalMatrix:{value:new Bt}}),this.matrix=new De,this.matrixWorld=new De,this.matrixAutoUpdate=gn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=gn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ap,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,n){this.quaternion.setFromAxisAngle(t,n)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,n){return Kr.setFromAxisAngle(t,n),this.quaternion.multiply(Kr),this}rotateOnWorldAxis(t,n){return Kr.setFromAxisAngle(t,n),this.quaternion.premultiply(Kr),this}rotateX(t){return this.rotateOnAxis(_f,t)}rotateY(t){return this.rotateOnAxis(vf,t)}rotateZ(t){return this.rotateOnAxis(xf,t)}translateOnAxis(t,n){return gf.copy(t).applyQuaternion(this.quaternion),this.position.add(gf.multiplyScalar(n)),this}translateX(t){return this.translateOnAxis(_f,t)}translateY(t){return this.translateOnAxis(vf,t)}translateZ(t){return this.translateOnAxis(xf,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(bi.copy(this.matrixWorld).invert())}lookAt(t,n,i){t.isVector3?Wo.copy(t):Wo.set(t,n,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Ys.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?bi.lookAt(Ys,Wo,this.up):bi.lookAt(Wo,Ys,this.up),this.quaternion.setFromRotationMatrix(bi),r&&(bi.extractRotation(r.matrixWorld),Kr.setFromRotationMatrix(bi),this.quaternion.premultiply(Kr.invert()))}add(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Mf),$r.child=t,this.dispatchEvent($r),$r.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(t);return n!==-1&&(t.parent=null,this.children.splice(n,1),t.dispatchEvent(i_),Pc.child=t,this.dispatchEvent(Pc),Pc.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),bi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),bi.multiply(t.parent.matrixWorld)),t.applyMatrix4(bi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Mf),$r.child=t,this.dispatchEvent($r),$r.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,n){if(this[t]===n)return this;for(let i=0,r=this.children.length;i<r;i++){const o=this.children[i].getObjectByProperty(t,n);if(o!==void 0)return o}}getObjectsByProperty(t,n,i=[]){this[t]===n&&i.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(t,n,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ys,t,e_),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ys,n_,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return t.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(t){t(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(t)}traverseAncestors(t){const n=this.parent;n!==null&&(t(n),n.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(t)}updateWorldMatrix(t,n){const i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(t){const n=t===void 0||typeof t=="string",i={};n&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const u=c[l];s(t.shapes,u)}else s(t.shapes,c)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(s(t.materials,this.material[c]));r.material=a}else r.material=s(t.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];r.animations.push(s(t.animations,c))}}if(n){const a=o(t.geometries),c=o(t.materials),l=o(t.textures),h=o(t.images),u=o(t.shapes),f=o(t.skeletons),p=o(t.animations),g=o(t.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),f.length>0&&(i.skeletons=f),p.length>0&&(i.animations=p),g.length>0&&(i.nodes=g)}return i.object=r,i;function o(a){const c=[];for(const l in a){const h=a[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,n=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),n===!0)for(let i=0;i<t.children.length;i++){const r=t.children[i];this.add(r.clone())}return this}}gn.DEFAULT_UP=new U(0,1,0);gn.DEFAULT_MATRIX_AUTO_UPDATE=!0;gn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Kn=new U,wi=new U,Lc=new U,Ri=new U,Zr=new U,Jr=new U,yf=new U,Dc=new U,Ic=new U,Uc=new U,Nc=new Oe,Fc=new Oe,Oc=new Oe;class $n{constructor(t=new U,n=new U,i=new U){this.a=t,this.b=n,this.c=i}static getNormal(t,n,i,r){r.subVectors(i,n),Kn.subVectors(t,n),r.cross(Kn);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(t,n,i,r,s){Kn.subVectors(r,n),wi.subVectors(i,n),Lc.subVectors(t,n);const o=Kn.dot(Kn),a=Kn.dot(wi),c=Kn.dot(Lc),l=wi.dot(wi),h=wi.dot(Lc),u=o*l-a*a;if(u===0)return s.set(0,0,0),null;const f=1/u,p=(l*c-a*h)*f,g=(o*h-a*c)*f;return s.set(1-p-g,g,p)}static containsPoint(t,n,i,r){return this.getBarycoord(t,n,i,r,Ri)===null?!1:Ri.x>=0&&Ri.y>=0&&Ri.x+Ri.y<=1}static getInterpolation(t,n,i,r,s,o,a,c){return this.getBarycoord(t,n,i,r,Ri)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Ri.x),c.addScaledVector(o,Ri.y),c.addScaledVector(a,Ri.z),c)}static getInterpolatedAttribute(t,n,i,r,s,o){return Nc.setScalar(0),Fc.setScalar(0),Oc.setScalar(0),Nc.fromBufferAttribute(t,n),Fc.fromBufferAttribute(t,i),Oc.fromBufferAttribute(t,r),o.setScalar(0),o.addScaledVector(Nc,s.x),o.addScaledVector(Fc,s.y),o.addScaledVector(Oc,s.z),o}static isFrontFacing(t,n,i,r){return Kn.subVectors(i,n),wi.subVectors(t,n),Kn.cross(wi).dot(r)<0}set(t,n,i){return this.a.copy(t),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(t,n,i,r){return this.a.copy(t[n]),this.b.copy(t[i]),this.c.copy(t[r]),this}setFromAttributeAndIndices(t,n,i,r){return this.a.fromBufferAttribute(t,n),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,r),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Kn.subVectors(this.c,this.b),wi.subVectors(this.a,this.b),Kn.cross(wi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return $n.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return $n.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,i,r,s){return $n.getInterpolation(t,this.a,this.b,this.c,n,i,r,s)}containsPoint(t){return $n.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return $n.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,n){const i=this.a,r=this.b,s=this.c;let o,a;Zr.subVectors(r,i),Jr.subVectors(s,i),Dc.subVectors(t,i);const c=Zr.dot(Dc),l=Jr.dot(Dc);if(c<=0&&l<=0)return n.copy(i);Ic.subVectors(t,r);const h=Zr.dot(Ic),u=Jr.dot(Ic);if(h>=0&&u<=h)return n.copy(r);const f=c*u-h*l;if(f<=0&&c>=0&&h<=0)return o=c/(c-h),n.copy(i).addScaledVector(Zr,o);Uc.subVectors(t,s);const p=Zr.dot(Uc),g=Jr.dot(Uc);if(g>=0&&p<=g)return n.copy(s);const v=p*l-c*g;if(v<=0&&l>=0&&g<=0)return a=l/(l-g),n.copy(i).addScaledVector(Jr,a);const m=h*g-p*u;if(m<=0&&u-h>=0&&p-g>=0)return yf.subVectors(s,r),a=(u-h)/(u-h+(p-g)),n.copy(r).addScaledVector(yf,a);const d=1/(m+v+f);return o=v*d,a=f*d,n.copy(i).addScaledVector(Zr,o).addScaledVector(Jr,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const bp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},$i={h:0,s:0,l:0},Xo={h:0,s:0,l:0};function Bc(e,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}class oe{constructor(t,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,n,i)}set(t,n,i){if(n===void 0&&i===void 0){const r=t;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(t,n,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,n=On){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,$t.toWorkingColorSpace(this,n),this}setRGB(t,n,i,r=$t.workingColorSpace){return this.r=t,this.g=n,this.b=i,$t.toWorkingColorSpace(this,r),this}setHSL(t,n,i,r=$t.workingColorSpace){if(t=Vg(t,1),n=nn(n,0,1),i=nn(i,0,1),n===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+n):i+n-i*n,o=2*i-s;this.r=Bc(o,s,t+1/3),this.g=Bc(o,s,t),this.b=Bc(o,s,t-1/3)}return $t.toWorkingColorSpace(this,r),this}setStyle(t,n=On){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(t)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,n);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,n);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(t)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,n);if(o===6)return this.setHex(parseInt(s,16),n);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,n);return this}setColorName(t,n=On){const i=bp[t.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ni(t.r),this.g=Ni(t.g),this.b=Ni(t.b),this}copyLinearToSRGB(t){return this.r=fs(t.r),this.g=fs(t.g),this.b=fs(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=On){return $t.fromWorkingColorSpace(tn.copy(this),t),Math.round(nn(tn.r*255,0,255))*65536+Math.round(nn(tn.g*255,0,255))*256+Math.round(nn(tn.b*255,0,255))}getHexString(t=On){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,n=$t.workingColorSpace){$t.fromWorkingColorSpace(tn.copy(this),n);const i=tn.r,r=tn.g,s=tn.b,o=Math.max(i,r,s),a=Math.min(i,r,s);let c,l;const h=(a+o)/2;if(a===o)c=0,l=0;else{const u=o-a;switch(l=h<=.5?u/(o+a):u/(2-o-a),o){case i:c=(r-s)/u+(r<s?6:0);break;case r:c=(s-i)/u+2;break;case s:c=(i-r)/u+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,n=$t.workingColorSpace){return $t.fromWorkingColorSpace(tn.copy(this),n),t.r=tn.r,t.g=tn.g,t.b=tn.b,t}getStyle(t=On){$t.fromWorkingColorSpace(tn.copy(this),t);const n=tn.r,i=tn.g,r=tn.b;return t!==On?`color(${t} ${n.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(t,n,i){return this.getHSL($i),this.setHSL($i.h+t,$i.s+n,$i.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,n){return this.r=t.r+n.r,this.g=t.g+n.g,this.b=t.b+n.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,n){return this.r+=(t.r-this.r)*n,this.g+=(t.g-this.g)*n,this.b+=(t.b-this.b)*n,this}lerpColors(t,n,i){return this.r=t.r+(n.r-t.r)*i,this.g=t.g+(n.g-t.g)*i,this.b=t.b+(n.b-t.b)*i,this}lerpHSL(t,n){this.getHSL($i),t.getHSL(Xo);const i=yc($i.h,Xo.h,n),r=yc($i.s,Xo.s,n),s=yc($i.l,Xo.l,n);return this.setHSL(i,r,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const n=this.r,i=this.g,r=this.b,s=t.elements;return this.r=s[0]*n+s[3]*i+s[6]*r,this.g=s[1]*n+s[4]*i+s[7]*r,this.b=s[2]*n+s[5]*i+s[8]*r,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,n=0){return this.r=t[n],this.g=t[n+1],this.b=t[n+2],this}toArray(t=[],n=0){return t[n]=this.r,t[n+1]=this.g,t[n+2]=this.b,t}fromBufferAttribute(t,n){return this.r=t.getX(n),this.g=t.getY(n),this.b=t.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const tn=new oe;oe.NAMES=bp;let r_=0;class To extends Ds{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:r_++}),this.uuid=yo(),this.name="",this.blending=hs,this.side=ar,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=_l,this.blendDst=vl,this.blendEquation=wr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new oe(0,0,0),this.blendAlpha=0,this.depthFunc=ms,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=rf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Hr,this.stencilZFail=Hr,this.stencilZPass=Hr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const n in t){const i=t[n];if(i===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}const r=this[n];if(r===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[n]=i}}toJSON(t){const n=t===void 0||typeof t=="string";n&&(t={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==hs&&(i.blending=this.blending),this.side!==ar&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==_l&&(i.blendSrc=this.blendSrc),this.blendDst!==vl&&(i.blendDst=this.blendDst),this.blendEquation!==wr&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ms&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==rf&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Hr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Hr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Hr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const o=[];for(const a in s){const c=s[a];delete c.metadata,o.push(c)}return o}if(n){const s=r(t.textures),o=r(t.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const n=t.clippingPlanes;let i=null;if(n!==null){const r=n.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=n[s].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class wp extends To{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=cp,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const ze=new U,qo=new ee;class rn{constructor(t,n,i=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=n,this.count=t!==void 0?t.length/n:0,this.normalized=i,this.usage=sf,this.updateRanges=[],this.gpuType=Di,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,n,i){t*=this.itemSize,i*=n.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[t+r]=n.array[i+r];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)qo.fromBufferAttribute(this,n),qo.applyMatrix3(t),this.setXY(n,qo.x,qo.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)ze.fromBufferAttribute(this,n),ze.applyMatrix3(t),this.setXYZ(n,ze.x,ze.y,ze.z);return this}applyMatrix4(t){for(let n=0,i=this.count;n<i;n++)ze.fromBufferAttribute(this,n),ze.applyMatrix4(t),this.setXYZ(n,ze.x,ze.y,ze.z);return this}applyNormalMatrix(t){for(let n=0,i=this.count;n<i;n++)ze.fromBufferAttribute(this,n),ze.applyNormalMatrix(t),this.setXYZ(n,ze.x,ze.y,ze.z);return this}transformDirection(t){for(let n=0,i=this.count;n<i;n++)ze.fromBufferAttribute(this,n),ze.transformDirection(t),this.setXYZ(n,ze.x,ze.y,ze.z);return this}set(t,n=0){return this.array.set(t,n),this}getComponent(t,n){let i=this.array[t*this.itemSize+n];return this.normalized&&(i=Ws(i,this.array)),i}setComponent(t,n,i){return this.normalized&&(i=un(i,this.array)),this.array[t*this.itemSize+n]=i,this}getX(t){let n=this.array[t*this.itemSize];return this.normalized&&(n=Ws(n,this.array)),n}setX(t,n){return this.normalized&&(n=un(n,this.array)),this.array[t*this.itemSize]=n,this}getY(t){let n=this.array[t*this.itemSize+1];return this.normalized&&(n=Ws(n,this.array)),n}setY(t,n){return this.normalized&&(n=un(n,this.array)),this.array[t*this.itemSize+1]=n,this}getZ(t){let n=this.array[t*this.itemSize+2];return this.normalized&&(n=Ws(n,this.array)),n}setZ(t,n){return this.normalized&&(n=un(n,this.array)),this.array[t*this.itemSize+2]=n,this}getW(t){let n=this.array[t*this.itemSize+3];return this.normalized&&(n=Ws(n,this.array)),n}setW(t,n){return this.normalized&&(n=un(n,this.array)),this.array[t*this.itemSize+3]=n,this}setXY(t,n,i){return t*=this.itemSize,this.normalized&&(n=un(n,this.array),i=un(i,this.array)),this.array[t+0]=n,this.array[t+1]=i,this}setXYZ(t,n,i,r){return t*=this.itemSize,this.normalized&&(n=un(n,this.array),i=un(i,this.array),r=un(r,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=r,this}setXYZW(t,n,i,r,s){return t*=this.itemSize,this.normalized&&(n=un(n,this.array),i=un(i,this.array),r=un(r,this.array),s=un(s,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=r,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==sf&&(t.usage=this.usage),t}}class Rp extends rn{constructor(t,n,i){super(new Uint16Array(t),n,i)}}class Cp extends rn{constructor(t,n,i){super(new Uint32Array(t),n,i)}}class Dr extends rn{constructor(t,n,i){super(new Float32Array(t),n,i)}}let s_=0;const In=new De,kc=new gn,Qr=new U,Sn=new So,js=new So,je=new U;class Hi extends Ds{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:s_++}),this.uuid=yo(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(yp(t)?Cp:Rp)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,n){return this.attributes[t]=n,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,n,i=0){this.groups.push({start:t,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,n){this.drawRange.start=t,this.drawRange.count=n}applyMatrix4(t){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(t),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Bt().getNormalMatrix(t);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(t),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return In.makeRotationFromQuaternion(t),this.applyMatrix4(In),this}rotateX(t){return In.makeRotationX(t),this.applyMatrix4(In),this}rotateY(t){return In.makeRotationY(t),this.applyMatrix4(In),this}rotateZ(t){return In.makeRotationZ(t),this.applyMatrix4(In),this}translate(t,n,i){return In.makeTranslation(t,n,i),this.applyMatrix4(In),this}scale(t,n,i){return In.makeScale(t,n,i),this.applyMatrix4(In),this}lookAt(t){return kc.lookAt(t),kc.updateMatrix(),this.applyMatrix4(kc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Qr).negate(),this.translate(Qr.x,Qr.y,Qr.z),this}setFromPoints(t){const n=this.getAttribute("position");if(n===void 0){const i=[];for(let r=0,s=t.length;r<s;r++){const o=t[r];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Dr(i,3))}else{for(let i=0,r=n.count;i<r;i++){const s=t[i];n.setXYZ(i,s.x,s.y,s.z||0)}t.length>n.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new So);const t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),n)for(let i=0,r=n.length;i<r;i++){const s=n[i];Sn.setFromBufferAttribute(s),this.morphTargetsRelative?(je.addVectors(this.boundingBox.min,Sn.min),this.boundingBox.expandByPoint(je),je.addVectors(this.boundingBox.max,Sn.max),this.boundingBox.expandByPoint(je)):(this.boundingBox.expandByPoint(Sn.min),this.boundingBox.expandByPoint(Sn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Eo);const t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(t){const i=this.boundingSphere.center;if(Sn.setFromBufferAttribute(t),n)for(let s=0,o=n.length;s<o;s++){const a=n[s];js.setFromBufferAttribute(a),this.morphTargetsRelative?(je.addVectors(Sn.min,js.min),Sn.expandByPoint(je),je.addVectors(Sn.max,js.max),Sn.expandByPoint(je)):(Sn.expandByPoint(js.min),Sn.expandByPoint(js.max))}Sn.getCenter(i);let r=0;for(let s=0,o=t.count;s<o;s++)je.fromBufferAttribute(t,s),r=Math.max(r,i.distanceToSquared(je));if(n)for(let s=0,o=n.length;s<o;s++){const a=n[s],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)je.fromBufferAttribute(a,l),c&&(Qr.fromBufferAttribute(t,l),je.add(Qr)),r=Math.max(r,i.distanceToSquared(je))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,n=this.attributes;if(t===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=n.position,r=n.normal,s=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new rn(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let D=0;D<i.count;D++)a[D]=new U,c[D]=new U;const l=new U,h=new U,u=new U,f=new ee,p=new ee,g=new ee,v=new U,m=new U;function d(D,y,x){l.fromBufferAttribute(i,D),h.fromBufferAttribute(i,y),u.fromBufferAttribute(i,x),f.fromBufferAttribute(s,D),p.fromBufferAttribute(s,y),g.fromBufferAttribute(s,x),h.sub(l),u.sub(l),p.sub(f),g.sub(f);const w=1/(p.x*g.y-g.x*p.y);isFinite(w)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-p.y).multiplyScalar(w),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(w),a[D].add(v),a[y].add(v),a[x].add(v),c[D].add(m),c[y].add(m),c[x].add(m))}let A=this.groups;A.length===0&&(A=[{start:0,count:t.count}]);for(let D=0,y=A.length;D<y;++D){const x=A[D],w=x.start,G=x.count;for(let k=w,j=w+G;k<j;k+=3)d(t.getX(k+0),t.getX(k+1),t.getX(k+2))}const T=new U,S=new U,N=new U,R=new U;function b(D){N.fromBufferAttribute(r,D),R.copy(N);const y=a[D];T.copy(y),T.sub(N.multiplyScalar(N.dot(y))).normalize(),S.crossVectors(R,y);const w=S.dot(c[D])<0?-1:1;o.setXYZW(D,T.x,T.y,T.z,w)}for(let D=0,y=A.length;D<y;++D){const x=A[D],w=x.start,G=x.count;for(let k=w,j=w+G;k<j;k+=3)b(t.getX(k+0)),b(t.getX(k+1)),b(t.getX(k+2))}}computeVertexNormals(){const t=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new rn(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let f=0,p=i.count;f<p;f++)i.setXYZ(f,0,0,0);const r=new U,s=new U,o=new U,a=new U,c=new U,l=new U,h=new U,u=new U;if(t)for(let f=0,p=t.count;f<p;f+=3){const g=t.getX(f+0),v=t.getX(f+1),m=t.getX(f+2);r.fromBufferAttribute(n,g),s.fromBufferAttribute(n,v),o.fromBufferAttribute(n,m),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),a.fromBufferAttribute(i,g),c.fromBufferAttribute(i,v),l.fromBufferAttribute(i,m),a.add(h),c.add(h),l.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(v,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,p=n.count;f<p;f+=3)r.fromBufferAttribute(n,f+0),s.fromBufferAttribute(n,f+1),o.fromBufferAttribute(n,f+2),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),i.setXYZ(f+0,h.x,h.y,h.z),i.setXYZ(f+1,h.x,h.y,h.z),i.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let n=0,i=t.count;n<i;n++)je.fromBufferAttribute(t,n),je.normalize(),t.setXYZ(n,je.x,je.y,je.z)}toNonIndexed(){function t(a,c){const l=a.array,h=a.itemSize,u=a.normalized,f=new l.constructor(c.length*h);let p=0,g=0;for(let v=0,m=c.length;v<m;v++){a.isInterleavedBufferAttribute?p=c[v]*a.data.stride+a.offset:p=c[v]*h;for(let d=0;d<h;d++)f[g++]=l[p++]}return new rn(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new Hi,i=this.index.array,r=this.attributes;for(const a in r){const c=r[a],l=t(c,i);n.setAttribute(a,l)}const s=this.morphAttributes;for(const a in s){const c=[],l=s[a];for(let h=0,u=l.length;h<u;h++){const f=l[h],p=t(f,i);c.push(p)}n.morphAttributes[a]=c}n.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];n.addGroup(l.start,l.count,l.materialIndex)}return n}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};const n=this.index;n!==null&&(t.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const c in i){const l=i[c];t.data.attributes[c]=l.toJSON(t.data)}const r={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let u=0,f=l.length;u<f;u++){const p=l[u];h.push(p.toJSON(t.data))}h.length>0&&(r[c]=h,s=!0)}s&&(t.data.morphAttributes=r,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=t.name;const i=t.index;i!==null&&this.setIndex(i.clone(n));const r=t.attributes;for(const l in r){const h=r[l];this.setAttribute(l,h.clone(n))}const s=t.morphAttributes;for(const l in s){const h=[],u=s[l];for(let f=0,p=u.length;f<p;f++)h.push(u[f].clone(n));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let l=0,h=o.length;l<h;l++){const u=o[l];this.addGroup(u.start,u.count,u.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Sf=new De,vr=new Tp,Yo=new Eo,Ef=new U,jo=new U,Ko=new U,$o=new U,zc=new U,Zo=new U,Tf=new U,Jo=new U;class Ui extends gn{constructor(t=new Hi,n=new wp){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=n,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(t,n){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;n.fromBufferAttribute(r,t);const a=this.morphTargetInfluences;if(s&&a){Zo.set(0,0,0);for(let c=0,l=s.length;c<l;c++){const h=a[c],u=s[c];h!==0&&(zc.fromBufferAttribute(u,t),o?Zo.addScaledVector(zc,h):Zo.addScaledVector(zc.sub(n),h))}n.add(Zo)}return n}raycast(t,n){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Yo.copy(i.boundingSphere),Yo.applyMatrix4(s),vr.copy(t.ray).recast(t.near),!(Yo.containsPoint(vr.origin)===!1&&(vr.intersectSphere(Yo,Ef)===null||vr.origin.distanceToSquared(Ef)>(t.far-t.near)**2))&&(Sf.copy(s).invert(),vr.copy(t.ray).applyMatrix4(Sf),!(i.boundingBox!==null&&vr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,n,vr)))}_computeIntersections(t,n,i){let r;const s=this.geometry,o=this.material,a=s.index,c=s.attributes.position,l=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,f=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=f.length;g<v;g++){const m=f[g],d=o[m.materialIndex],A=Math.max(m.start,p.start),T=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let S=A,N=T;S<N;S+=3){const R=a.getX(S),b=a.getX(S+1),D=a.getX(S+2);r=Qo(this,d,t,i,l,h,u,R,b,D),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const g=Math.max(0,p.start),v=Math.min(a.count,p.start+p.count);for(let m=g,d=v;m<d;m+=3){const A=a.getX(m),T=a.getX(m+1),S=a.getX(m+2);r=Qo(this,o,t,i,l,h,u,A,T,S),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,v=f.length;g<v;g++){const m=f[g],d=o[m.materialIndex],A=Math.max(m.start,p.start),T=Math.min(c.count,Math.min(m.start+m.count,p.start+p.count));for(let S=A,N=T;S<N;S+=3){const R=S,b=S+1,D=S+2;r=Qo(this,d,t,i,l,h,u,R,b,D),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const g=Math.max(0,p.start),v=Math.min(c.count,p.start+p.count);for(let m=g,d=v;m<d;m+=3){const A=m,T=m+1,S=m+2;r=Qo(this,o,t,i,l,h,u,A,T,S),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}}}function o_(e,t,n,i,r,s,o,a){let c;if(t.side===pn?c=i.intersectTriangle(o,s,r,!0,a):c=i.intersectTriangle(r,s,o,t.side===ar,a),c===null)return null;Jo.copy(a),Jo.applyMatrix4(e.matrixWorld);const l=n.ray.origin.distanceTo(Jo);return l<n.near||l>n.far?null:{distance:l,point:Jo.clone(),object:e}}function Qo(e,t,n,i,r,s,o,a,c,l){e.getVertexPosition(a,jo),e.getVertexPosition(c,Ko),e.getVertexPosition(l,$o);const h=o_(e,t,n,i,jo,Ko,$o,Tf);if(h){const u=new U;$n.getBarycoord(Tf,jo,Ko,$o,u),r&&(h.uv=$n.getInterpolatedAttribute(r,a,c,l,u,new ee)),s&&(h.uv1=$n.getInterpolatedAttribute(s,a,c,l,u,new ee)),o&&(h.normal=$n.getInterpolatedAttribute(o,a,c,l,u,new U),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const f={a,b:c,c:l,normal:new U,materialIndex:0};$n.getNormal(jo,Ko,$o,f.normal),h.face=f,h.barycoord=u}return h}class Ao extends Hi{constructor(t=1,n=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const c=[],l=[],h=[],u=[];let f=0,p=0;g("z","y","x",-1,-1,i,n,t,o,s,0),g("z","y","x",1,-1,i,n,-t,o,s,1),g("x","z","y",1,1,t,i,n,r,o,2),g("x","z","y",1,-1,t,i,-n,r,o,3),g("x","y","z",1,-1,t,n,i,r,s,4),g("x","y","z",-1,-1,t,n,-i,r,s,5),this.setIndex(c),this.setAttribute("position",new Dr(l,3)),this.setAttribute("normal",new Dr(h,3)),this.setAttribute("uv",new Dr(u,2));function g(v,m,d,A,T,S,N,R,b,D,y){const x=S/b,w=N/D,G=S/2,k=N/2,j=R/2,K=b+1,H=D+1;let $=0,z=0;const it=new U;for(let ht=0;ht<H;ht++){const Et=ht*w-k;for(let Vt=0;Vt<K;Vt++){const le=Vt*x-G;it[v]=le*A,it[m]=Et*T,it[d]=j,l.push(it.x,it.y,it.z),it[v]=0,it[m]=0,it[d]=R>0?1:-1,h.push(it.x,it.y,it.z),u.push(Vt/b),u.push(1-ht/D),$+=1}}for(let ht=0;ht<D;ht++)for(let Et=0;Et<b;Et++){const Vt=f+Et+K*ht,le=f+Et+K*(ht+1),X=f+(Et+1)+K*(ht+1),et=f+(Et+1)+K*ht;c.push(Vt,le,et),c.push(le,X,et),z+=6}a.addGroup(p,z,y),p+=z,f+=$}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ao(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Ms(e){const t={};for(const n in e){t[n]={};for(const i in e[n]){const r=e[n][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null):t[n][i]=r.clone():Array.isArray(r)?t[n][i]=r.slice():t[n][i]=r}}return t}function an(e){const t={};for(let n=0;n<e.length;n++){const i=Ms(e[n]);for(const r in i)t[r]=i[r]}return t}function a_(e){const t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Pp(e){const t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:$t.workingColorSpace}const c_={clone:Ms,merge:an};var l_=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,h_=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class zi extends To{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=l_,this.fragmentShader=h_,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ms(t.uniforms),this.uniformsGroups=a_(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const n=super.toJSON(t);n.glslVersion=this.glslVersion,n.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?n.uniforms[r]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?n.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?n.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?n.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?n.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?n.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?n.uniforms[r]={type:"m4",value:o.toArray()}:n.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}}class Lp extends gn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new De,this.projectionMatrix=new De,this.projectionMatrixInverse=new De,this.coordinateSystem=Ii}copy(t,n){return super.copy(t,n),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,n){super.updateWorldMatrix(t,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Zi=new U,Af=new ee,bf=new ee;class Bn extends Lp{constructor(t=50,n=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const n=.5*this.getFilmHeight()/t;this.fov=nh*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Mc*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return nh*2*Math.atan(Math.tan(Mc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,n,i){Zi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Zi.x,Zi.y).multiplyScalar(-t/Zi.z),Zi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Zi.x,Zi.y).multiplyScalar(-t/Zi.z)}getViewSize(t,n){return this.getViewBounds(t,Af,bf),n.subVectors(bf,Af)}setViewOffset(t,n,i,r,s,o){this.aspect=t/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let n=t*Math.tan(Mc*.5*this.fov)/this.zoom,i=2*n,r=this.aspect*i,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;s+=o.offsetX*r/c,n-=o.offsetY*i/l,r*=o.width/c,i*=o.height/l}const a=this.filmOffset;a!==0&&(s+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,n,n-i,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const n=super.toJSON(t);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}const ts=-90,es=1;class u_ extends gn{constructor(t,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Bn(ts,es,t,n);r.layers=this.layers,this.add(r);const s=new Bn(ts,es,t,n);s.layers=this.layers,this.add(s);const o=new Bn(ts,es,t,n);o.layers=this.layers,this.add(o);const a=new Bn(ts,es,t,n);a.layers=this.layers,this.add(a);const c=new Bn(ts,es,t,n);c.layers=this.layers,this.add(c);const l=new Bn(ts,es,t,n);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const t=this.coordinateSystem,n=this.children.concat(),[i,r,s,o,a,c]=n;for(const l of n)this.remove(l);if(t===Ii)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Pa)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const l of n)this.add(l),l.updateMatrixWorld()}update(t,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,c,l,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,t.setRenderTarget(i,0,r),t.render(n,s),t.setRenderTarget(i,1,r),t.render(n,o),t.setRenderTarget(i,2,r),t.render(n,a),t.setRenderTarget(i,3,r),t.render(n,c),t.setRenderTarget(i,4,r),t.render(n,l),i.texture.generateMipmaps=v,t.setRenderTarget(i,5,r),t.render(n,h),t.setRenderTarget(u,f,p),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class Dp extends mn{constructor(t,n,i,r,s,o,a,c,l,h){t=t!==void 0?t:[],n=n!==void 0?n:gs,super(t,n,i,r,s,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class f_ extends kr{constructor(t=1,n={}){super(t,t,n),this.isWebGLCubeRenderTarget=!0;const i={width:t,height:t,depth:1},r=[i,i,i,i,i,i];this.texture=new Dp(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:di}fromEquirectangularTexture(t,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Ao(5,5,5),s=new zi({name:"CubemapFromEquirect",uniforms:Ms(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:pn,blending:rr});s.uniforms.tEquirect.value=n;const o=new Ui(r,s),a=n.minFilter;return n.minFilter===Lr&&(n.minFilter=di),new u_(1,10,this).update(t,o),n.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,n,i,r){const s=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(n,i,r);t.setRenderTarget(s)}}const Vc=new U,d_=new U,p_=new Bt;class Tr{constructor(t=new U(1,0,0),n=0){this.isPlane=!0,this.normal=t,this.constant=n}set(t,n){return this.normal.copy(t),this.constant=n,this}setComponents(t,n,i,r){return this.normal.set(t,n,i),this.constant=r,this}setFromNormalAndCoplanarPoint(t,n){return this.normal.copy(t),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(t,n,i){const r=Vc.subVectors(i,n).cross(d_.subVectors(t,n)).normalize();return this.setFromNormalAndCoplanarPoint(r,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,n){return n.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,n){const i=t.delta(Vc),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(t.start)===0?n.copy(t.start):null;const s=-(t.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:n.copy(t.start).addScaledVector(i,s)}intersectsLine(t){const n=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return n<0&&i>0||i<0&&n>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,n){const i=n||p_.getNormalMatrix(t),r=this.coplanarPoint(Vc).applyMatrix4(t),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const xr=new Eo,ta=new U;class Ip{constructor(t=new Tr,n=new Tr,i=new Tr,r=new Tr,s=new Tr,o=new Tr){this.planes=[t,n,i,r,s,o]}set(t,n,i,r,s,o){const a=this.planes;return a[0].copy(t),a[1].copy(n),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(t){const n=this.planes;for(let i=0;i<6;i++)n[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,n=Ii){const i=this.planes,r=t.elements,s=r[0],o=r[1],a=r[2],c=r[3],l=r[4],h=r[5],u=r[6],f=r[7],p=r[8],g=r[9],v=r[10],m=r[11],d=r[12],A=r[13],T=r[14],S=r[15];if(i[0].setComponents(c-s,f-l,m-p,S-d).normalize(),i[1].setComponents(c+s,f+l,m+p,S+d).normalize(),i[2].setComponents(c+o,f+h,m+g,S+A).normalize(),i[3].setComponents(c-o,f-h,m-g,S-A).normalize(),i[4].setComponents(c-a,f-u,m-v,S-T).normalize(),n===Ii)i[5].setComponents(c+a,f+u,m+v,S+T).normalize();else if(n===Pa)i[5].setComponents(a,u,v,T).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),xr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const n=t.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),xr.copy(n.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(xr)}intersectsSprite(t){return xr.center.set(0,0,0),xr.radius=.7071067811865476,xr.applyMatrix4(t.matrixWorld),this.intersectsSphere(xr)}intersectsSphere(t){const n=this.planes,i=t.center,r=-t.radius;for(let s=0;s<6;s++)if(n[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(t){const n=this.planes;for(let i=0;i<6;i++){const r=n[i];if(ta.x=r.normal.x>0?t.max.x:t.min.x,ta.y=r.normal.y>0?t.max.y:t.min.y,ta.z=r.normal.z>0?t.max.z:t.min.z,r.distanceToPoint(ta)<0)return!1}return!0}containsPoint(t){const n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Up(){let e=null,t=!1,n=null,i=null;function r(s,o){n(s,o),i=e.requestAnimationFrame(r)}return{start:function(){t!==!0&&n!==null&&(i=e.requestAnimationFrame(r),t=!0)},stop:function(){e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(s){n=s},setContext:function(s){e=s}}}function m_(e){const t=new WeakMap;function n(a,c){const l=a.array,h=a.usage,u=l.byteLength,f=e.createBuffer();e.bindBuffer(c,f),e.bufferData(c,l,h),a.onUploadCallback();let p;if(l instanceof Float32Array)p=e.FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?p=e.HALF_FLOAT:p=e.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=e.SHORT;else if(l instanceof Uint32Array)p=e.UNSIGNED_INT;else if(l instanceof Int32Array)p=e.INT;else if(l instanceof Int8Array)p=e.BYTE;else if(l instanceof Uint8Array)p=e.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,c,l){const h=c.array,u=c.updateRanges;if(e.bindBuffer(l,a),u.length===0)e.bufferSubData(l,0,h);else{u.sort((p,g)=>p.start-g.start);let f=0;for(let p=1;p<u.length;p++){const g=u[f],v=u[p];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++f,u[f]=v)}u.length=f+1;for(let p=0,g=u.length;p<g;p++){const v=u[p];e.bufferSubData(l,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=t.get(a);c&&(e.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=t.get(a);if(l===void 0)t.set(a,n(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:r,remove:s,update:o}}class Ya extends Hi{constructor(t=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:n,widthSegments:i,heightSegments:r};const s=t/2,o=n/2,a=Math.floor(i),c=Math.floor(r),l=a+1,h=c+1,u=t/a,f=n/c,p=[],g=[],v=[],m=[];for(let d=0;d<h;d++){const A=d*f-o;for(let T=0;T<l;T++){const S=T*u-s;g.push(S,-A,0),v.push(0,0,1),m.push(T/a),m.push(1-d/c)}}for(let d=0;d<c;d++)for(let A=0;A<a;A++){const T=A+l*d,S=A+l*(d+1),N=A+1+l*(d+1),R=A+1+l*d;p.push(T,S,R),p.push(S,N,R)}this.setIndex(p),this.setAttribute("position",new Dr(g,3)),this.setAttribute("normal",new Dr(v,3)),this.setAttribute("uv",new Dr(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ya(t.width,t.height,t.widthSegments,t.heightSegments)}}var g_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,__=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,v_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,x_=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,M_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,y_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,S_=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,E_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,T_=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,A_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,b_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,w_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,R_=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,C_=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,P_=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,L_=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,D_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,I_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,U_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,N_=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,F_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,O_=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,B_=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,k_=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,z_=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,V_=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,G_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,H_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,W_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,X_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,q_="gl_FragColor = linearToOutputTexel( gl_FragColor );",Y_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,j_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,K_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,$_=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Z_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,J_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Q_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,t1=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,e1=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,n1=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,i1=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,r1=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,s1=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,o1=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,a1=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,c1=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,l1=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,h1=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,u1=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,f1=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,d1=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,p1=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,m1=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,g1=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,_1=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,v1=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,x1=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,M1=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,y1=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,S1=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,E1=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,T1=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,A1=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,b1=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,w1=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,R1=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,C1=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,P1=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,L1=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,D1=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,I1=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,U1=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,N1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,F1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,O1=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,B1=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,k1=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,z1=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,V1=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,G1=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,H1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,W1=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,X1=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,q1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Y1=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,j1=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,K1=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,$1=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Z1=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,J1=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Q1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,t2=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,e2=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,n2=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,i2=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,r2=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,s2=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,o2=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,a2=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,c2=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,l2=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,h2=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,u2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,f2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,d2=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,p2=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const m2=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,g2=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,v2=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,x2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,M2=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,y2=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,S2=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,E2=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,T2=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,A2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,b2=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,w2=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,R2=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,C2=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,P2=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,L2=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,D2=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,I2=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,U2=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,N2=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,F2=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,O2=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,B2=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,k2=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,z2=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,V2=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,G2=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,H2=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,W2=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,X2=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,q2=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Y2=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,j2=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,zt={alphahash_fragment:g_,alphahash_pars_fragment:__,alphamap_fragment:v_,alphamap_pars_fragment:x_,alphatest_fragment:M_,alphatest_pars_fragment:y_,aomap_fragment:S_,aomap_pars_fragment:E_,batching_pars_vertex:T_,batching_vertex:A_,begin_vertex:b_,beginnormal_vertex:w_,bsdfs:R_,iridescence_fragment:C_,bumpmap_pars_fragment:P_,clipping_planes_fragment:L_,clipping_planes_pars_fragment:D_,clipping_planes_pars_vertex:I_,clipping_planes_vertex:U_,color_fragment:N_,color_pars_fragment:F_,color_pars_vertex:O_,color_vertex:B_,common:k_,cube_uv_reflection_fragment:z_,defaultnormal_vertex:V_,displacementmap_pars_vertex:G_,displacementmap_vertex:H_,emissivemap_fragment:W_,emissivemap_pars_fragment:X_,colorspace_fragment:q_,colorspace_pars_fragment:Y_,envmap_fragment:j_,envmap_common_pars_fragment:K_,envmap_pars_fragment:$_,envmap_pars_vertex:Z_,envmap_physical_pars_fragment:c1,envmap_vertex:J_,fog_vertex:Q_,fog_pars_vertex:t1,fog_fragment:e1,fog_pars_fragment:n1,gradientmap_pars_fragment:i1,lightmap_pars_fragment:r1,lights_lambert_fragment:s1,lights_lambert_pars_fragment:o1,lights_pars_begin:a1,lights_toon_fragment:l1,lights_toon_pars_fragment:h1,lights_phong_fragment:u1,lights_phong_pars_fragment:f1,lights_physical_fragment:d1,lights_physical_pars_fragment:p1,lights_fragment_begin:m1,lights_fragment_maps:g1,lights_fragment_end:_1,logdepthbuf_fragment:v1,logdepthbuf_pars_fragment:x1,logdepthbuf_pars_vertex:M1,logdepthbuf_vertex:y1,map_fragment:S1,map_pars_fragment:E1,map_particle_fragment:T1,map_particle_pars_fragment:A1,metalnessmap_fragment:b1,metalnessmap_pars_fragment:w1,morphinstance_vertex:R1,morphcolor_vertex:C1,morphnormal_vertex:P1,morphtarget_pars_vertex:L1,morphtarget_vertex:D1,normal_fragment_begin:I1,normal_fragment_maps:U1,normal_pars_fragment:N1,normal_pars_vertex:F1,normal_vertex:O1,normalmap_pars_fragment:B1,clearcoat_normal_fragment_begin:k1,clearcoat_normal_fragment_maps:z1,clearcoat_pars_fragment:V1,iridescence_pars_fragment:G1,opaque_fragment:H1,packing:W1,premultiplied_alpha_fragment:X1,project_vertex:q1,dithering_fragment:Y1,dithering_pars_fragment:j1,roughnessmap_fragment:K1,roughnessmap_pars_fragment:$1,shadowmap_pars_fragment:Z1,shadowmap_pars_vertex:J1,shadowmap_vertex:Q1,shadowmask_pars_fragment:t2,skinbase_vertex:e2,skinning_pars_vertex:n2,skinning_vertex:i2,skinnormal_vertex:r2,specularmap_fragment:s2,specularmap_pars_fragment:o2,tonemapping_fragment:a2,tonemapping_pars_fragment:c2,transmission_fragment:l2,transmission_pars_fragment:h2,uv_pars_fragment:u2,uv_pars_vertex:f2,uv_vertex:d2,worldpos_vertex:p2,background_vert:m2,background_frag:g2,backgroundCube_vert:_2,backgroundCube_frag:v2,cube_vert:x2,cube_frag:M2,depth_vert:y2,depth_frag:S2,distanceRGBA_vert:E2,distanceRGBA_frag:T2,equirect_vert:A2,equirect_frag:b2,linedashed_vert:w2,linedashed_frag:R2,meshbasic_vert:C2,meshbasic_frag:P2,meshlambert_vert:L2,meshlambert_frag:D2,meshmatcap_vert:I2,meshmatcap_frag:U2,meshnormal_vert:N2,meshnormal_frag:F2,meshphong_vert:O2,meshphong_frag:B2,meshphysical_vert:k2,meshphysical_frag:z2,meshtoon_vert:V2,meshtoon_frag:G2,points_vert:H2,points_frag:W2,shadow_vert:X2,shadow_frag:q2,sprite_vert:Y2,sprite_frag:j2},nt={common:{diffuse:{value:new oe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Bt}},envmap:{envMap:{value:null},envMapRotation:{value:new Bt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Bt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Bt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Bt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Bt},normalScale:{value:new ee(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Bt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Bt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Bt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Bt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new oe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new oe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0},uvTransform:{value:new Bt}},sprite:{diffuse:{value:new oe(16777215)},opacity:{value:1},center:{value:new ee(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}}},li={basic:{uniforms:an([nt.common,nt.specularmap,nt.envmap,nt.aomap,nt.lightmap,nt.fog]),vertexShader:zt.meshbasic_vert,fragmentShader:zt.meshbasic_frag},lambert:{uniforms:an([nt.common,nt.specularmap,nt.envmap,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.fog,nt.lights,{emissive:{value:new oe(0)}}]),vertexShader:zt.meshlambert_vert,fragmentShader:zt.meshlambert_frag},phong:{uniforms:an([nt.common,nt.specularmap,nt.envmap,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.fog,nt.lights,{emissive:{value:new oe(0)},specular:{value:new oe(1118481)},shininess:{value:30}}]),vertexShader:zt.meshphong_vert,fragmentShader:zt.meshphong_frag},standard:{uniforms:an([nt.common,nt.envmap,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.roughnessmap,nt.metalnessmap,nt.fog,nt.lights,{emissive:{value:new oe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:zt.meshphysical_vert,fragmentShader:zt.meshphysical_frag},toon:{uniforms:an([nt.common,nt.aomap,nt.lightmap,nt.emissivemap,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.gradientmap,nt.fog,nt.lights,{emissive:{value:new oe(0)}}]),vertexShader:zt.meshtoon_vert,fragmentShader:zt.meshtoon_frag},matcap:{uniforms:an([nt.common,nt.bumpmap,nt.normalmap,nt.displacementmap,nt.fog,{matcap:{value:null}}]),vertexShader:zt.meshmatcap_vert,fragmentShader:zt.meshmatcap_frag},points:{uniforms:an([nt.points,nt.fog]),vertexShader:zt.points_vert,fragmentShader:zt.points_frag},dashed:{uniforms:an([nt.common,nt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:zt.linedashed_vert,fragmentShader:zt.linedashed_frag},depth:{uniforms:an([nt.common,nt.displacementmap]),vertexShader:zt.depth_vert,fragmentShader:zt.depth_frag},normal:{uniforms:an([nt.common,nt.bumpmap,nt.normalmap,nt.displacementmap,{opacity:{value:1}}]),vertexShader:zt.meshnormal_vert,fragmentShader:zt.meshnormal_frag},sprite:{uniforms:an([nt.sprite,nt.fog]),vertexShader:zt.sprite_vert,fragmentShader:zt.sprite_frag},background:{uniforms:{uvTransform:{value:new Bt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:zt.background_vert,fragmentShader:zt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Bt}},vertexShader:zt.backgroundCube_vert,fragmentShader:zt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:zt.cube_vert,fragmentShader:zt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:zt.equirect_vert,fragmentShader:zt.equirect_frag},distanceRGBA:{uniforms:an([nt.common,nt.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:zt.distanceRGBA_vert,fragmentShader:zt.distanceRGBA_frag},shadow:{uniforms:an([nt.lights,nt.fog,{color:{value:new oe(0)},opacity:{value:1}}]),vertexShader:zt.shadow_vert,fragmentShader:zt.shadow_frag}};li.physical={uniforms:an([li.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Bt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Bt},clearcoatNormalScale:{value:new ee(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Bt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Bt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Bt},sheen:{value:0},sheenColor:{value:new oe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Bt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Bt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Bt},transmissionSamplerSize:{value:new ee},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Bt},attenuationDistance:{value:0},attenuationColor:{value:new oe(0)},specularColor:{value:new oe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Bt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Bt},anisotropyVector:{value:new ee},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Bt}}]),vertexShader:zt.meshphysical_vert,fragmentShader:zt.meshphysical_frag};const ea={r:0,b:0,g:0},Mr=new pi,K2=new De;function $2(e,t,n,i,r,s,o){const a=new oe(0);let c=s===!0?0:1,l,h,u=null,f=0,p=null;function g(A){let T=A.isScene===!0?A.background:null;return T&&T.isTexture&&(T=(A.backgroundBlurriness>0?n:t).get(T)),T}function v(A){let T=!1;const S=g(A);S===null?d(a,c):S&&S.isColor&&(d(S,1),T=!0);const N=e.xr.getEnvironmentBlendMode();N==="additive"?i.buffers.color.setClear(0,0,0,1,o):N==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(e.autoClear||T)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function m(A,T){const S=g(T);S&&(S.isCubeTexture||S.mapping===Xa)?(h===void 0&&(h=new Ui(new Ao(1,1,1),new zi({name:"BackgroundCubeMaterial",uniforms:Ms(li.backgroundCube.uniforms),vertexShader:li.backgroundCube.vertexShader,fragmentShader:li.backgroundCube.fragmentShader,side:pn,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(N,R,b){this.matrixWorld.copyPosition(b.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),Mr.copy(T.backgroundRotation),Mr.x*=-1,Mr.y*=-1,Mr.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(Mr.y*=-1,Mr.z*=-1),h.material.uniforms.envMap.value=S,h.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(K2.makeRotationFromEuler(Mr)),h.material.toneMapped=$t.getTransfer(S.colorSpace)!==ae,(u!==S||f!==S.version||p!==e.toneMapping)&&(h.material.needsUpdate=!0,u=S,f=S.version,p=e.toneMapping),h.layers.enableAll(),A.unshift(h,h.geometry,h.material,0,0,null)):S&&S.isTexture&&(l===void 0&&(l=new Ui(new Ya(2,2),new zi({name:"BackgroundMaterial",uniforms:Ms(li.background.uniforms),vertexShader:li.background.vertexShader,fragmentShader:li.background.fragmentShader,side:ar,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(l)),l.material.uniforms.t2D.value=S,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.toneMapped=$t.getTransfer(S.colorSpace)!==ae,S.matrixAutoUpdate===!0&&S.updateMatrix(),l.material.uniforms.uvTransform.value.copy(S.matrix),(u!==S||f!==S.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,u=S,f=S.version,p=e.toneMapping),l.layers.enableAll(),A.unshift(l,l.geometry,l.material,0,0,null))}function d(A,T){A.getRGB(ea,Pp(e)),i.buffers.color.setClear(ea.r,ea.g,ea.b,T,o)}return{getClearColor:function(){return a},setClearColor:function(A,T=1){a.set(A),c=T,d(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(A){c=A,d(a,c)},render:v,addToRenderList:m}}function Z2(e,t){const n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},r=f(null);let s=r,o=!1;function a(x,w,G,k,j){let K=!1;const H=u(k,G,w);s!==H&&(s=H,l(s.object)),K=p(x,k,G,j),K&&g(x,k,G,j),j!==null&&t.update(j,e.ELEMENT_ARRAY_BUFFER),(K||o)&&(o=!1,S(x,w,G,k),j!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(j).buffer))}function c(){return e.createVertexArray()}function l(x){return e.bindVertexArray(x)}function h(x){return e.deleteVertexArray(x)}function u(x,w,G){const k=G.wireframe===!0;let j=i[x.id];j===void 0&&(j={},i[x.id]=j);let K=j[w.id];K===void 0&&(K={},j[w.id]=K);let H=K[k];return H===void 0&&(H=f(c()),K[k]=H),H}function f(x){const w=[],G=[],k=[];for(let j=0;j<n;j++)w[j]=0,G[j]=0,k[j]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:w,enabledAttributes:G,attributeDivisors:k,object:x,attributes:{},index:null}}function p(x,w,G,k){const j=s.attributes,K=w.attributes;let H=0;const $=G.getAttributes();for(const z in $)if($[z].location>=0){const ht=j[z];let Et=K[z];if(Et===void 0&&(z==="instanceMatrix"&&x.instanceMatrix&&(Et=x.instanceMatrix),z==="instanceColor"&&x.instanceColor&&(Et=x.instanceColor)),ht===void 0||ht.attribute!==Et||Et&&ht.data!==Et.data)return!0;H++}return s.attributesNum!==H||s.index!==k}function g(x,w,G,k){const j={},K=w.attributes;let H=0;const $=G.getAttributes();for(const z in $)if($[z].location>=0){let ht=K[z];ht===void 0&&(z==="instanceMatrix"&&x.instanceMatrix&&(ht=x.instanceMatrix),z==="instanceColor"&&x.instanceColor&&(ht=x.instanceColor));const Et={};Et.attribute=ht,ht&&ht.data&&(Et.data=ht.data),j[z]=Et,H++}s.attributes=j,s.attributesNum=H,s.index=k}function v(){const x=s.newAttributes;for(let w=0,G=x.length;w<G;w++)x[w]=0}function m(x){d(x,0)}function d(x,w){const G=s.newAttributes,k=s.enabledAttributes,j=s.attributeDivisors;G[x]=1,k[x]===0&&(e.enableVertexAttribArray(x),k[x]=1),j[x]!==w&&(e.vertexAttribDivisor(x,w),j[x]=w)}function A(){const x=s.newAttributes,w=s.enabledAttributes;for(let G=0,k=w.length;G<k;G++)w[G]!==x[G]&&(e.disableVertexAttribArray(G),w[G]=0)}function T(x,w,G,k,j,K,H){H===!0?e.vertexAttribIPointer(x,w,G,j,K):e.vertexAttribPointer(x,w,G,k,j,K)}function S(x,w,G,k){v();const j=k.attributes,K=G.getAttributes(),H=w.defaultAttributeValues;for(const $ in K){const z=K[$];if(z.location>=0){let it=j[$];if(it===void 0&&($==="instanceMatrix"&&x.instanceMatrix&&(it=x.instanceMatrix),$==="instanceColor"&&x.instanceColor&&(it=x.instanceColor)),it!==void 0){const ht=it.normalized,Et=it.itemSize,Vt=t.get(it);if(Vt===void 0)continue;const le=Vt.buffer,X=Vt.type,et=Vt.bytesPerElement,yt=X===e.INT||X===e.UNSIGNED_INT||it.gpuType===Ih;if(it.isInterleavedBufferAttribute){const st=it.data,Lt=st.stride,Nt=it.offset;if(st.isInstancedInterleavedBuffer){for(let Gt=0;Gt<z.locationSize;Gt++)d(z.location+Gt,st.meshPerAttribute);x.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=st.meshPerAttribute*st.count)}else for(let Gt=0;Gt<z.locationSize;Gt++)m(z.location+Gt);e.bindBuffer(e.ARRAY_BUFFER,le);for(let Gt=0;Gt<z.locationSize;Gt++)T(z.location+Gt,Et/z.locationSize,X,ht,Lt*et,(Nt+Et/z.locationSize*Gt)*et,yt)}else{if(it.isInstancedBufferAttribute){for(let st=0;st<z.locationSize;st++)d(z.location+st,it.meshPerAttribute);x.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=it.meshPerAttribute*it.count)}else for(let st=0;st<z.locationSize;st++)m(z.location+st);e.bindBuffer(e.ARRAY_BUFFER,le);for(let st=0;st<z.locationSize;st++)T(z.location+st,Et/z.locationSize,X,ht,Et*et,Et/z.locationSize*st*et,yt)}}else if(H!==void 0){const ht=H[$];if(ht!==void 0)switch(ht.length){case 2:e.vertexAttrib2fv(z.location,ht);break;case 3:e.vertexAttrib3fv(z.location,ht);break;case 4:e.vertexAttrib4fv(z.location,ht);break;default:e.vertexAttrib1fv(z.location,ht)}}}}A()}function N(){D();for(const x in i){const w=i[x];for(const G in w){const k=w[G];for(const j in k)h(k[j].object),delete k[j];delete w[G]}delete i[x]}}function R(x){if(i[x.id]===void 0)return;const w=i[x.id];for(const G in w){const k=w[G];for(const j in k)h(k[j].object),delete k[j];delete w[G]}delete i[x.id]}function b(x){for(const w in i){const G=i[w];if(G[x.id]===void 0)continue;const k=G[x.id];for(const j in k)h(k[j].object),delete k[j];delete G[x.id]}}function D(){y(),o=!0,s!==r&&(s=r,l(s.object))}function y(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:D,resetDefaultState:y,dispose:N,releaseStatesOfGeometry:R,releaseStatesOfProgram:b,initAttributes:v,enableAttribute:m,disableUnusedAttributes:A}}function J2(e,t,n){let i;function r(l){i=l}function s(l,h){e.drawArrays(i,l,h),n.update(h,i,1)}function o(l,h,u){u!==0&&(e.drawArraysInstanced(i,l,h,u),n.update(h,i,u))}function a(l,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,h,0,u);let p=0;for(let g=0;g<u;g++)p+=h[g];n.update(p,i,1)}function c(l,h,u,f){if(u===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<l.length;g++)o(l[g],h[g],f[g]);else{p.multiDrawArraysInstancedWEBGL(i,l,0,h,0,f,0,u);let g=0;for(let v=0;v<u;v++)g+=h[v]*f[v];n.update(g,i,1)}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function Q2(e,t,n,i){let r;function s(){if(r!==void 0)return r;if(t.has("EXT_texture_filter_anisotropic")===!0){const b=t.get("EXT_texture_filter_anisotropic");r=e.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(b){return!(b!==Zn&&i.convert(b)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(b){const D=b===Mo&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(b!==ki&&i.convert(b)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&b!==Di&&!D)}function c(b){if(b==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=n.precision!==void 0?n.precision:"highp";const h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const u=n.logarithmicDepthBuffer===!0,f=n.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),g=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=e.getParameter(e.MAX_TEXTURE_SIZE),m=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),d=e.getParameter(e.MAX_VERTEX_ATTRIBS),A=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),T=e.getParameter(e.MAX_VARYING_VECTORS),S=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),N=g>0,R=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:p,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:A,maxVaryings:T,maxFragmentUniforms:S,vertexTextures:N,maxSamples:R}}function tv(e){const t=this;let n=null,i=0,r=!1,s=!1;const o=new Tr,a=new Bt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const p=u.length!==0||f||i!==0||r;return r=f,i=u.length,p},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,f){n=h(u,f,0)},this.setState=function(u,f,p){const g=u.clippingPlanes,v=u.clipIntersection,m=u.clipShadows,d=e.get(u);if(!r||g===null||g.length===0||s&&!m)s?h(null):l();else{const A=s?0:i,T=A*4;let S=d.clippingState||null;c.value=S,S=h(g,f,T,p);for(let N=0;N!==T;++N)S[N]=n[N];d.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=A}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(u,f,p,g){const v=u!==null?u.length:0;let m=null;if(v!==0){if(m=c.value,g!==!0||m===null){const d=p+v*4,A=f.matrixWorldInverse;a.getNormalMatrix(A),(m===null||m.length<d)&&(m=new Float32Array(d));for(let T=0,S=p;T!==v;++T,S+=4)o.copy(u[T]).applyMatrix4(A,a),o.normal.toArray(m,S),m[S+3]=o.constant}c.value=m,c.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}function ev(e){let t=new WeakMap;function n(o,a){return a===bl?o.mapping=gs:a===wl&&(o.mapping=_s),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===bl||a===wl)if(t.has(o)){const c=t.get(o).texture;return n(c,o.mapping)}else{const c=o.image;if(c&&c.height>0){const l=new f_(c.height);return l.fromEquirectangularTexture(e,o),t.set(o,l),o.addEventListener("dispose",r),n(l.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const c=t.get(a);c!==void 0&&(t.delete(a),c.dispose())}function s(){t=new WeakMap}return{get:i,dispose:s}}class nv extends Lp{constructor(t=-1,n=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=n,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,n,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-t,o=i+t,a=r+n,c=r-n;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,o=s+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const n=super.toJSON(t);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}const cs=4,wf=[.125,.215,.35,.446,.526,.582],Rr=20,Gc=new nv,Rf=new oe;let Hc=null,Wc=0,Xc=0,qc=!1;const Ar=(1+Math.sqrt(5))/2,ns=1/Ar,Cf=[new U(-Ar,ns,0),new U(Ar,ns,0),new U(-ns,0,Ar),new U(ns,0,Ar),new U(0,Ar,-ns),new U(0,Ar,ns),new U(-1,1,-1),new U(1,1,-1),new U(-1,1,1),new U(1,1,1)];class Pf{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,n=0,i=.1,r=100){Hc=this._renderer.getRenderTarget(),Wc=this._renderer.getActiveCubeFace(),Xc=this._renderer.getActiveMipmapLevel(),qc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(t,i,r,s),n>0&&this._blur(s,0,0,n),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(t,n=null){return this._fromTexture(t,n)}fromCubemap(t,n=null){return this._fromTexture(t,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=If(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Df(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Hc,Wc,Xc),this._renderer.xr.enabled=qc,t.scissorTest=!1,na(t,0,0,t.width,t.height)}_fromTexture(t,n){t.mapping===gs||t.mapping===_s?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Hc=this._renderer.getRenderTarget(),Wc=this._renderer.getActiveCubeFace(),Xc=this._renderer.getActiveMipmapLevel(),qc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=n||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:di,minFilter:di,generateMipmaps:!1,type:Mo,format:Zn,colorSpace:Ls,depthBuffer:!1},r=Lf(t,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Lf(t,n,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=iv(s)),this._blurMaterial=rv(s,t,n)}return r}_compileMaterial(t){const n=new Ui(this._lodPlanes[0],t);this._renderer.compile(n,Gc)}_sceneToCubeUV(t,n,i,r){const a=new Bn(90,1,n,i),c=[1,-1,1,1,1,1],l=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(Rf),h.toneMapping=sr,h.autoClear=!1;const p=new wp({name:"PMREM.Background",side:pn,depthWrite:!1,depthTest:!1}),g=new Ui(new Ao,p);let v=!1;const m=t.background;m?m.isColor&&(p.color.copy(m),t.background=null,v=!0):(p.color.copy(Rf),v=!0);for(let d=0;d<6;d++){const A=d%3;A===0?(a.up.set(0,c[d],0),a.lookAt(l[d],0,0)):A===1?(a.up.set(0,0,c[d]),a.lookAt(0,l[d],0)):(a.up.set(0,c[d],0),a.lookAt(0,0,l[d]));const T=this._cubeSize;na(r,A*T,d>2?T:0,T,T),h.setRenderTarget(r),v&&h.render(g,a),h.render(t,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=u,t.background=m}_textureToCubeUV(t,n){const i=this._renderer,r=t.mapping===gs||t.mapping===_s;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=If()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Df());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new Ui(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=t;const c=this._cubeSize;na(n,0,0,3*c,2*c),i.setRenderTarget(n),i.render(o,Gc)}_applyPMREM(t){const n=this._renderer,i=n.autoClear;n.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=Cf[(r-s-1)%Cf.length];this._blur(t,s-1,s,o,a)}n.autoClear=i}_blur(t,n,i,r,s){const o=this._pingPongRenderTarget;this._halfBlur(t,o,n,i,r,"latitudinal",s),this._halfBlur(o,t,i,i,r,"longitudinal",s)}_halfBlur(t,n,i,r,s,o,a){const c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Ui(this._lodPlanes[r],l),f=l.uniforms,p=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*Rr-1),v=s/g,m=isFinite(s)?1+Math.floor(h*v):Rr;m>Rr&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Rr}`);const d=[];let A=0;for(let b=0;b<Rr;++b){const D=b/v,y=Math.exp(-D*D/2);d.push(y),b===0?A+=y:b<m&&(A+=2*y)}for(let b=0;b<d.length;b++)d[b]=d[b]/A;f.envMap.value=t.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);const{_lodMax:T}=this;f.dTheta.value=g,f.mipInt.value=T-i;const S=this._sizeLods[r],N=3*S*(r>T-cs?r-T+cs:0),R=4*(this._cubeSize-S);na(n,N,R,3*S,2*S),c.setRenderTarget(n),c.render(u,Gc)}}function iv(e){const t=[],n=[],i=[];let r=e;const s=e-cs+1+wf.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);n.push(a);let c=1/a;o>e-cs?c=wf[o-e+cs-1]:o===0&&(c=0),i.push(c);const l=1/(a-2),h=-l,u=1+l,f=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,v=3,m=2,d=1,A=new Float32Array(v*g*p),T=new Float32Array(m*g*p),S=new Float32Array(d*g*p);for(let R=0;R<p;R++){const b=R%3*2/3-1,D=R>2?0:-1,y=[b,D,0,b+2/3,D,0,b+2/3,D+1,0,b,D,0,b+2/3,D+1,0,b,D+1,0];A.set(y,v*g*R),T.set(f,m*g*R);const x=[R,R,R,R,R,R];S.set(x,d*g*R)}const N=new Hi;N.setAttribute("position",new rn(A,v)),N.setAttribute("uv",new rn(T,m)),N.setAttribute("faceIndex",new rn(S,d)),t.push(N),r>cs&&r--}return{lodPlanes:t,sizeLods:n,sigmas:i}}function Lf(e,t,n){const i=new kr(e,t,n);return i.texture.mapping=Xa,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function na(e,t,n,i,r){e.viewport.set(t,n,i,r),e.scissor.set(t,n,i,r)}function rv(e,t,n){const i=new Float32Array(Rr),r=new U(0,1,0);return new zi({name:"SphericalGaussianBlur",defines:{n:Rr,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:rr,depthTest:!1,depthWrite:!1})}function Df(){return new zi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:rr,depthTest:!1,depthWrite:!1})}function If(){return new zi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:rr,depthTest:!1,depthWrite:!1})}function kh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function sv(e){let t=new WeakMap,n=null;function i(a){if(a&&a.isTexture){const c=a.mapping,l=c===bl||c===wl,h=c===gs||c===_s;if(l||h){let u=t.get(a);const f=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return n===null&&(n=new Pf(e)),u=l?n.fromEquirectangular(a,u):n.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),u.texture;if(u!==void 0)return u.texture;{const p=a.image;return l&&p&&p.height>0||h&&p&&r(p)?(n===null&&(n=new Pf(e)),u=l?n.fromEquirectangular(a):n.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),a.addEventListener("dispose",s),u.texture):null}}}return a}function r(a){let c=0;const l=6;for(let h=0;h<l;h++)a[h]!==void 0&&c++;return c===l}function s(a){const c=a.target;c.removeEventListener("dispose",s);const l=t.get(c);l!==void 0&&(t.delete(c),l.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:o}}function ov(e){const t={};function n(i){if(t[i]!==void 0)return t[i];let r;switch(i){case"WEBGL_depth_texture":r=e.getExtension("WEBGL_depth_texture")||e.getExtension("MOZ_WEBGL_depth_texture")||e.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=e.getExtension("EXT_texture_filter_anisotropic")||e.getExtension("MOZ_EXT_texture_filter_anisotropic")||e.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=e.getExtension("WEBGL_compressed_texture_s3tc")||e.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=e.getExtension("WEBGL_compressed_texture_pvrtc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=e.getExtension(i)}return t[i]=r,r}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const r=n(i);return r===null&&Qs("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function av(e,t,n,i){const r={},s=new WeakMap;function o(u){const f=u.target;f.index!==null&&t.remove(f.index);for(const g in f.attributes)t.remove(f.attributes[g]);for(const g in f.morphAttributes){const v=f.morphAttributes[g];for(let m=0,d=v.length;m<d;m++)t.remove(v[m])}f.removeEventListener("dispose",o),delete r[f.id];const p=s.get(f);p&&(t.remove(p),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,n.memory.geometries--}function a(u,f){return r[f.id]===!0||(f.addEventListener("dispose",o),r[f.id]=!0,n.memory.geometries++),f}function c(u){const f=u.attributes;for(const g in f)t.update(f[g],e.ARRAY_BUFFER);const p=u.morphAttributes;for(const g in p){const v=p[g];for(let m=0,d=v.length;m<d;m++)t.update(v[m],e.ARRAY_BUFFER)}}function l(u){const f=[],p=u.index,g=u.attributes.position;let v=0;if(p!==null){const A=p.array;v=p.version;for(let T=0,S=A.length;T<S;T+=3){const N=A[T+0],R=A[T+1],b=A[T+2];f.push(N,R,R,b,b,N)}}else if(g!==void 0){const A=g.array;v=g.version;for(let T=0,S=A.length/3-1;T<S;T+=3){const N=T+0,R=T+1,b=T+2;f.push(N,R,R,b,b,N)}}else return;const m=new(yp(f)?Cp:Rp)(f,1);m.version=v;const d=s.get(u);d&&t.remove(d),s.set(u,m)}function h(u){const f=s.get(u);if(f){const p=u.index;p!==null&&f.version<p.version&&l(u)}else l(u);return s.get(u)}return{get:a,update:c,getWireframeAttribute:h}}function cv(e,t,n){let i;function r(f){i=f}let s,o;function a(f){s=f.type,o=f.bytesPerElement}function c(f,p){e.drawElements(i,p,s,f*o),n.update(p,i,1)}function l(f,p,g){g!==0&&(e.drawElementsInstanced(i,p,s,f*o,g),n.update(p,i,g))}function h(f,p,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,s,f,0,g);let m=0;for(let d=0;d<g;d++)m+=p[d];n.update(m,i,1)}function u(f,p,g,v){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)l(f[d]/o,p[d],v[d]);else{m.multiDrawElementsInstancedWEBGL(i,p,0,s,f,0,v,0,g);let d=0;for(let A=0;A<g;A++)d+=p[A]*v[A];n.update(d,i,1)}}this.setMode=r,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function lv(e){const t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(n.calls++,o){case e.TRIANGLES:n.triangles+=a*(s/3);break;case e.LINES:n.lines+=a*(s/2);break;case e.LINE_STRIP:n.lines+=a*(s-1);break;case e.LINE_LOOP:n.lines+=a*s;break;case e.POINTS:n.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:r,update:i}}function hv(e,t,n){const i=new WeakMap,r=new Oe;function s(o,a,c){const l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let f=i.get(a);if(f===void 0||f.count!==u){let x=function(){D.dispose(),i.delete(a),a.removeEventListener("dispose",x)};var p=x;f!==void 0&&f.texture.dispose();const g=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,d=a.morphAttributes.position||[],A=a.morphAttributes.normal||[],T=a.morphAttributes.color||[];let S=0;g===!0&&(S=1),v===!0&&(S=2),m===!0&&(S=3);let N=a.attributes.position.count*S,R=1;N>t.maxTextureSize&&(R=Math.ceil(N/t.maxTextureSize),N=t.maxTextureSize);const b=new Float32Array(N*R*4*u),D=new Ep(b,N,R,u);D.type=Di,D.needsUpdate=!0;const y=S*4;for(let w=0;w<u;w++){const G=d[w],k=A[w],j=T[w],K=N*R*4*w;for(let H=0;H<G.count;H++){const $=H*y;g===!0&&(r.fromBufferAttribute(G,H),b[K+$+0]=r.x,b[K+$+1]=r.y,b[K+$+2]=r.z,b[K+$+3]=0),v===!0&&(r.fromBufferAttribute(k,H),b[K+$+4]=r.x,b[K+$+5]=r.y,b[K+$+6]=r.z,b[K+$+7]=0),m===!0&&(r.fromBufferAttribute(j,H),b[K+$+8]=r.x,b[K+$+9]=r.y,b[K+$+10]=r.z,b[K+$+11]=j.itemSize===4?r.w:1)}}f={count:u,texture:D,size:new ee(N,R)},i.set(a,f),a.addEventListener("dispose",x)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(e,"morphTexture",o.morphTexture,n);else{let g=0;for(let m=0;m<l.length;m++)g+=l[m];const v=a.morphTargetsRelative?1:1-g;c.getUniforms().setValue(e,"morphTargetBaseInfluence",v),c.getUniforms().setValue(e,"morphTargetInfluences",l)}c.getUniforms().setValue(e,"morphTargetsTexture",f.texture,n),c.getUniforms().setValue(e,"morphTargetsTextureSize",f.size)}return{update:s}}function uv(e,t,n,i){let r=new WeakMap;function s(c){const l=i.render.frame,h=c.geometry,u=t.get(c,h);if(r.get(u)!==l&&(t.update(u),r.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),r.get(c)!==l&&(n.update(c.instanceMatrix,e.ARRAY_BUFFER),c.instanceColor!==null&&n.update(c.instanceColor,e.ARRAY_BUFFER),r.set(c,l))),c.isSkinnedMesh){const f=c.skeleton;r.get(f)!==l&&(f.update(),r.set(f,l))}return u}function o(){r=new WeakMap}function a(c){const l=c.target;l.removeEventListener("dispose",a),n.remove(l.instanceMatrix),l.instanceColor!==null&&n.remove(l.instanceColor)}return{update:s,dispose:o}}class Np extends mn{constructor(t,n,i,r,s,o,a,c,l,h=us){if(h!==us&&h!==xs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===us&&(i=Br),i===void 0&&h===xs&&(i=vs),super(null,r,s,o,a,c,h,i,l),this.isDepthTexture=!0,this.image={width:t,height:n},this.magFilter=a!==void 0?a:Qn,this.minFilter=c!==void 0?c:Qn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const n=super.toJSON(t);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}const Fp=new mn,Uf=new Np(1,1),Op=new Ep,Bp=new $g,kp=new Dp,Nf=[],Ff=[],Of=new Float32Array(16),Bf=new Float32Array(9),kf=new Float32Array(4);function Us(e,t,n){const i=e[0];if(i<=0||i>0)return e;const r=t*n;let s=Nf[r];if(s===void 0&&(s=new Float32Array(r),Nf[r]=s),t!==0){i.toArray(s,0);for(let o=1,a=0;o!==t;++o)a+=n,e[o].toArray(s,a)}return s}function Xe(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function qe(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function ja(e,t){let n=Ff[t];n===void 0&&(n=new Int32Array(t),Ff[t]=n);for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function fv(e,t){const n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function dv(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xe(n,t))return;e.uniform2fv(this.addr,t),qe(n,t)}}function pv(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Xe(n,t))return;e.uniform3fv(this.addr,t),qe(n,t)}}function mv(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xe(n,t))return;e.uniform4fv(this.addr,t),qe(n,t)}}function gv(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(Xe(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),qe(n,t)}else{if(Xe(n,i))return;kf.set(i),e.uniformMatrix2fv(this.addr,!1,kf),qe(n,i)}}function _v(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(Xe(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),qe(n,t)}else{if(Xe(n,i))return;Bf.set(i),e.uniformMatrix3fv(this.addr,!1,Bf),qe(n,i)}}function vv(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(Xe(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),qe(n,t)}else{if(Xe(n,i))return;Of.set(i),e.uniformMatrix4fv(this.addr,!1,Of),qe(n,i)}}function xv(e,t){const n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Mv(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xe(n,t))return;e.uniform2iv(this.addr,t),qe(n,t)}}function yv(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Xe(n,t))return;e.uniform3iv(this.addr,t),qe(n,t)}}function Sv(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xe(n,t))return;e.uniform4iv(this.addr,t),qe(n,t)}}function Ev(e,t){const n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Tv(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Xe(n,t))return;e.uniform2uiv(this.addr,t),qe(n,t)}}function Av(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Xe(n,t))return;e.uniform3uiv(this.addr,t),qe(n,t)}}function bv(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Xe(n,t))return;e.uniform4uiv(this.addr,t),qe(n,t)}}function wv(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r);let s;this.type===e.SAMPLER_2D_SHADOW?(Uf.compareFunction=Mp,s=Uf):s=Fp,n.setTexture2D(t||s,r)}function Rv(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(t||Bp,r)}function Cv(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(t||kp,r)}function Pv(e,t,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(e.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(t||Op,r)}function Lv(e){switch(e){case 5126:return fv;case 35664:return dv;case 35665:return pv;case 35666:return mv;case 35674:return gv;case 35675:return _v;case 35676:return vv;case 5124:case 35670:return xv;case 35667:case 35671:return Mv;case 35668:case 35672:return yv;case 35669:case 35673:return Sv;case 5125:return Ev;case 36294:return Tv;case 36295:return Av;case 36296:return bv;case 35678:case 36198:case 36298:case 36306:case 35682:return wv;case 35679:case 36299:case 36307:return Rv;case 35680:case 36300:case 36308:case 36293:return Cv;case 36289:case 36303:case 36311:case 36292:return Pv}}function Dv(e,t){e.uniform1fv(this.addr,t)}function Iv(e,t){const n=Us(t,this.size,2);e.uniform2fv(this.addr,n)}function Uv(e,t){const n=Us(t,this.size,3);e.uniform3fv(this.addr,n)}function Nv(e,t){const n=Us(t,this.size,4);e.uniform4fv(this.addr,n)}function Fv(e,t){const n=Us(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Ov(e,t){const n=Us(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Bv(e,t){const n=Us(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function kv(e,t){e.uniform1iv(this.addr,t)}function zv(e,t){e.uniform2iv(this.addr,t)}function Vv(e,t){e.uniform3iv(this.addr,t)}function Gv(e,t){e.uniform4iv(this.addr,t)}function Hv(e,t){e.uniform1uiv(this.addr,t)}function Wv(e,t){e.uniform2uiv(this.addr,t)}function Xv(e,t){e.uniform3uiv(this.addr,t)}function qv(e,t){e.uniform4uiv(this.addr,t)}function Yv(e,t,n){const i=this.cache,r=t.length,s=ja(n,r);Xe(i,s)||(e.uniform1iv(this.addr,s),qe(i,s));for(let o=0;o!==r;++o)n.setTexture2D(t[o]||Fp,s[o])}function jv(e,t,n){const i=this.cache,r=t.length,s=ja(n,r);Xe(i,s)||(e.uniform1iv(this.addr,s),qe(i,s));for(let o=0;o!==r;++o)n.setTexture3D(t[o]||Bp,s[o])}function Kv(e,t,n){const i=this.cache,r=t.length,s=ja(n,r);Xe(i,s)||(e.uniform1iv(this.addr,s),qe(i,s));for(let o=0;o!==r;++o)n.setTextureCube(t[o]||kp,s[o])}function $v(e,t,n){const i=this.cache,r=t.length,s=ja(n,r);Xe(i,s)||(e.uniform1iv(this.addr,s),qe(i,s));for(let o=0;o!==r;++o)n.setTexture2DArray(t[o]||Op,s[o])}function Zv(e){switch(e){case 5126:return Dv;case 35664:return Iv;case 35665:return Uv;case 35666:return Nv;case 35674:return Fv;case 35675:return Ov;case 35676:return Bv;case 5124:case 35670:return kv;case 35667:case 35671:return zv;case 35668:case 35672:return Vv;case 35669:case 35673:return Gv;case 5125:return Hv;case 36294:return Wv;case 36295:return Xv;case 36296:return qv;case 35678:case 36198:case 36298:case 36306:case 35682:return Yv;case 35679:case 36299:case 36307:return jv;case 35680:case 36300:case 36308:case 36293:return Kv;case 36289:case 36303:case 36311:case 36292:return $v}}class Jv{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.setValue=Lv(n.type)}}class Qv{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=Zv(n.type)}}class tx{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,n,i){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(t,n[a.id],i)}}}const Yc=/(\w+)(\])?(\[|\.)?/g;function zf(e,t){e.seq.push(t),e.map[t.id]=t}function ex(e,t,n){const i=e.name,r=i.length;for(Yc.lastIndex=0;;){const s=Yc.exec(i),o=Yc.lastIndex;let a=s[1];const c=s[2]==="]",l=s[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===r){zf(n,l===void 0?new Jv(a,e,t):new Qv(a,e,t));break}else{let u=n.map[a];u===void 0&&(u=new tx(a),zf(n,u)),n=u}}}class Ma{constructor(t,n){this.seq=[],this.map={};const i=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=t.getActiveUniform(n,r),o=t.getUniformLocation(n,s.name);ex(s,o,this)}}setValue(t,n,i,r){const s=this.map[n];s!==void 0&&s.setValue(t,i,r)}setOptional(t,n,i){const r=n[i];r!==void 0&&this.setValue(t,i,r)}static upload(t,n,i,r){for(let s=0,o=n.length;s!==o;++s){const a=n[s],c=i[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,r)}}static seqWithValue(t,n){const i=[];for(let r=0,s=t.length;r!==s;++r){const o=t[r];o.id in n&&i.push(o)}return i}}function Vf(e,t,n){const i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}const nx=37297;let ix=0;function rx(e,t){const n=e.split(`
`),i=[],r=Math.max(t-6,0),s=Math.min(t+6,n.length);for(let o=r;o<s;o++){const a=o+1;i.push(`${a===t?">":" "} ${a}: ${n[o]}`)}return i.join(`
`)}const Gf=new Bt;function sx(e){$t._getMatrix(Gf,$t.workingColorSpace,e);const t=`mat3( ${Gf.elements.map(n=>n.toFixed(4))} )`;switch($t.getTransfer(e)){case qa:return[t,"LinearTransferOETF"];case ae:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function Hf(e,t,n){const i=e.getShaderParameter(t,e.COMPILE_STATUS),r=e.getShaderInfoLog(t).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+rx(e.getShaderSource(t),o)}else return r}function ox(e,t){const n=sx(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}function ax(e,t){let n;switch(t){case Sg:n="Linear";break;case Eg:n="Reinhard";break;case Tg:n="Cineon";break;case Ag:n="ACESFilmic";break;case wg:n="AgX";break;case Rg:n="Neutral";break;case bg:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),n="Linear"}return"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const ia=new U;function cx(){$t.getLuminanceCoefficients(ia);const e=ia.x.toFixed(4),t=ia.y.toFixed(4),n=ia.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function lx(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(to).join(`
`)}function hx(e){const t=[];for(const n in e){const i=e[n];i!==!1&&t.push("#define "+n+" "+i)}return t.join(`
`)}function ux(e,t){const n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=e.getActiveAttrib(t,r),o=s.name;let a=1;s.type===e.FLOAT_MAT2&&(a=2),s.type===e.FLOAT_MAT3&&(a=3),s.type===e.FLOAT_MAT4&&(a=4),n[o]={type:s.type,location:e.getAttribLocation(t,o),locationSize:a}}return n}function to(e){return e!==""}function Wf(e,t){const n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Xf(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const fx=/^[ \t]*#include +<([\w\d./]+)>/gm;function ih(e){return e.replace(fx,px)}const dx=new Map;function px(e,t){let n=zt[t];if(n===void 0){const i=dx.get(t);if(i!==void 0)n=zt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return ih(n)}const mx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function qf(e){return e.replace(mx,gx)}function gx(e,t,n,i){let r="";for(let s=parseInt(t);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Yf(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?t+=`
#define HIGH_PRECISION`:e.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function _x(e){let t="SHADOWMAP_TYPE_BASIC";return e.shadowMapType===ap?t="SHADOWMAP_TYPE_PCF":e.shadowMapType===eg?t="SHADOWMAP_TYPE_PCF_SOFT":e.shadowMapType===Ci&&(t="SHADOWMAP_TYPE_VSM"),t}function vx(e){let t="ENVMAP_TYPE_CUBE";if(e.envMap)switch(e.envMapMode){case gs:case _s:t="ENVMAP_TYPE_CUBE";break;case Xa:t="ENVMAP_TYPE_CUBE_UV";break}return t}function xx(e){let t="ENVMAP_MODE_REFLECTION";if(e.envMap)switch(e.envMapMode){case _s:t="ENVMAP_MODE_REFRACTION";break}return t}function Mx(e){let t="ENVMAP_BLENDING_NONE";if(e.envMap)switch(e.combine){case cp:t="ENVMAP_BLENDING_MULTIPLY";break;case Mg:t="ENVMAP_BLENDING_MIX";break;case yg:t="ENVMAP_BLENDING_ADD";break}return t}function yx(e){const t=e.envMapCubeUVHeight;if(t===null)return null;const n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),7*16)),texelHeight:i,maxMip:n}}function Sx(e,t,n,i){const r=e.getContext(),s=n.defines;let o=n.vertexShader,a=n.fragmentShader;const c=_x(n),l=vx(n),h=xx(n),u=Mx(n),f=yx(n),p=lx(n),g=hx(s),v=r.createProgram();let m,d,A=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter(to).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g].filter(to).join(`
`),d.length>0&&(d+=`
`)):(m=[Yf(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+h:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+c:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(to).join(`
`),d=[Yf(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,g,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+l:"",n.envMap?"#define "+h:"",n.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+c:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==sr?"#define TONE_MAPPING":"",n.toneMapping!==sr?zt.tonemapping_pars_fragment:"",n.toneMapping!==sr?ax("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",zt.colorspace_pars_fragment,ox("linearToOutputTexel",n.outputColorSpace),cx(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(to).join(`
`)),o=ih(o),o=Wf(o,n),o=Xf(o,n),a=ih(a),a=Wf(a,n),a=Xf(a,n),o=qf(o),a=qf(a),n.isRawShaderMaterial!==!0&&(A=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",n.glslVersion===of?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===of?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const T=A+m+o,S=A+d+a,N=Vf(r,r.VERTEX_SHADER,T),R=Vf(r,r.FRAGMENT_SHADER,S);r.attachShader(v,N),r.attachShader(v,R),n.index0AttributeName!==void 0?r.bindAttribLocation(v,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(v,0,"position"),r.linkProgram(v);function b(w){if(e.debug.checkShaderErrors){const G=r.getProgramInfoLog(v).trim(),k=r.getShaderInfoLog(N).trim(),j=r.getShaderInfoLog(R).trim();let K=!0,H=!0;if(r.getProgramParameter(v,r.LINK_STATUS)===!1)if(K=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(r,v,N,R);else{const $=Hf(r,N,"vertex"),z=Hf(r,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(v,r.VALIDATE_STATUS)+`

Material Name: `+w.name+`
Material Type: `+w.type+`

Program Info Log: `+G+`
`+$+`
`+z)}else G!==""?console.warn("THREE.WebGLProgram: Program Info Log:",G):(k===""||j==="")&&(H=!1);H&&(w.diagnostics={runnable:K,programLog:G,vertexShader:{log:k,prefix:m},fragmentShader:{log:j,prefix:d}})}r.deleteShader(N),r.deleteShader(R),D=new Ma(r,v),y=ux(r,v)}let D;this.getUniforms=function(){return D===void 0&&b(this),D};let y;this.getAttributes=function(){return y===void 0&&b(this),y};let x=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=r.getProgramParameter(v,nx)),x},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(v),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=ix++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=N,this.fragmentShader=R,this}let Ex=0;class Tx{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const n=t.vertexShader,i=t.fragmentShader,r=this._getShaderStage(n),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(t);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(t){const n=this.materialCache.get(t);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const n=this.materialCache;let i=n.get(t);return i===void 0&&(i=new Set,n.set(t,i)),i}_getShaderStage(t){const n=this.shaderCache;let i=n.get(t);return i===void 0&&(i=new Ax(t),n.set(t,i)),i}}class Ax{constructor(t){this.id=Ex++,this.code=t,this.usedTimes=0}}function bx(e,t,n,i,r,s,o){const a=new Ap,c=new Tx,l=new Set,h=[],u=r.logarithmicDepthBuffer,f=r.vertexTextures;let p=r.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(y){return l.add(y),y===0?"uv":`uv${y}`}function m(y,x,w,G,k){const j=G.fog,K=k.geometry,H=y.isMeshStandardMaterial?G.environment:null,$=(y.isMeshStandardMaterial?n:t).get(y.envMap||H),z=$&&$.mapping===Xa?$.image.height:null,it=g[y.type];y.precision!==null&&(p=r.getMaxPrecision(y.precision),p!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",p,"instead."));const ht=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Et=ht!==void 0?ht.length:0;let Vt=0;K.morphAttributes.position!==void 0&&(Vt=1),K.morphAttributes.normal!==void 0&&(Vt=2),K.morphAttributes.color!==void 0&&(Vt=3);let le,X,et,yt;if(it){const se=li[it];le=se.vertexShader,X=se.fragmentShader}else le=y.vertexShader,X=y.fragmentShader,c.update(y),et=c.getVertexShaderID(y),yt=c.getFragmentShaderID(y);const st=e.getRenderTarget(),Lt=e.state.buffers.depth.getReversed(),Nt=k.isInstancedMesh===!0,Gt=k.isBatchedMesh===!0,Ae=!!y.map,jt=!!y.matcap,Ne=!!$,I=!!y.aoMap,Ln=!!y.lightMap,Xt=!!y.bumpMap,qt=!!y.normalMap,Ct=!!y.displacementMap,me=!!y.emissiveMap,Rt=!!y.metalnessMap,E=!!y.roughnessMap,_=y.anisotropy>0,F=y.clearcoat>0,q=y.dispersion>0,Z=y.iridescence>0,W=y.sheen>0,Tt=y.transmission>0,ot=_&&!!y.anisotropyMap,dt=F&&!!y.clearcoatMap,Kt=F&&!!y.clearcoatNormalMap,J=F&&!!y.clearcoatRoughnessMap,pt=Z&&!!y.iridescenceMap,Pt=Z&&!!y.iridescenceThicknessMap,Dt=W&&!!y.sheenColorMap,mt=W&&!!y.sheenRoughnessMap,Yt=!!y.specularMap,kt=!!y.specularColorMap,ue=!!y.specularIntensityMap,C=Tt&&!!y.transmissionMap,rt=Tt&&!!y.thicknessMap,V=!!y.gradientMap,Y=!!y.alphaMap,lt=y.alphaTest>0,at=!!y.alphaHash,Ft=!!y.extensions;let be=sr;y.toneMapped&&(st===null||st.isXRRenderTarget===!0)&&(be=e.toneMapping);const Je={shaderID:it,shaderType:y.type,shaderName:y.name,vertexShader:le,fragmentShader:X,defines:y.defines,customVertexShaderID:et,customFragmentShaderID:yt,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:p,batching:Gt,batchingColor:Gt&&k._colorsTexture!==null,instancing:Nt,instancingColor:Nt&&k.instanceColor!==null,instancingMorph:Nt&&k.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:st===null?e.outputColorSpace:st.isXRRenderTarget===!0?st.texture.colorSpace:Ls,alphaToCoverage:!!y.alphaToCoverage,map:Ae,matcap:jt,envMap:Ne,envMapMode:Ne&&$.mapping,envMapCubeUVHeight:z,aoMap:I,lightMap:Ln,bumpMap:Xt,normalMap:qt,displacementMap:f&&Ct,emissiveMap:me,normalMapObjectSpace:qt&&y.normalMapType===Ig,normalMapTangentSpace:qt&&y.normalMapType===Dg,metalnessMap:Rt,roughnessMap:E,anisotropy:_,anisotropyMap:ot,clearcoat:F,clearcoatMap:dt,clearcoatNormalMap:Kt,clearcoatRoughnessMap:J,dispersion:q,iridescence:Z,iridescenceMap:pt,iridescenceThicknessMap:Pt,sheen:W,sheenColorMap:Dt,sheenRoughnessMap:mt,specularMap:Yt,specularColorMap:kt,specularIntensityMap:ue,transmission:Tt,transmissionMap:C,thicknessMap:rt,gradientMap:V,opaque:y.transparent===!1&&y.blending===hs&&y.alphaToCoverage===!1,alphaMap:Y,alphaTest:lt,alphaHash:at,combine:y.combine,mapUv:Ae&&v(y.map.channel),aoMapUv:I&&v(y.aoMap.channel),lightMapUv:Ln&&v(y.lightMap.channel),bumpMapUv:Xt&&v(y.bumpMap.channel),normalMapUv:qt&&v(y.normalMap.channel),displacementMapUv:Ct&&v(y.displacementMap.channel),emissiveMapUv:me&&v(y.emissiveMap.channel),metalnessMapUv:Rt&&v(y.metalnessMap.channel),roughnessMapUv:E&&v(y.roughnessMap.channel),anisotropyMapUv:ot&&v(y.anisotropyMap.channel),clearcoatMapUv:dt&&v(y.clearcoatMap.channel),clearcoatNormalMapUv:Kt&&v(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:J&&v(y.clearcoatRoughnessMap.channel),iridescenceMapUv:pt&&v(y.iridescenceMap.channel),iridescenceThicknessMapUv:Pt&&v(y.iridescenceThicknessMap.channel),sheenColorMapUv:Dt&&v(y.sheenColorMap.channel),sheenRoughnessMapUv:mt&&v(y.sheenRoughnessMap.channel),specularMapUv:Yt&&v(y.specularMap.channel),specularColorMapUv:kt&&v(y.specularColorMap.channel),specularIntensityMapUv:ue&&v(y.specularIntensityMap.channel),transmissionMapUv:C&&v(y.transmissionMap.channel),thicknessMapUv:rt&&v(y.thicknessMap.channel),alphaMapUv:Y&&v(y.alphaMap.channel),vertexTangents:!!K.attributes.tangent&&(qt||_),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!K.attributes.uv&&(Ae||Y),fog:!!j,useFog:y.fog===!0,fogExp2:!!j&&j.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:Lt,skinning:k.isSkinnedMesh===!0,morphTargets:K.morphAttributes.position!==void 0,morphNormals:K.morphAttributes.normal!==void 0,morphColors:K.morphAttributes.color!==void 0,morphTargetsCount:Et,morphTextureStride:Vt,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:e.shadowMap.enabled&&w.length>0,shadowMapType:e.shadowMap.type,toneMapping:be,decodeVideoTexture:Ae&&y.map.isVideoTexture===!0&&$t.getTransfer(y.map.colorSpace)===ae,decodeVideoTextureEmissive:me&&y.emissiveMap.isVideoTexture===!0&&$t.getTransfer(y.emissiveMap.colorSpace)===ae,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Pi,flipSided:y.side===pn,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:Ft&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ft&&y.extensions.multiDraw===!0||Gt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Je.vertexUv1s=l.has(1),Je.vertexUv2s=l.has(2),Je.vertexUv3s=l.has(3),l.clear(),Je}function d(y){const x=[];if(y.shaderID?x.push(y.shaderID):(x.push(y.customVertexShaderID),x.push(y.customFragmentShaderID)),y.defines!==void 0)for(const w in y.defines)x.push(w),x.push(y.defines[w]);return y.isRawShaderMaterial===!1&&(A(x,y),T(x,y),x.push(e.outputColorSpace)),x.push(y.customProgramCacheKey),x.join()}function A(y,x){y.push(x.precision),y.push(x.outputColorSpace),y.push(x.envMapMode),y.push(x.envMapCubeUVHeight),y.push(x.mapUv),y.push(x.alphaMapUv),y.push(x.lightMapUv),y.push(x.aoMapUv),y.push(x.bumpMapUv),y.push(x.normalMapUv),y.push(x.displacementMapUv),y.push(x.emissiveMapUv),y.push(x.metalnessMapUv),y.push(x.roughnessMapUv),y.push(x.anisotropyMapUv),y.push(x.clearcoatMapUv),y.push(x.clearcoatNormalMapUv),y.push(x.clearcoatRoughnessMapUv),y.push(x.iridescenceMapUv),y.push(x.iridescenceThicknessMapUv),y.push(x.sheenColorMapUv),y.push(x.sheenRoughnessMapUv),y.push(x.specularMapUv),y.push(x.specularColorMapUv),y.push(x.specularIntensityMapUv),y.push(x.transmissionMapUv),y.push(x.thicknessMapUv),y.push(x.combine),y.push(x.fogExp2),y.push(x.sizeAttenuation),y.push(x.morphTargetsCount),y.push(x.morphAttributeCount),y.push(x.numDirLights),y.push(x.numPointLights),y.push(x.numSpotLights),y.push(x.numSpotLightMaps),y.push(x.numHemiLights),y.push(x.numRectAreaLights),y.push(x.numDirLightShadows),y.push(x.numPointLightShadows),y.push(x.numSpotLightShadows),y.push(x.numSpotLightShadowsWithMaps),y.push(x.numLightProbes),y.push(x.shadowMapType),y.push(x.toneMapping),y.push(x.numClippingPlanes),y.push(x.numClipIntersection),y.push(x.depthPacking)}function T(y,x){a.disableAll(),x.supportsVertexTextures&&a.enable(0),x.instancing&&a.enable(1),x.instancingColor&&a.enable(2),x.instancingMorph&&a.enable(3),x.matcap&&a.enable(4),x.envMap&&a.enable(5),x.normalMapObjectSpace&&a.enable(6),x.normalMapTangentSpace&&a.enable(7),x.clearcoat&&a.enable(8),x.iridescence&&a.enable(9),x.alphaTest&&a.enable(10),x.vertexColors&&a.enable(11),x.vertexAlphas&&a.enable(12),x.vertexUv1s&&a.enable(13),x.vertexUv2s&&a.enable(14),x.vertexUv3s&&a.enable(15),x.vertexTangents&&a.enable(16),x.anisotropy&&a.enable(17),x.alphaHash&&a.enable(18),x.batching&&a.enable(19),x.dispersion&&a.enable(20),x.batchingColor&&a.enable(21),y.push(a.mask),a.disableAll(),x.fog&&a.enable(0),x.useFog&&a.enable(1),x.flatShading&&a.enable(2),x.logarithmicDepthBuffer&&a.enable(3),x.reverseDepthBuffer&&a.enable(4),x.skinning&&a.enable(5),x.morphTargets&&a.enable(6),x.morphNormals&&a.enable(7),x.morphColors&&a.enable(8),x.premultipliedAlpha&&a.enable(9),x.shadowMapEnabled&&a.enable(10),x.doubleSided&&a.enable(11),x.flipSided&&a.enable(12),x.useDepthPacking&&a.enable(13),x.dithering&&a.enable(14),x.transmission&&a.enable(15),x.sheen&&a.enable(16),x.opaque&&a.enable(17),x.pointsUvs&&a.enable(18),x.decodeVideoTexture&&a.enable(19),x.decodeVideoTextureEmissive&&a.enable(20),x.alphaToCoverage&&a.enable(21),y.push(a.mask)}function S(y){const x=g[y.type];let w;if(x){const G=li[x];w=c_.clone(G.uniforms)}else w=y.uniforms;return w}function N(y,x){let w;for(let G=0,k=h.length;G<k;G++){const j=h[G];if(j.cacheKey===x){w=j,++w.usedTimes;break}}return w===void 0&&(w=new Sx(e,x,y,s),h.push(w)),w}function R(y){if(--y.usedTimes===0){const x=h.indexOf(y);h[x]=h[h.length-1],h.pop(),y.destroy()}}function b(y){c.remove(y)}function D(){c.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:S,acquireProgram:N,releaseProgram:R,releaseShaderCache:b,programs:h,dispose:D}}function wx(){let e=new WeakMap;function t(o){return e.has(o)}function n(o){let a=e.get(o);return a===void 0&&(a={},e.set(o,a)),a}function i(o){e.delete(o)}function r(o,a,c){e.get(o)[a]=c}function s(){e=new WeakMap}return{has:t,get:n,remove:i,update:r,dispose:s}}function Rx(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.z!==t.z?e.z-t.z:e.id-t.id}function jf(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function Kf(){const e=[];let t=0;const n=[],i=[],r=[];function s(){t=0,n.length=0,i.length=0,r.length=0}function o(u,f,p,g,v,m){let d=e[t];return d===void 0?(d={id:u.id,object:u,geometry:f,material:p,groupOrder:g,renderOrder:u.renderOrder,z:v,group:m},e[t]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=p,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=v,d.group=m),t++,d}function a(u,f,p,g,v,m){const d=o(u,f,p,g,v,m);p.transmission>0?i.push(d):p.transparent===!0?r.push(d):n.push(d)}function c(u,f,p,g,v,m){const d=o(u,f,p,g,v,m);p.transmission>0?i.unshift(d):p.transparent===!0?r.unshift(d):n.unshift(d)}function l(u,f){n.length>1&&n.sort(u||Rx),i.length>1&&i.sort(f||jf),r.length>1&&r.sort(f||jf)}function h(){for(let u=t,f=e.length;u<f;u++){const p=e[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:a,unshift:c,finish:h,sort:l}}function Cx(){let e=new WeakMap;function t(i,r){const s=e.get(i);let o;return s===void 0?(o=new Kf,e.set(i,[o])):r>=s.length?(o=new Kf,s.push(o)):o=s[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}function Px(){const e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={direction:new U,color:new oe};break;case"SpotLight":n={position:new U,direction:new U,color:new oe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new U,color:new oe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new U,skyColor:new oe,groundColor:new oe};break;case"RectAreaLight":n={color:new oe,position:new U,halfWidth:new U,halfHeight:new U};break}return e[t.id]=n,n}}}function Lx(){const e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}let Dx=0;function Ix(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function Ux(e){const t=new Px,n=Lx(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new U);const r=new U,s=new De,o=new De;function a(l){let h=0,u=0,f=0;for(let y=0;y<9;y++)i.probe[y].set(0,0,0);let p=0,g=0,v=0,m=0,d=0,A=0,T=0,S=0,N=0,R=0,b=0;l.sort(Ix);for(let y=0,x=l.length;y<x;y++){const w=l[y],G=w.color,k=w.intensity,j=w.distance,K=w.shadow&&w.shadow.map?w.shadow.map.texture:null;if(w.isAmbientLight)h+=G.r*k,u+=G.g*k,f+=G.b*k;else if(w.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(w.sh.coefficients[H],k);b++}else if(w.isDirectionalLight){const H=t.get(w);if(H.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){const $=w.shadow,z=n.get(w);z.shadowIntensity=$.intensity,z.shadowBias=$.bias,z.shadowNormalBias=$.normalBias,z.shadowRadius=$.radius,z.shadowMapSize=$.mapSize,i.directionalShadow[p]=z,i.directionalShadowMap[p]=K,i.directionalShadowMatrix[p]=w.shadow.matrix,A++}i.directional[p]=H,p++}else if(w.isSpotLight){const H=t.get(w);H.position.setFromMatrixPosition(w.matrixWorld),H.color.copy(G).multiplyScalar(k),H.distance=j,H.coneCos=Math.cos(w.angle),H.penumbraCos=Math.cos(w.angle*(1-w.penumbra)),H.decay=w.decay,i.spot[v]=H;const $=w.shadow;if(w.map&&(i.spotLightMap[N]=w.map,N++,$.updateMatrices(w),w.castShadow&&R++),i.spotLightMatrix[v]=$.matrix,w.castShadow){const z=n.get(w);z.shadowIntensity=$.intensity,z.shadowBias=$.bias,z.shadowNormalBias=$.normalBias,z.shadowRadius=$.radius,z.shadowMapSize=$.mapSize,i.spotShadow[v]=z,i.spotShadowMap[v]=K,S++}v++}else if(w.isRectAreaLight){const H=t.get(w);H.color.copy(G).multiplyScalar(k),H.halfWidth.set(w.width*.5,0,0),H.halfHeight.set(0,w.height*.5,0),i.rectArea[m]=H,m++}else if(w.isPointLight){const H=t.get(w);if(H.color.copy(w.color).multiplyScalar(w.intensity),H.distance=w.distance,H.decay=w.decay,w.castShadow){const $=w.shadow,z=n.get(w);z.shadowIntensity=$.intensity,z.shadowBias=$.bias,z.shadowNormalBias=$.normalBias,z.shadowRadius=$.radius,z.shadowMapSize=$.mapSize,z.shadowCameraNear=$.camera.near,z.shadowCameraFar=$.camera.far,i.pointShadow[g]=z,i.pointShadowMap[g]=K,i.pointShadowMatrix[g]=w.shadow.matrix,T++}i.point[g]=H,g++}else if(w.isHemisphereLight){const H=t.get(w);H.skyColor.copy(w.color).multiplyScalar(k),H.groundColor.copy(w.groundColor).multiplyScalar(k),i.hemi[d]=H,d++}}m>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=nt.LTC_FLOAT_1,i.rectAreaLTC2=nt.LTC_FLOAT_2):(i.rectAreaLTC1=nt.LTC_HALF_1,i.rectAreaLTC2=nt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=f;const D=i.hash;(D.directionalLength!==p||D.pointLength!==g||D.spotLength!==v||D.rectAreaLength!==m||D.hemiLength!==d||D.numDirectionalShadows!==A||D.numPointShadows!==T||D.numSpotShadows!==S||D.numSpotMaps!==N||D.numLightProbes!==b)&&(i.directional.length=p,i.spot.length=v,i.rectArea.length=m,i.point.length=g,i.hemi.length=d,i.directionalShadow.length=A,i.directionalShadowMap.length=A,i.pointShadow.length=T,i.pointShadowMap.length=T,i.spotShadow.length=S,i.spotShadowMap.length=S,i.directionalShadowMatrix.length=A,i.pointShadowMatrix.length=T,i.spotLightMatrix.length=S+N-R,i.spotLightMap.length=N,i.numSpotLightShadowsWithMaps=R,i.numLightProbes=b,D.directionalLength=p,D.pointLength=g,D.spotLength=v,D.rectAreaLength=m,D.hemiLength=d,D.numDirectionalShadows=A,D.numPointShadows=T,D.numSpotShadows=S,D.numSpotMaps=N,D.numLightProbes=b,i.version=Dx++)}function c(l,h){let u=0,f=0,p=0,g=0,v=0;const m=h.matrixWorldInverse;for(let d=0,A=l.length;d<A;d++){const T=l[d];if(T.isDirectionalLight){const S=i.directional[u];S.direction.setFromMatrixPosition(T.matrixWorld),r.setFromMatrixPosition(T.target.matrixWorld),S.direction.sub(r),S.direction.transformDirection(m),u++}else if(T.isSpotLight){const S=i.spot[p];S.position.setFromMatrixPosition(T.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(T.matrixWorld),r.setFromMatrixPosition(T.target.matrixWorld),S.direction.sub(r),S.direction.transformDirection(m),p++}else if(T.isRectAreaLight){const S=i.rectArea[g];S.position.setFromMatrixPosition(T.matrixWorld),S.position.applyMatrix4(m),o.identity(),s.copy(T.matrixWorld),s.premultiply(m),o.extractRotation(s),S.halfWidth.set(T.width*.5,0,0),S.halfHeight.set(0,T.height*.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),g++}else if(T.isPointLight){const S=i.point[f];S.position.setFromMatrixPosition(T.matrixWorld),S.position.applyMatrix4(m),f++}else if(T.isHemisphereLight){const S=i.hemi[v];S.direction.setFromMatrixPosition(T.matrixWorld),S.direction.transformDirection(m),v++}}}return{setup:a,setupView:c,state:i}}function $f(e){const t=new Ux(e),n=[],i=[];function r(h){l.camera=h,n.length=0,i.length=0}function s(h){n.push(h)}function o(h){i.push(h)}function a(){t.setup(n)}function c(h){t.setupView(n,h)}const l={lightsArray:n,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:r,state:l,setupLights:a,setupLightsView:c,pushLight:s,pushShadow:o}}function Nx(e){let t=new WeakMap;function n(r,s=0){const o=t.get(r);let a;return o===void 0?(a=new $f(e),t.set(r,[a])):s>=o.length?(a=new $f(e),o.push(a)):a=o[s],a}function i(){t=new WeakMap}return{get:n,dispose:i}}class Fx extends To{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Pg,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Ox extends To{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const Bx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,kx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function zx(e,t,n){let i=new Ip;const r=new ee,s=new ee,o=new Oe,a=new Fx({depthPacking:Lg}),c=new Ox,l={},h=n.maxTextureSize,u={[ar]:pn,[pn]:ar,[Pi]:Pi},f=new zi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ee},radius:{value:4}},vertexShader:Bx,fragmentShader:kx}),p=f.clone();p.defines.HORIZONTAL_PASS=1;const g=new Hi;g.setAttribute("position",new rn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Ui(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ap;let d=this.type;this.render=function(R,b,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;const y=e.getRenderTarget(),x=e.getActiveCubeFace(),w=e.getActiveMipmapLevel(),G=e.state;G.setBlending(rr),G.buffers.color.setClear(1,1,1,1),G.buffers.depth.setTest(!0),G.setScissorTest(!1);const k=d!==Ci&&this.type===Ci,j=d===Ci&&this.type!==Ci;for(let K=0,H=R.length;K<H;K++){const $=R[K],z=$.shadow;if(z===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;r.copy(z.mapSize);const it=z.getFrameExtents();if(r.multiply(it),s.copy(z.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/it.x),r.x=s.x*it.x,z.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/it.y),r.y=s.y*it.y,z.mapSize.y=s.y)),z.map===null||k===!0||j===!0){const Et=this.type!==Ci?{minFilter:Qn,magFilter:Qn}:{};z.map!==null&&z.map.dispose(),z.map=new kr(r.x,r.y,Et),z.map.texture.name=$.name+".shadowMap",z.camera.updateProjectionMatrix()}e.setRenderTarget(z.map),e.clear();const ht=z.getViewportCount();for(let Et=0;Et<ht;Et++){const Vt=z.getViewport(Et);o.set(s.x*Vt.x,s.y*Vt.y,s.x*Vt.z,s.y*Vt.w),G.viewport(o),z.updateMatrices($,Et),i=z.getFrustum(),S(b,D,z.camera,$,this.type)}z.isPointLightShadow!==!0&&this.type===Ci&&A(z,D),z.needsUpdate=!1}d=this.type,m.needsUpdate=!1,e.setRenderTarget(y,x,w)};function A(R,b){const D=t.update(v);f.defines.VSM_SAMPLES!==R.blurSamples&&(f.defines.VSM_SAMPLES=R.blurSamples,p.defines.VSM_SAMPLES=R.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new kr(r.x,r.y)),f.uniforms.shadow_pass.value=R.map.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,e.setRenderTarget(R.mapPass),e.clear(),e.renderBufferDirect(b,null,D,f,v,null),p.uniforms.shadow_pass.value=R.mapPass.texture,p.uniforms.resolution.value=R.mapSize,p.uniforms.radius.value=R.radius,e.setRenderTarget(R.map),e.clear(),e.renderBufferDirect(b,null,D,p,v,null)}function T(R,b,D,y){let x=null;const w=D.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(w!==void 0)x=w;else if(x=D.isPointLight===!0?c:a,e.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0){const G=x.uuid,k=b.uuid;let j=l[G];j===void 0&&(j={},l[G]=j);let K=j[k];K===void 0&&(K=x.clone(),j[k]=K,b.addEventListener("dispose",N)),x=K}if(x.visible=b.visible,x.wireframe=b.wireframe,y===Ci?x.side=b.shadowSide!==null?b.shadowSide:b.side:x.side=b.shadowSide!==null?b.shadowSide:u[b.side],x.alphaMap=b.alphaMap,x.alphaTest=b.alphaTest,x.map=b.map,x.clipShadows=b.clipShadows,x.clippingPlanes=b.clippingPlanes,x.clipIntersection=b.clipIntersection,x.displacementMap=b.displacementMap,x.displacementScale=b.displacementScale,x.displacementBias=b.displacementBias,x.wireframeLinewidth=b.wireframeLinewidth,x.linewidth=b.linewidth,D.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const G=e.properties.get(x);G.light=D}return x}function S(R,b,D,y,x){if(R.visible===!1)return;if(R.layers.test(b.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&x===Ci)&&(!R.frustumCulled||i.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,R.matrixWorld);const k=t.update(R),j=R.material;if(Array.isArray(j)){const K=k.groups;for(let H=0,$=K.length;H<$;H++){const z=K[H],it=j[z.materialIndex];if(it&&it.visible){const ht=T(R,it,y,x);R.onBeforeShadow(e,R,b,D,k,ht,z),e.renderBufferDirect(D,null,k,ht,R,z),R.onAfterShadow(e,R,b,D,k,ht,z)}}}else if(j.visible){const K=T(R,j,y,x);R.onBeforeShadow(e,R,b,D,k,K,null),e.renderBufferDirect(D,null,k,K,R,null),R.onAfterShadow(e,R,b,D,k,K,null)}}const G=R.children;for(let k=0,j=G.length;k<j;k++)S(G[k],b,D,y,x)}function N(R){R.target.removeEventListener("dispose",N);for(const D in l){const y=l[D],x=R.target.uuid;x in y&&(y[x].dispose(),delete y[x])}}}const Vx={[xl]:Ml,[yl]:Tl,[Sl]:Al,[ms]:El,[Ml]:xl,[Tl]:yl,[Al]:Sl,[El]:ms};function Gx(e,t){function n(){let C=!1;const rt=new Oe;let V=null;const Y=new Oe(0,0,0,0);return{setMask:function(lt){V!==lt&&!C&&(e.colorMask(lt,lt,lt,lt),V=lt)},setLocked:function(lt){C=lt},setClear:function(lt,at,Ft,be,Je){Je===!0&&(lt*=be,at*=be,Ft*=be),rt.set(lt,at,Ft,be),Y.equals(rt)===!1&&(e.clearColor(lt,at,Ft,be),Y.copy(rt))},reset:function(){C=!1,V=null,Y.set(-1,0,0,0)}}}function i(){let C=!1,rt=!1,V=null,Y=null,lt=null;return{setReversed:function(at){if(rt!==at){const Ft=t.get("EXT_clip_control");rt?Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.ZERO_TO_ONE_EXT):Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.NEGATIVE_ONE_TO_ONE_EXT);const be=lt;lt=null,this.setClear(be)}rt=at},getReversed:function(){return rt},setTest:function(at){at?st(e.DEPTH_TEST):Lt(e.DEPTH_TEST)},setMask:function(at){V!==at&&!C&&(e.depthMask(at),V=at)},setFunc:function(at){if(rt&&(at=Vx[at]),Y!==at){switch(at){case xl:e.depthFunc(e.NEVER);break;case Ml:e.depthFunc(e.ALWAYS);break;case yl:e.depthFunc(e.LESS);break;case ms:e.depthFunc(e.LEQUAL);break;case Sl:e.depthFunc(e.EQUAL);break;case El:e.depthFunc(e.GEQUAL);break;case Tl:e.depthFunc(e.GREATER);break;case Al:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}Y=at}},setLocked:function(at){C=at},setClear:function(at){lt!==at&&(rt&&(at=1-at),e.clearDepth(at),lt=at)},reset:function(){C=!1,V=null,Y=null,lt=null,rt=!1}}}function r(){let C=!1,rt=null,V=null,Y=null,lt=null,at=null,Ft=null,be=null,Je=null;return{setTest:function(se){C||(se?st(e.STENCIL_TEST):Lt(e.STENCIL_TEST))},setMask:function(se){rt!==se&&!C&&(e.stencilMask(se),rt=se)},setFunc:function(se,Xn,Si){(V!==se||Y!==Xn||lt!==Si)&&(e.stencilFunc(se,Xn,Si),V=se,Y=Xn,lt=Si)},setOp:function(se,Xn,Si){(at!==se||Ft!==Xn||be!==Si)&&(e.stencilOp(se,Xn,Si),at=se,Ft=Xn,be=Si)},setLocked:function(se){C=se},setClear:function(se){Je!==se&&(e.clearStencil(se),Je=se)},reset:function(){C=!1,rt=null,V=null,Y=null,lt=null,at=null,Ft=null,be=null,Je=null}}}const s=new n,o=new i,a=new r,c=new WeakMap,l=new WeakMap;let h={},u={},f=new WeakMap,p=[],g=null,v=!1,m=null,d=null,A=null,T=null,S=null,N=null,R=null,b=new oe(0,0,0),D=0,y=!1,x=null,w=null,G=null,k=null,j=null;const K=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,$=0;const z=e.getParameter(e.VERSION);z.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(z)[1]),H=$>=1):z.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(z)[1]),H=$>=2);let it=null,ht={};const Et=e.getParameter(e.SCISSOR_BOX),Vt=e.getParameter(e.VIEWPORT),le=new Oe().fromArray(Et),X=new Oe().fromArray(Vt);function et(C,rt,V,Y){const lt=new Uint8Array(4),at=e.createTexture();e.bindTexture(C,at),e.texParameteri(C,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(C,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let Ft=0;Ft<V;Ft++)C===e.TEXTURE_3D||C===e.TEXTURE_2D_ARRAY?e.texImage3D(rt,0,e.RGBA,1,1,Y,0,e.RGBA,e.UNSIGNED_BYTE,lt):e.texImage2D(rt+Ft,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,lt);return at}const yt={};yt[e.TEXTURE_2D]=et(e.TEXTURE_2D,e.TEXTURE_2D,1),yt[e.TEXTURE_CUBE_MAP]=et(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),yt[e.TEXTURE_2D_ARRAY]=et(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),yt[e.TEXTURE_3D]=et(e.TEXTURE_3D,e.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),st(e.DEPTH_TEST),o.setFunc(ms),Xt(!1),qt(tf),st(e.CULL_FACE),I(rr);function st(C){h[C]!==!0&&(e.enable(C),h[C]=!0)}function Lt(C){h[C]!==!1&&(e.disable(C),h[C]=!1)}function Nt(C,rt){return u[C]!==rt?(e.bindFramebuffer(C,rt),u[C]=rt,C===e.DRAW_FRAMEBUFFER&&(u[e.FRAMEBUFFER]=rt),C===e.FRAMEBUFFER&&(u[e.DRAW_FRAMEBUFFER]=rt),!0):!1}function Gt(C,rt){let V=p,Y=!1;if(C){V=f.get(rt),V===void 0&&(V=[],f.set(rt,V));const lt=C.textures;if(V.length!==lt.length||V[0]!==e.COLOR_ATTACHMENT0){for(let at=0,Ft=lt.length;at<Ft;at++)V[at]=e.COLOR_ATTACHMENT0+at;V.length=lt.length,Y=!0}}else V[0]!==e.BACK&&(V[0]=e.BACK,Y=!0);Y&&e.drawBuffers(V)}function Ae(C){return g!==C?(e.useProgram(C),g=C,!0):!1}const jt={[wr]:e.FUNC_ADD,[ig]:e.FUNC_SUBTRACT,[rg]:e.FUNC_REVERSE_SUBTRACT};jt[sg]=e.MIN,jt[og]=e.MAX;const Ne={[ag]:e.ZERO,[cg]:e.ONE,[lg]:e.SRC_COLOR,[_l]:e.SRC_ALPHA,[mg]:e.SRC_ALPHA_SATURATE,[dg]:e.DST_COLOR,[ug]:e.DST_ALPHA,[hg]:e.ONE_MINUS_SRC_COLOR,[vl]:e.ONE_MINUS_SRC_ALPHA,[pg]:e.ONE_MINUS_DST_COLOR,[fg]:e.ONE_MINUS_DST_ALPHA,[gg]:e.CONSTANT_COLOR,[_g]:e.ONE_MINUS_CONSTANT_COLOR,[vg]:e.CONSTANT_ALPHA,[xg]:e.ONE_MINUS_CONSTANT_ALPHA};function I(C,rt,V,Y,lt,at,Ft,be,Je,se){if(C===rr){v===!0&&(Lt(e.BLEND),v=!1);return}if(v===!1&&(st(e.BLEND),v=!0),C!==ng){if(C!==m||se!==y){if((d!==wr||S!==wr)&&(e.blendEquation(e.FUNC_ADD),d=wr,S=wr),se)switch(C){case hs:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case gl:e.blendFunc(e.ONE,e.ONE);break;case ef:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case nf:e.blendFuncSeparate(e.ZERO,e.SRC_COLOR,e.ZERO,e.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",C);break}else switch(C){case hs:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case gl:e.blendFunc(e.SRC_ALPHA,e.ONE);break;case ef:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case nf:e.blendFunc(e.ZERO,e.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",C);break}A=null,T=null,N=null,R=null,b.set(0,0,0),D=0,m=C,y=se}return}lt=lt||rt,at=at||V,Ft=Ft||Y,(rt!==d||lt!==S)&&(e.blendEquationSeparate(jt[rt],jt[lt]),d=rt,S=lt),(V!==A||Y!==T||at!==N||Ft!==R)&&(e.blendFuncSeparate(Ne[V],Ne[Y],Ne[at],Ne[Ft]),A=V,T=Y,N=at,R=Ft),(be.equals(b)===!1||Je!==D)&&(e.blendColor(be.r,be.g,be.b,Je),b.copy(be),D=Je),m=C,y=!1}function Ln(C,rt){C.side===Pi?Lt(e.CULL_FACE):st(e.CULL_FACE);let V=C.side===pn;rt&&(V=!V),Xt(V),C.blending===hs&&C.transparent===!1?I(rr):I(C.blending,C.blendEquation,C.blendSrc,C.blendDst,C.blendEquationAlpha,C.blendSrcAlpha,C.blendDstAlpha,C.blendColor,C.blendAlpha,C.premultipliedAlpha),o.setFunc(C.depthFunc),o.setTest(C.depthTest),o.setMask(C.depthWrite),s.setMask(C.colorWrite);const Y=C.stencilWrite;a.setTest(Y),Y&&(a.setMask(C.stencilWriteMask),a.setFunc(C.stencilFunc,C.stencilRef,C.stencilFuncMask),a.setOp(C.stencilFail,C.stencilZFail,C.stencilZPass)),me(C.polygonOffset,C.polygonOffsetFactor,C.polygonOffsetUnits),C.alphaToCoverage===!0?st(e.SAMPLE_ALPHA_TO_COVERAGE):Lt(e.SAMPLE_ALPHA_TO_COVERAGE)}function Xt(C){x!==C&&(C?e.frontFace(e.CW):e.frontFace(e.CCW),x=C)}function qt(C){C!==Q0?(st(e.CULL_FACE),C!==w&&(C===tf?e.cullFace(e.BACK):C===tg?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):Lt(e.CULL_FACE),w=C}function Ct(C){C!==G&&(H&&e.lineWidth(C),G=C)}function me(C,rt,V){C?(st(e.POLYGON_OFFSET_FILL),(k!==rt||j!==V)&&(e.polygonOffset(rt,V),k=rt,j=V)):Lt(e.POLYGON_OFFSET_FILL)}function Rt(C){C?st(e.SCISSOR_TEST):Lt(e.SCISSOR_TEST)}function E(C){C===void 0&&(C=e.TEXTURE0+K-1),it!==C&&(e.activeTexture(C),it=C)}function _(C,rt,V){V===void 0&&(it===null?V=e.TEXTURE0+K-1:V=it);let Y=ht[V];Y===void 0&&(Y={type:void 0,texture:void 0},ht[V]=Y),(Y.type!==C||Y.texture!==rt)&&(it!==V&&(e.activeTexture(V),it=V),e.bindTexture(C,rt||yt[C]),Y.type=C,Y.texture=rt)}function F(){const C=ht[it];C!==void 0&&C.type!==void 0&&(e.bindTexture(C.type,null),C.type=void 0,C.texture=void 0)}function q(){try{e.compressedTexImage2D.apply(e,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Z(){try{e.compressedTexImage3D.apply(e,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function W(){try{e.texSubImage2D.apply(e,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Tt(){try{e.texSubImage3D.apply(e,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function ot(){try{e.compressedTexSubImage2D.apply(e,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function dt(){try{e.compressedTexSubImage3D.apply(e,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Kt(){try{e.texStorage2D.apply(e,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function J(){try{e.texStorage3D.apply(e,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function pt(){try{e.texImage2D.apply(e,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Pt(){try{e.texImage3D.apply(e,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Dt(C){le.equals(C)===!1&&(e.scissor(C.x,C.y,C.z,C.w),le.copy(C))}function mt(C){X.equals(C)===!1&&(e.viewport(C.x,C.y,C.z,C.w),X.copy(C))}function Yt(C,rt){let V=l.get(rt);V===void 0&&(V=new WeakMap,l.set(rt,V));let Y=V.get(C);Y===void 0&&(Y=e.getUniformBlockIndex(rt,C.name),V.set(C,Y))}function kt(C,rt){const Y=l.get(rt).get(C);c.get(rt)!==Y&&(e.uniformBlockBinding(rt,Y,C.__bindingPointIndex),c.set(rt,Y))}function ue(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),h={},it=null,ht={},u={},f=new WeakMap,p=[],g=null,v=!1,m=null,d=null,A=null,T=null,S=null,N=null,R=null,b=new oe(0,0,0),D=0,y=!1,x=null,w=null,G=null,k=null,j=null,le.set(0,0,e.canvas.width,e.canvas.height),X.set(0,0,e.canvas.width,e.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:st,disable:Lt,bindFramebuffer:Nt,drawBuffers:Gt,useProgram:Ae,setBlending:I,setMaterial:Ln,setFlipSided:Xt,setCullFace:qt,setLineWidth:Ct,setPolygonOffset:me,setScissorTest:Rt,activeTexture:E,bindTexture:_,unbindTexture:F,compressedTexImage2D:q,compressedTexImage3D:Z,texImage2D:pt,texImage3D:Pt,updateUBOMapping:Yt,uniformBlockBinding:kt,texStorage2D:Kt,texStorage3D:J,texSubImage2D:W,texSubImage3D:Tt,compressedTexSubImage2D:ot,compressedTexSubImage3D:dt,scissor:Dt,viewport:mt,reset:ue}}function Zf(e,t,n,i){const r=Hx(i);switch(n){case dp:return e*t;case mp:return e*t;case gp:return e*t*2;case _p:return e*t/r.components*r.byteLength;case Fh:return e*t/r.components*r.byteLength;case vp:return e*t*2/r.components*r.byteLength;case Oh:return e*t*2/r.components*r.byteLength;case pp:return e*t*3/r.components*r.byteLength;case Zn:return e*t*4/r.components*r.byteLength;case Bh:return e*t*4/r.components*r.byteLength;case ma:case ga:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case _a:case va:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ll:case Il:return Math.max(e,16)*Math.max(t,8)/4;case Pl:case Dl:return Math.max(e,8)*Math.max(t,8)/2;case Ul:case Nl:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Fl:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Ol:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Bl:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case kl:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case zl:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Vl:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Gl:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Hl:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Wl:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Xl:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case ql:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Yl:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case jl:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Kl:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case $l:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case xa:case Zl:case Jl:return Math.ceil(e/4)*Math.ceil(t/4)*16;case xp:case Ql:return Math.ceil(e/4)*Math.ceil(t/4)*8;case th:case eh:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function Hx(e){switch(e){case ki:case hp:return{byteLength:1,components:1};case po:case up:case Mo:return{byteLength:2,components:1};case Uh:case Nh:return{byteLength:2,components:4};case Br:case Ih:case Di:return{byteLength:4,components:1};case fp:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${e}.`)}function Wx(e,t,n,i,r,s,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ee,h=new WeakMap;let u;const f=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(E,_){return p?new OffscreenCanvas(E,_):La("canvas")}function v(E,_,F){let q=1;const Z=Rt(E);if((Z.width>F||Z.height>F)&&(q=F/Math.max(Z.width,Z.height)),q<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){const W=Math.floor(q*Z.width),Tt=Math.floor(q*Z.height);u===void 0&&(u=g(W,Tt));const ot=_?g(W,Tt):u;return ot.width=W,ot.height=Tt,ot.getContext("2d").drawImage(E,0,0,W,Tt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+W+"x"+Tt+")."),ot}else return"data"in E&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),E;return E}function m(E){return E.generateMipmaps}function d(E){e.generateMipmap(E)}function A(E){return E.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?e.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function T(E,_,F,q,Z=!1){if(E!==null){if(e[E]!==void 0)return e[E];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let W=_;if(_===e.RED&&(F===e.FLOAT&&(W=e.R32F),F===e.HALF_FLOAT&&(W=e.R16F),F===e.UNSIGNED_BYTE&&(W=e.R8)),_===e.RED_INTEGER&&(F===e.UNSIGNED_BYTE&&(W=e.R8UI),F===e.UNSIGNED_SHORT&&(W=e.R16UI),F===e.UNSIGNED_INT&&(W=e.R32UI),F===e.BYTE&&(W=e.R8I),F===e.SHORT&&(W=e.R16I),F===e.INT&&(W=e.R32I)),_===e.RG&&(F===e.FLOAT&&(W=e.RG32F),F===e.HALF_FLOAT&&(W=e.RG16F),F===e.UNSIGNED_BYTE&&(W=e.RG8)),_===e.RG_INTEGER&&(F===e.UNSIGNED_BYTE&&(W=e.RG8UI),F===e.UNSIGNED_SHORT&&(W=e.RG16UI),F===e.UNSIGNED_INT&&(W=e.RG32UI),F===e.BYTE&&(W=e.RG8I),F===e.SHORT&&(W=e.RG16I),F===e.INT&&(W=e.RG32I)),_===e.RGB_INTEGER&&(F===e.UNSIGNED_BYTE&&(W=e.RGB8UI),F===e.UNSIGNED_SHORT&&(W=e.RGB16UI),F===e.UNSIGNED_INT&&(W=e.RGB32UI),F===e.BYTE&&(W=e.RGB8I),F===e.SHORT&&(W=e.RGB16I),F===e.INT&&(W=e.RGB32I)),_===e.RGBA_INTEGER&&(F===e.UNSIGNED_BYTE&&(W=e.RGBA8UI),F===e.UNSIGNED_SHORT&&(W=e.RGBA16UI),F===e.UNSIGNED_INT&&(W=e.RGBA32UI),F===e.BYTE&&(W=e.RGBA8I),F===e.SHORT&&(W=e.RGBA16I),F===e.INT&&(W=e.RGBA32I)),_===e.RGB&&F===e.UNSIGNED_INT_5_9_9_9_REV&&(W=e.RGB9_E5),_===e.RGBA){const Tt=Z?qa:$t.getTransfer(q);F===e.FLOAT&&(W=e.RGBA32F),F===e.HALF_FLOAT&&(W=e.RGBA16F),F===e.UNSIGNED_BYTE&&(W=Tt===ae?e.SRGB8_ALPHA8:e.RGBA8),F===e.UNSIGNED_SHORT_4_4_4_4&&(W=e.RGBA4),F===e.UNSIGNED_SHORT_5_5_5_1&&(W=e.RGB5_A1)}return(W===e.R16F||W===e.R32F||W===e.RG16F||W===e.RG32F||W===e.RGBA16F||W===e.RGBA32F)&&t.get("EXT_color_buffer_float"),W}function S(E,_){let F;return E?_===null||_===Br||_===vs?F=e.DEPTH24_STENCIL8:_===Di?F=e.DEPTH32F_STENCIL8:_===po&&(F=e.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Br||_===vs?F=e.DEPTH_COMPONENT24:_===Di?F=e.DEPTH_COMPONENT32F:_===po&&(F=e.DEPTH_COMPONENT16),F}function N(E,_){return m(E)===!0||E.isFramebufferTexture&&E.minFilter!==Qn&&E.minFilter!==di?Math.log2(Math.max(_.width,_.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?_.mipmaps.length:1}function R(E){const _=E.target;_.removeEventListener("dispose",R),D(_),_.isVideoTexture&&h.delete(_)}function b(E){const _=E.target;_.removeEventListener("dispose",b),x(_)}function D(E){const _=i.get(E);if(_.__webglInit===void 0)return;const F=E.source,q=f.get(F);if(q){const Z=q[_.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&y(E),Object.keys(q).length===0&&f.delete(F)}i.remove(E)}function y(E){const _=i.get(E);e.deleteTexture(_.__webglTexture);const F=E.source,q=f.get(F);delete q[_.__cacheKey],o.memory.textures--}function x(E){const _=i.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),i.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(_.__webglFramebuffer[q]))for(let Z=0;Z<_.__webglFramebuffer[q].length;Z++)e.deleteFramebuffer(_.__webglFramebuffer[q][Z]);else e.deleteFramebuffer(_.__webglFramebuffer[q]);_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer[q])}else{if(Array.isArray(_.__webglFramebuffer))for(let q=0;q<_.__webglFramebuffer.length;q++)e.deleteFramebuffer(_.__webglFramebuffer[q]);else e.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&e.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let q=0;q<_.__webglColorRenderbuffer.length;q++)_.__webglColorRenderbuffer[q]&&e.deleteRenderbuffer(_.__webglColorRenderbuffer[q]);_.__webglDepthRenderbuffer&&e.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const F=E.textures;for(let q=0,Z=F.length;q<Z;q++){const W=i.get(F[q]);W.__webglTexture&&(e.deleteTexture(W.__webglTexture),o.memory.textures--),i.remove(F[q])}i.remove(E)}let w=0;function G(){w=0}function k(){const E=w;return E>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+r.maxTextures),w+=1,E}function j(E){const _=[];return _.push(E.wrapS),_.push(E.wrapT),_.push(E.wrapR||0),_.push(E.magFilter),_.push(E.minFilter),_.push(E.anisotropy),_.push(E.internalFormat),_.push(E.format),_.push(E.type),_.push(E.generateMipmaps),_.push(E.premultiplyAlpha),_.push(E.flipY),_.push(E.unpackAlignment),_.push(E.colorSpace),_.join()}function K(E,_){const F=i.get(E);if(E.isVideoTexture&&Ct(E),E.isRenderTargetTexture===!1&&E.version>0&&F.__version!==E.version){const q=E.image;if(q===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{X(F,E,_);return}}n.bindTexture(e.TEXTURE_2D,F.__webglTexture,e.TEXTURE0+_)}function H(E,_){const F=i.get(E);if(E.version>0&&F.__version!==E.version){X(F,E,_);return}n.bindTexture(e.TEXTURE_2D_ARRAY,F.__webglTexture,e.TEXTURE0+_)}function $(E,_){const F=i.get(E);if(E.version>0&&F.__version!==E.version){X(F,E,_);return}n.bindTexture(e.TEXTURE_3D,F.__webglTexture,e.TEXTURE0+_)}function z(E,_){const F=i.get(E);if(E.version>0&&F.__version!==E.version){et(F,E,_);return}n.bindTexture(e.TEXTURE_CUBE_MAP,F.__webglTexture,e.TEXTURE0+_)}const it={[Rl]:e.REPEAT,[Pr]:e.CLAMP_TO_EDGE,[Cl]:e.MIRRORED_REPEAT},ht={[Qn]:e.NEAREST,[Cg]:e.NEAREST_MIPMAP_NEAREST,[Oo]:e.NEAREST_MIPMAP_LINEAR,[di]:e.LINEAR,[xc]:e.LINEAR_MIPMAP_NEAREST,[Lr]:e.LINEAR_MIPMAP_LINEAR},Et={[Ug]:e.NEVER,[zg]:e.ALWAYS,[Ng]:e.LESS,[Mp]:e.LEQUAL,[Fg]:e.EQUAL,[kg]:e.GEQUAL,[Og]:e.GREATER,[Bg]:e.NOTEQUAL};function Vt(E,_){if(_.type===Di&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===di||_.magFilter===xc||_.magFilter===Oo||_.magFilter===Lr||_.minFilter===di||_.minFilter===xc||_.minFilter===Oo||_.minFilter===Lr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(E,e.TEXTURE_WRAP_S,it[_.wrapS]),e.texParameteri(E,e.TEXTURE_WRAP_T,it[_.wrapT]),(E===e.TEXTURE_3D||E===e.TEXTURE_2D_ARRAY)&&e.texParameteri(E,e.TEXTURE_WRAP_R,it[_.wrapR]),e.texParameteri(E,e.TEXTURE_MAG_FILTER,ht[_.magFilter]),e.texParameteri(E,e.TEXTURE_MIN_FILTER,ht[_.minFilter]),_.compareFunction&&(e.texParameteri(E,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(E,e.TEXTURE_COMPARE_FUNC,Et[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Qn||_.minFilter!==Oo&&_.minFilter!==Lr||_.type===Di&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){const F=t.get("EXT_texture_filter_anisotropic");e.texParameterf(E,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,r.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function le(E,_){let F=!1;E.__webglInit===void 0&&(E.__webglInit=!0,_.addEventListener("dispose",R));const q=_.source;let Z=f.get(q);Z===void 0&&(Z={},f.set(q,Z));const W=j(_);if(W!==E.__cacheKey){Z[W]===void 0&&(Z[W]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,F=!0),Z[W].usedTimes++;const Tt=Z[E.__cacheKey];Tt!==void 0&&(Z[E.__cacheKey].usedTimes--,Tt.usedTimes===0&&y(_)),E.__cacheKey=W,E.__webglTexture=Z[W].texture}return F}function X(E,_,F){let q=e.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(q=e.TEXTURE_2D_ARRAY),_.isData3DTexture&&(q=e.TEXTURE_3D);const Z=le(E,_),W=_.source;n.bindTexture(q,E.__webglTexture,e.TEXTURE0+F);const Tt=i.get(W);if(W.version!==Tt.__version||Z===!0){n.activeTexture(e.TEXTURE0+F);const ot=$t.getPrimaries($t.workingColorSpace),dt=_.colorSpace===nr?null:$t.getPrimaries(_.colorSpace),Kt=_.colorSpace===nr||ot===dt?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Kt);let J=v(_.image,!1,r.maxTextureSize);J=me(_,J);const pt=s.convert(_.format,_.colorSpace),Pt=s.convert(_.type);let Dt=T(_.internalFormat,pt,Pt,_.colorSpace,_.isVideoTexture);Vt(q,_);let mt;const Yt=_.mipmaps,kt=_.isVideoTexture!==!0,ue=Tt.__version===void 0||Z===!0,C=W.dataReady,rt=N(_,J);if(_.isDepthTexture)Dt=S(_.format===xs,_.type),ue&&(kt?n.texStorage2D(e.TEXTURE_2D,1,Dt,J.width,J.height):n.texImage2D(e.TEXTURE_2D,0,Dt,J.width,J.height,0,pt,Pt,null));else if(_.isDataTexture)if(Yt.length>0){kt&&ue&&n.texStorage2D(e.TEXTURE_2D,rt,Dt,Yt[0].width,Yt[0].height);for(let V=0,Y=Yt.length;V<Y;V++)mt=Yt[V],kt?C&&n.texSubImage2D(e.TEXTURE_2D,V,0,0,mt.width,mt.height,pt,Pt,mt.data):n.texImage2D(e.TEXTURE_2D,V,Dt,mt.width,mt.height,0,pt,Pt,mt.data);_.generateMipmaps=!1}else kt?(ue&&n.texStorage2D(e.TEXTURE_2D,rt,Dt,J.width,J.height),C&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,J.width,J.height,pt,Pt,J.data)):n.texImage2D(e.TEXTURE_2D,0,Dt,J.width,J.height,0,pt,Pt,J.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){kt&&ue&&n.texStorage3D(e.TEXTURE_2D_ARRAY,rt,Dt,Yt[0].width,Yt[0].height,J.depth);for(let V=0,Y=Yt.length;V<Y;V++)if(mt=Yt[V],_.format!==Zn)if(pt!==null)if(kt){if(C)if(_.layerUpdates.size>0){const lt=Zf(mt.width,mt.height,_.format,_.type);for(const at of _.layerUpdates){const Ft=mt.data.subarray(at*lt/mt.data.BYTES_PER_ELEMENT,(at+1)*lt/mt.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,V,0,0,at,mt.width,mt.height,1,pt,Ft)}_.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,V,0,0,0,mt.width,mt.height,J.depth,pt,mt.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,V,Dt,mt.width,mt.height,J.depth,0,mt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else kt?C&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,V,0,0,0,mt.width,mt.height,J.depth,pt,Pt,mt.data):n.texImage3D(e.TEXTURE_2D_ARRAY,V,Dt,mt.width,mt.height,J.depth,0,pt,Pt,mt.data)}else{kt&&ue&&n.texStorage2D(e.TEXTURE_2D,rt,Dt,Yt[0].width,Yt[0].height);for(let V=0,Y=Yt.length;V<Y;V++)mt=Yt[V],_.format!==Zn?pt!==null?kt?C&&n.compressedTexSubImage2D(e.TEXTURE_2D,V,0,0,mt.width,mt.height,pt,mt.data):n.compressedTexImage2D(e.TEXTURE_2D,V,Dt,mt.width,mt.height,0,mt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):kt?C&&n.texSubImage2D(e.TEXTURE_2D,V,0,0,mt.width,mt.height,pt,Pt,mt.data):n.texImage2D(e.TEXTURE_2D,V,Dt,mt.width,mt.height,0,pt,Pt,mt.data)}else if(_.isDataArrayTexture)if(kt){if(ue&&n.texStorage3D(e.TEXTURE_2D_ARRAY,rt,Dt,J.width,J.height,J.depth),C)if(_.layerUpdates.size>0){const V=Zf(J.width,J.height,_.format,_.type);for(const Y of _.layerUpdates){const lt=J.data.subarray(Y*V/J.data.BYTES_PER_ELEMENT,(Y+1)*V/J.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,Y,J.width,J.height,1,pt,Pt,lt)}_.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,pt,Pt,J.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,Dt,J.width,J.height,J.depth,0,pt,Pt,J.data);else if(_.isData3DTexture)kt?(ue&&n.texStorage3D(e.TEXTURE_3D,rt,Dt,J.width,J.height,J.depth),C&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,pt,Pt,J.data)):n.texImage3D(e.TEXTURE_3D,0,Dt,J.width,J.height,J.depth,0,pt,Pt,J.data);else if(_.isFramebufferTexture){if(ue)if(kt)n.texStorage2D(e.TEXTURE_2D,rt,Dt,J.width,J.height);else{let V=J.width,Y=J.height;for(let lt=0;lt<rt;lt++)n.texImage2D(e.TEXTURE_2D,lt,Dt,V,Y,0,pt,Pt,null),V>>=1,Y>>=1}}else if(Yt.length>0){if(kt&&ue){const V=Rt(Yt[0]);n.texStorage2D(e.TEXTURE_2D,rt,Dt,V.width,V.height)}for(let V=0,Y=Yt.length;V<Y;V++)mt=Yt[V],kt?C&&n.texSubImage2D(e.TEXTURE_2D,V,0,0,pt,Pt,mt):n.texImage2D(e.TEXTURE_2D,V,Dt,pt,Pt,mt);_.generateMipmaps=!1}else if(kt){if(ue){const V=Rt(J);n.texStorage2D(e.TEXTURE_2D,rt,Dt,V.width,V.height)}C&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,pt,Pt,J)}else n.texImage2D(e.TEXTURE_2D,0,Dt,pt,Pt,J);m(_)&&d(q),Tt.__version=W.version,_.onUpdate&&_.onUpdate(_)}E.__version=_.version}function et(E,_,F){if(_.image.length!==6)return;const q=le(E,_),Z=_.source;n.bindTexture(e.TEXTURE_CUBE_MAP,E.__webglTexture,e.TEXTURE0+F);const W=i.get(Z);if(Z.version!==W.__version||q===!0){n.activeTexture(e.TEXTURE0+F);const Tt=$t.getPrimaries($t.workingColorSpace),ot=_.colorSpace===nr?null:$t.getPrimaries(_.colorSpace),dt=_.colorSpace===nr||Tt===ot?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,dt);const Kt=_.isCompressedTexture||_.image[0].isCompressedTexture,J=_.image[0]&&_.image[0].isDataTexture,pt=[];for(let Y=0;Y<6;Y++)!Kt&&!J?pt[Y]=v(_.image[Y],!0,r.maxCubemapSize):pt[Y]=J?_.image[Y].image:_.image[Y],pt[Y]=me(_,pt[Y]);const Pt=pt[0],Dt=s.convert(_.format,_.colorSpace),mt=s.convert(_.type),Yt=T(_.internalFormat,Dt,mt,_.colorSpace),kt=_.isVideoTexture!==!0,ue=W.__version===void 0||q===!0,C=Z.dataReady;let rt=N(_,Pt);Vt(e.TEXTURE_CUBE_MAP,_);let V;if(Kt){kt&&ue&&n.texStorage2D(e.TEXTURE_CUBE_MAP,rt,Yt,Pt.width,Pt.height);for(let Y=0;Y<6;Y++){V=pt[Y].mipmaps;for(let lt=0;lt<V.length;lt++){const at=V[lt];_.format!==Zn?Dt!==null?kt?C&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,lt,0,0,at.width,at.height,Dt,at.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,lt,Yt,at.width,at.height,0,at.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):kt?C&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,lt,0,0,at.width,at.height,Dt,mt,at.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,lt,Yt,at.width,at.height,0,Dt,mt,at.data)}}}else{if(V=_.mipmaps,kt&&ue){V.length>0&&rt++;const Y=Rt(pt[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,rt,Yt,Y.width,Y.height)}for(let Y=0;Y<6;Y++)if(J){kt?C&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,pt[Y].width,pt[Y].height,Dt,mt,pt[Y].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,Yt,pt[Y].width,pt[Y].height,0,Dt,mt,pt[Y].data);for(let lt=0;lt<V.length;lt++){const Ft=V[lt].image[Y].image;kt?C&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,lt+1,0,0,Ft.width,Ft.height,Dt,mt,Ft.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,lt+1,Yt,Ft.width,Ft.height,0,Dt,mt,Ft.data)}}else{kt?C&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,Dt,mt,pt[Y]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,Yt,Dt,mt,pt[Y]);for(let lt=0;lt<V.length;lt++){const at=V[lt];kt?C&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,lt+1,0,0,Dt,mt,at.image[Y]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Y,lt+1,Yt,Dt,mt,at.image[Y])}}}m(_)&&d(e.TEXTURE_CUBE_MAP),W.__version=Z.version,_.onUpdate&&_.onUpdate(_)}E.__version=_.version}function yt(E,_,F,q,Z,W){const Tt=s.convert(F.format,F.colorSpace),ot=s.convert(F.type),dt=T(F.internalFormat,Tt,ot,F.colorSpace),Kt=i.get(_),J=i.get(F);if(J.__renderTarget=_,!Kt.__hasExternalTextures){const pt=Math.max(1,_.width>>W),Pt=Math.max(1,_.height>>W);Z===e.TEXTURE_3D||Z===e.TEXTURE_2D_ARRAY?n.texImage3D(Z,W,dt,pt,Pt,_.depth,0,Tt,ot,null):n.texImage2D(Z,W,dt,pt,Pt,0,Tt,ot,null)}n.bindFramebuffer(e.FRAMEBUFFER,E),qt(_)?a.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,q,Z,J.__webglTexture,0,Xt(_)):(Z===e.TEXTURE_2D||Z>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,q,Z,J.__webglTexture,W),n.bindFramebuffer(e.FRAMEBUFFER,null)}function st(E,_,F){if(e.bindRenderbuffer(e.RENDERBUFFER,E),_.depthBuffer){const q=_.depthTexture,Z=q&&q.isDepthTexture?q.type:null,W=S(_.stencilBuffer,Z),Tt=_.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ot=Xt(_);qt(_)?a.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ot,W,_.width,_.height):F?e.renderbufferStorageMultisample(e.RENDERBUFFER,ot,W,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,W,_.width,_.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,Tt,e.RENDERBUFFER,E)}else{const q=_.textures;for(let Z=0;Z<q.length;Z++){const W=q[Z],Tt=s.convert(W.format,W.colorSpace),ot=s.convert(W.type),dt=T(W.internalFormat,Tt,ot,W.colorSpace),Kt=Xt(_);F&&qt(_)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,Kt,dt,_.width,_.height):qt(_)?a.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Kt,dt,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,dt,_.width,_.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Lt(E,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(e.FRAMEBUFFER,E),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const q=i.get(_.depthTexture);q.__renderTarget=_,(!q.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),K(_.depthTexture,0);const Z=q.__webglTexture,W=Xt(_);if(_.depthTexture.format===us)qt(_)?a.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,Z,0,W):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,Z,0);else if(_.depthTexture.format===xs)qt(_)?a.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,Z,0,W):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function Nt(E){const _=i.get(E),F=E.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==E.depthTexture){const q=E.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),q){const Z=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,q.removeEventListener("dispose",Z)};q.addEventListener("dispose",Z),_.__depthDisposeCallback=Z}_.__boundDepthTexture=q}if(E.depthTexture&&!_.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");Lt(_.__webglFramebuffer,E)}else if(F){_.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer[q]),_.__webglDepthbuffer[q]===void 0)_.__webglDepthbuffer[q]=e.createRenderbuffer(),st(_.__webglDepthbuffer[q],E,!1);else{const Z=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,W=_.__webglDepthbuffer[q];e.bindRenderbuffer(e.RENDERBUFFER,W),e.framebufferRenderbuffer(e.FRAMEBUFFER,Z,e.RENDERBUFFER,W)}}else if(n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=e.createRenderbuffer(),st(_.__webglDepthbuffer,E,!1);else{const q=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,Z=_.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,Z),e.framebufferRenderbuffer(e.FRAMEBUFFER,q,e.RENDERBUFFER,Z)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function Gt(E,_,F){const q=i.get(E);_!==void 0&&yt(q.__webglFramebuffer,E,E.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),F!==void 0&&Nt(E)}function Ae(E){const _=E.texture,F=i.get(E),q=i.get(_);E.addEventListener("dispose",b);const Z=E.textures,W=E.isWebGLCubeRenderTarget===!0,Tt=Z.length>1;if(Tt||(q.__webglTexture===void 0&&(q.__webglTexture=e.createTexture()),q.__version=_.version,o.memory.textures++),W){F.__webglFramebuffer=[];for(let ot=0;ot<6;ot++)if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer[ot]=[];for(let dt=0;dt<_.mipmaps.length;dt++)F.__webglFramebuffer[ot][dt]=e.createFramebuffer()}else F.__webglFramebuffer[ot]=e.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){F.__webglFramebuffer=[];for(let ot=0;ot<_.mipmaps.length;ot++)F.__webglFramebuffer[ot]=e.createFramebuffer()}else F.__webglFramebuffer=e.createFramebuffer();if(Tt)for(let ot=0,dt=Z.length;ot<dt;ot++){const Kt=i.get(Z[ot]);Kt.__webglTexture===void 0&&(Kt.__webglTexture=e.createTexture(),o.memory.textures++)}if(E.samples>0&&qt(E)===!1){F.__webglMultisampledFramebuffer=e.createFramebuffer(),F.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let ot=0;ot<Z.length;ot++){const dt=Z[ot];F.__webglColorRenderbuffer[ot]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,F.__webglColorRenderbuffer[ot]);const Kt=s.convert(dt.format,dt.colorSpace),J=s.convert(dt.type),pt=T(dt.internalFormat,Kt,J,dt.colorSpace,E.isXRRenderTarget===!0),Pt=Xt(E);e.renderbufferStorageMultisample(e.RENDERBUFFER,Pt,pt,E.width,E.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ot,e.RENDERBUFFER,F.__webglColorRenderbuffer[ot])}e.bindRenderbuffer(e.RENDERBUFFER,null),E.depthBuffer&&(F.__webglDepthRenderbuffer=e.createRenderbuffer(),st(F.__webglDepthRenderbuffer,E,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(W){n.bindTexture(e.TEXTURE_CUBE_MAP,q.__webglTexture),Vt(e.TEXTURE_CUBE_MAP,_);for(let ot=0;ot<6;ot++)if(_.mipmaps&&_.mipmaps.length>0)for(let dt=0;dt<_.mipmaps.length;dt++)yt(F.__webglFramebuffer[ot][dt],E,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+ot,dt);else yt(F.__webglFramebuffer[ot],E,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0);m(_)&&d(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(Tt){for(let ot=0,dt=Z.length;ot<dt;ot++){const Kt=Z[ot],J=i.get(Kt);n.bindTexture(e.TEXTURE_2D,J.__webglTexture),Vt(e.TEXTURE_2D,Kt),yt(F.__webglFramebuffer,E,Kt,e.COLOR_ATTACHMENT0+ot,e.TEXTURE_2D,0),m(Kt)&&d(e.TEXTURE_2D)}n.unbindTexture()}else{let ot=e.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(ot=E.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(ot,q.__webglTexture),Vt(ot,_),_.mipmaps&&_.mipmaps.length>0)for(let dt=0;dt<_.mipmaps.length;dt++)yt(F.__webglFramebuffer[dt],E,_,e.COLOR_ATTACHMENT0,ot,dt);else yt(F.__webglFramebuffer,E,_,e.COLOR_ATTACHMENT0,ot,0);m(_)&&d(ot),n.unbindTexture()}E.depthBuffer&&Nt(E)}function jt(E){const _=E.textures;for(let F=0,q=_.length;F<q;F++){const Z=_[F];if(m(Z)){const W=A(E),Tt=i.get(Z).__webglTexture;n.bindTexture(W,Tt),d(W),n.unbindTexture()}}}const Ne=[],I=[];function Ln(E){if(E.samples>0){if(qt(E)===!1){const _=E.textures,F=E.width,q=E.height;let Z=e.COLOR_BUFFER_BIT;const W=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,Tt=i.get(E),ot=_.length>1;if(ot)for(let dt=0;dt<_.length;dt++)n.bindFramebuffer(e.FRAMEBUFFER,Tt.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+dt,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,Tt.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+dt,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,Tt.__webglMultisampledFramebuffer),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,Tt.__webglFramebuffer);for(let dt=0;dt<_.length;dt++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(Z|=e.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(Z|=e.STENCIL_BUFFER_BIT)),ot){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,Tt.__webglColorRenderbuffer[dt]);const Kt=i.get(_[dt]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,Kt,0)}e.blitFramebuffer(0,0,F,q,0,0,F,q,Z,e.NEAREST),c===!0&&(Ne.length=0,I.length=0,Ne.push(e.COLOR_ATTACHMENT0+dt),E.depthBuffer&&E.resolveDepthBuffer===!1&&(Ne.push(W),I.push(W),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,I)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Ne))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),ot)for(let dt=0;dt<_.length;dt++){n.bindFramebuffer(e.FRAMEBUFFER,Tt.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+dt,e.RENDERBUFFER,Tt.__webglColorRenderbuffer[dt]);const Kt=i.get(_[dt]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,Tt.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+dt,e.TEXTURE_2D,Kt,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,Tt.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&c){const _=E.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[_])}}}function Xt(E){return Math.min(r.maxSamples,E.samples)}function qt(E){const _=i.get(E);return E.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function Ct(E){const _=o.render.frame;h.get(E)!==_&&(h.set(E,_),E.update())}function me(E,_){const F=E.colorSpace,q=E.format,Z=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||F!==Ls&&F!==nr&&($t.getTransfer(F)===ae?(q!==Zn||Z!==ki)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),_}function Rt(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(l.width=E.naturalWidth||E.width,l.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(l.width=E.displayWidth,l.height=E.displayHeight):(l.width=E.width,l.height=E.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=G,this.setTexture2D=K,this.setTexture2DArray=H,this.setTexture3D=$,this.setTextureCube=z,this.rebindTextures=Gt,this.setupRenderTarget=Ae,this.updateRenderTargetMipmap=jt,this.updateMultisampleRenderTarget=Ln,this.setupDepthRenderbuffer=Nt,this.setupFrameBufferTexture=yt,this.useMultisampledRTT=qt}function Xx(e,t){function n(i,r=nr){let s;const o=$t.getTransfer(r);if(i===ki)return e.UNSIGNED_BYTE;if(i===Uh)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Nh)return e.UNSIGNED_SHORT_5_5_5_1;if(i===fp)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===hp)return e.BYTE;if(i===up)return e.SHORT;if(i===po)return e.UNSIGNED_SHORT;if(i===Ih)return e.INT;if(i===Br)return e.UNSIGNED_INT;if(i===Di)return e.FLOAT;if(i===Mo)return e.HALF_FLOAT;if(i===dp)return e.ALPHA;if(i===pp)return e.RGB;if(i===Zn)return e.RGBA;if(i===mp)return e.LUMINANCE;if(i===gp)return e.LUMINANCE_ALPHA;if(i===us)return e.DEPTH_COMPONENT;if(i===xs)return e.DEPTH_STENCIL;if(i===_p)return e.RED;if(i===Fh)return e.RED_INTEGER;if(i===vp)return e.RG;if(i===Oh)return e.RG_INTEGER;if(i===Bh)return e.RGBA_INTEGER;if(i===ma||i===ga||i===_a||i===va)if(o===ae)if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===ma)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===ga)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===_a)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===va)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===ma)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===ga)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===_a)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===va)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Pl||i===Ll||i===Dl||i===Il)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===Pl)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ll)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Dl)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Il)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ul||i===Nl||i===Fl)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(i===Ul||i===Nl)return o===ae?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Fl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Ol||i===Bl||i===kl||i===zl||i===Vl||i===Gl||i===Hl||i===Wl||i===Xl||i===ql||i===Yl||i===jl||i===Kl||i===$l)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(i===Ol)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Bl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===kl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===zl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Vl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Gl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Hl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Wl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Xl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ql)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Yl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===jl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Kl)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===$l)return o===ae?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===xa||i===Zl||i===Jl)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(i===xa)return o===ae?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Zl)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Jl)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===xp||i===Ql||i===th||i===eh)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(i===xa)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Ql)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===th)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===eh)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===vs?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:n}}class qx extends Bn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class eo extends gn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Yx={type:"move"};class jc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new eo,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new eo,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new eo,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const n=this._hand;if(n)for(const i of t.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,n,i){let r=null,s=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(t&&n.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(const v of t.hand.values()){const m=n.getJointPose(v,i),d=this._getHandJoint(l,v);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],f=h.position.distanceTo(u.position),p=.02,g=.005;l.inputState.pinching&&f>p+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&f<=p-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(s=n.getPose(t.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(r=n.getPose(t.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Yx)))}return a!==null&&(a.visible=r!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,n){if(t.joints[n.jointName]===void 0){const i=new eo;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[n.jointName]=i,t.add(i)}return t.joints[n.jointName]}}const jx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Kx=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class $x{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,n,i){if(this.texture===null){const r=new mn,s=t.properties.get(r);s.__webglTexture=n.texture,(n.depthNear!=i.depthNear||n.depthFar!=i.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=r}}getMesh(t){if(this.texture!==null&&this.mesh===null){const n=t.cameras[0].viewport,i=new zi({vertexShader:jx,fragmentShader:Kx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Ui(new Ya(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Zx extends Ds{constructor(t,n){super();const i=this;let r=null,s=1,o=null,a="local-floor",c=1,l=null,h=null,u=null,f=null,p=null,g=null;const v=new $x,m=n.getContextAttributes();let d=null,A=null;const T=[],S=[],N=new ee;let R=null;const b=new Bn;b.viewport=new Oe;const D=new Bn;D.viewport=new Oe;const y=[b,D],x=new qx;let w=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let et=T[X];return et===void 0&&(et=new jc,T[X]=et),et.getTargetRaySpace()},this.getControllerGrip=function(X){let et=T[X];return et===void 0&&(et=new jc,T[X]=et),et.getGripSpace()},this.getHand=function(X){let et=T[X];return et===void 0&&(et=new jc,T[X]=et),et.getHandSpace()};function k(X){const et=S.indexOf(X.inputSource);if(et===-1)return;const yt=T[et];yt!==void 0&&(yt.update(X.inputSource,X.frame,l||o),yt.dispatchEvent({type:X.type,data:X.inputSource}))}function j(){r.removeEventListener("select",k),r.removeEventListener("selectstart",k),r.removeEventListener("selectend",k),r.removeEventListener("squeeze",k),r.removeEventListener("squeezestart",k),r.removeEventListener("squeezeend",k),r.removeEventListener("end",j),r.removeEventListener("inputsourceschange",K);for(let X=0;X<T.length;X++){const et=S[X];et!==null&&(S[X]=null,T[X].disconnect(et))}w=null,G=null,v.reset(),t.setRenderTarget(d),p=null,f=null,u=null,r=null,A=null,le.stop(),i.isPresenting=!1,t.setPixelRatio(R),t.setSize(N.width,N.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){s=X,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(X){l=X},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(X){if(r=X,r!==null){if(d=t.getRenderTarget(),r.addEventListener("select",k),r.addEventListener("selectstart",k),r.addEventListener("selectend",k),r.addEventListener("squeeze",k),r.addEventListener("squeezestart",k),r.addEventListener("squeezeend",k),r.addEventListener("end",j),r.addEventListener("inputsourceschange",K),m.xrCompatible!==!0&&await n.makeXRCompatible(),R=t.getPixelRatio(),t.getSize(N),r.renderState.layers===void 0){const et={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,n,et),r.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),A=new kr(p.framebufferWidth,p.framebufferHeight,{format:Zn,type:ki,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let et=null,yt=null,st=null;m.depth&&(st=m.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,et=m.stencil?xs:us,yt=m.stencil?vs:Br);const Lt={colorFormat:n.RGBA8,depthFormat:st,scaleFactor:s};u=new XRWebGLBinding(r,n),f=u.createProjectionLayer(Lt),r.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),A=new kr(f.textureWidth,f.textureHeight,{format:Zn,type:ki,depthTexture:new Np(f.textureWidth,f.textureHeight,yt,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}A.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await r.requestReferenceSpace(a),le.setContext(r),le.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function K(X){for(let et=0;et<X.removed.length;et++){const yt=X.removed[et],st=S.indexOf(yt);st>=0&&(S[st]=null,T[st].disconnect(yt))}for(let et=0;et<X.added.length;et++){const yt=X.added[et];let st=S.indexOf(yt);if(st===-1){for(let Nt=0;Nt<T.length;Nt++)if(Nt>=S.length){S.push(yt),st=Nt;break}else if(S[Nt]===null){S[Nt]=yt,st=Nt;break}if(st===-1)break}const Lt=T[st];Lt&&Lt.connect(yt)}}const H=new U,$=new U;function z(X,et,yt){H.setFromMatrixPosition(et.matrixWorld),$.setFromMatrixPosition(yt.matrixWorld);const st=H.distanceTo($),Lt=et.projectionMatrix.elements,Nt=yt.projectionMatrix.elements,Gt=Lt[14]/(Lt[10]-1),Ae=Lt[14]/(Lt[10]+1),jt=(Lt[9]+1)/Lt[5],Ne=(Lt[9]-1)/Lt[5],I=(Lt[8]-1)/Lt[0],Ln=(Nt[8]+1)/Nt[0],Xt=Gt*I,qt=Gt*Ln,Ct=st/(-I+Ln),me=Ct*-I;if(et.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(me),X.translateZ(Ct),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),Lt[10]===-1)X.projectionMatrix.copy(et.projectionMatrix),X.projectionMatrixInverse.copy(et.projectionMatrixInverse);else{const Rt=Gt+Ct,E=Ae+Ct,_=Xt-me,F=qt+(st-me),q=jt*Ae/E*Rt,Z=Ne*Ae/E*Rt;X.projectionMatrix.makePerspective(_,F,q,Z,Rt,E),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function it(X,et){et===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(et.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(r===null)return;let et=X.near,yt=X.far;v.texture!==null&&(v.depthNear>0&&(et=v.depthNear),v.depthFar>0&&(yt=v.depthFar)),x.near=D.near=b.near=et,x.far=D.far=b.far=yt,(w!==x.near||G!==x.far)&&(r.updateRenderState({depthNear:x.near,depthFar:x.far}),w=x.near,G=x.far),b.layers.mask=X.layers.mask|2,D.layers.mask=X.layers.mask|4,x.layers.mask=b.layers.mask|D.layers.mask;const st=X.parent,Lt=x.cameras;it(x,st);for(let Nt=0;Nt<Lt.length;Nt++)it(Lt[Nt],st);Lt.length===2?z(x,b,D):x.projectionMatrix.copy(b.projectionMatrix),ht(X,x,st)};function ht(X,et,yt){yt===null?X.matrix.copy(et.matrixWorld):(X.matrix.copy(yt.matrixWorld),X.matrix.invert(),X.matrix.multiply(et.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(et.projectionMatrix),X.projectionMatrixInverse.copy(et.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=nh*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(f===null&&p===null))return c},this.setFoveation=function(X){c=X,f!==null&&(f.fixedFoveation=X),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=X)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(x)};let Et=null;function Vt(X,et){if(h=et.getViewerPose(l||o),g=et,h!==null){const yt=h.views;p!==null&&(t.setRenderTargetFramebuffer(A,p.framebuffer),t.setRenderTarget(A));let st=!1;yt.length!==x.cameras.length&&(x.cameras.length=0,st=!0);for(let Nt=0;Nt<yt.length;Nt++){const Gt=yt[Nt];let Ae=null;if(p!==null)Ae=p.getViewport(Gt);else{const Ne=u.getViewSubImage(f,Gt);Ae=Ne.viewport,Nt===0&&(t.setRenderTargetTextures(A,Ne.colorTexture,f.ignoreDepthValues?void 0:Ne.depthStencilTexture),t.setRenderTarget(A))}let jt=y[Nt];jt===void 0&&(jt=new Bn,jt.layers.enable(Nt),jt.viewport=new Oe,y[Nt]=jt),jt.matrix.fromArray(Gt.transform.matrix),jt.matrix.decompose(jt.position,jt.quaternion,jt.scale),jt.projectionMatrix.fromArray(Gt.projectionMatrix),jt.projectionMatrixInverse.copy(jt.projectionMatrix).invert(),jt.viewport.set(Ae.x,Ae.y,Ae.width,Ae.height),Nt===0&&(x.matrix.copy(jt.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),st===!0&&x.cameras.push(jt)}const Lt=r.enabledFeatures;if(Lt&&Lt.includes("depth-sensing")){const Nt=u.getDepthInformation(yt[0]);Nt&&Nt.isValid&&Nt.texture&&v.init(t,Nt,r.renderState)}}for(let yt=0;yt<T.length;yt++){const st=S[yt],Lt=T[yt];st!==null&&Lt!==void 0&&Lt.update(st,et,l||o)}Et&&Et(X,et),et.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:et}),g=null}const le=new Up;le.setAnimationLoop(Vt),this.setAnimationLoop=function(X){Et=X},this.dispose=function(){}}}const yr=new pi,Jx=new De;function Qx(e,t){function n(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,Pp(e)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function r(m,d,A,T,S){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(m,d):d.isMeshToonMaterial?(s(m,d),u(m,d)):d.isMeshPhongMaterial?(s(m,d),h(m,d)):d.isMeshStandardMaterial?(s(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,S)):d.isMeshMatcapMaterial?(s(m,d),g(m,d)):d.isMeshDepthMaterial?s(m,d):d.isMeshDistanceMaterial?(s(m,d),v(m,d)):d.isMeshNormalMaterial?s(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?c(m,d,A,T):d.isSpriteMaterial?l(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,n(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===pn&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,n(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===pn&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,n(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,n(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,n(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const A=t.get(d),T=A.envMap,S=A.envMapRotation;T&&(m.envMap.value=T,yr.copy(S),yr.x*=-1,yr.y*=-1,yr.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(yr.y*=-1,yr.z*=-1),m.envMapRotation.value.setFromMatrix4(Jx.makeRotationFromEuler(yr)),m.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,n(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,n(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function c(m,d,A,T){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*A,m.scale.value=T*.5,d.map&&(m.map.value=d.map,n(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function l(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,n(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,n(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,A){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,n(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,n(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,n(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,n(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,n(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===pn&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,n(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,n(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=A.texture,m.transmissionSamplerSize.value.set(A.width,A.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,n(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,n(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,n(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,n(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,n(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function v(m,d){const A=t.get(d).light;m.referencePosition.value.setFromMatrixPosition(A.matrixWorld),m.nearDistance.value=A.shadow.camera.near,m.farDistance.value=A.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function t3(e,t,n,i){let r={},s={},o=[];const a=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(A,T){const S=T.program;i.uniformBlockBinding(A,S)}function l(A,T){let S=r[A.id];S===void 0&&(g(A),S=h(A),r[A.id]=S,A.addEventListener("dispose",m));const N=T.program;i.updateUBOMapping(A,N);const R=t.render.frame;s[A.id]!==R&&(f(A),s[A.id]=R)}function h(A){const T=u();A.__bindingPointIndex=T;const S=e.createBuffer(),N=A.__size,R=A.usage;return e.bindBuffer(e.UNIFORM_BUFFER,S),e.bufferData(e.UNIFORM_BUFFER,N,R),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,T,S),S}function u(){for(let A=0;A<a;A++)if(o.indexOf(A)===-1)return o.push(A),A;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(A){const T=r[A.id],S=A.uniforms,N=A.__cache;e.bindBuffer(e.UNIFORM_BUFFER,T);for(let R=0,b=S.length;R<b;R++){const D=Array.isArray(S[R])?S[R]:[S[R]];for(let y=0,x=D.length;y<x;y++){const w=D[y];if(p(w,R,y,N)===!0){const G=w.__offset,k=Array.isArray(w.value)?w.value:[w.value];let j=0;for(let K=0;K<k.length;K++){const H=k[K],$=v(H);typeof H=="number"||typeof H=="boolean"?(w.__data[0]=H,e.bufferSubData(e.UNIFORM_BUFFER,G+j,w.__data)):H.isMatrix3?(w.__data[0]=H.elements[0],w.__data[1]=H.elements[1],w.__data[2]=H.elements[2],w.__data[3]=0,w.__data[4]=H.elements[3],w.__data[5]=H.elements[4],w.__data[6]=H.elements[5],w.__data[7]=0,w.__data[8]=H.elements[6],w.__data[9]=H.elements[7],w.__data[10]=H.elements[8],w.__data[11]=0):(H.toArray(w.__data,j),j+=$.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,G,w.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(A,T,S,N){const R=A.value,b=T+"_"+S;if(N[b]===void 0)return typeof R=="number"||typeof R=="boolean"?N[b]=R:N[b]=R.clone(),!0;{const D=N[b];if(typeof R=="number"||typeof R=="boolean"){if(D!==R)return N[b]=R,!0}else if(D.equals(R)===!1)return D.copy(R),!0}return!1}function g(A){const T=A.uniforms;let S=0;const N=16;for(let b=0,D=T.length;b<D;b++){const y=Array.isArray(T[b])?T[b]:[T[b]];for(let x=0,w=y.length;x<w;x++){const G=y[x],k=Array.isArray(G.value)?G.value:[G.value];for(let j=0,K=k.length;j<K;j++){const H=k[j],$=v(H),z=S%N,it=z%$.boundary,ht=z+it;S+=it,ht!==0&&N-ht<$.storage&&(S+=N-ht),G.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),G.__offset=S,S+=$.storage}}}const R=S%N;return R>0&&(S+=N-R),A.__size=S,A.__cache={},this}function v(A){const T={boundary:0,storage:0};return typeof A=="number"||typeof A=="boolean"?(T.boundary=4,T.storage=4):A.isVector2?(T.boundary=8,T.storage=8):A.isVector3||A.isColor?(T.boundary=16,T.storage=12):A.isVector4?(T.boundary=16,T.storage=16):A.isMatrix3?(T.boundary=48,T.storage=48):A.isMatrix4?(T.boundary=64,T.storage=64):A.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",A),T}function m(A){const T=A.target;T.removeEventListener("dispose",m);const S=o.indexOf(T.__bindingPointIndex);o.splice(S,1),e.deleteBuffer(r[T.id]),delete r[T.id],delete s[T.id]}function d(){for(const A in r)e.deleteBuffer(r[A]);o=[],r={},s={}}return{bind:c,update:l,dispose:d}}class e3{constructor(t={}){const{canvas:n=Gg(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=t;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=o;const g=new Uint32Array(4),v=new Int32Array(4);let m=null,d=null;const A=[],T=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=On,this.toneMapping=sr,this.toneMappingExposure=1;const S=this;let N=!1,R=0,b=0,D=null,y=-1,x=null;const w=new Oe,G=new Oe;let k=null;const j=new oe(0);let K=0,H=n.width,$=n.height,z=1,it=null,ht=null;const Et=new Oe(0,0,H,$),Vt=new Oe(0,0,H,$);let le=!1;const X=new Ip;let et=!1,yt=!1;const st=new De,Lt=new De,Nt=new U,Gt=new Oe,Ae={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let jt=!1;function Ne(){return D===null?z:1}let I=i;function Ln(M,P){return n.getContext(M,P)}try{const M={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${Dh}`),n.addEventListener("webglcontextlost",Y,!1),n.addEventListener("webglcontextrestored",lt,!1),n.addEventListener("webglcontextcreationerror",at,!1),I===null){const P="webgl2";if(I=Ln(P,M),I===null)throw Ln(P)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let Xt,qt,Ct,me,Rt,E,_,F,q,Z,W,Tt,ot,dt,Kt,J,pt,Pt,Dt,mt,Yt,kt,ue,C;function rt(){Xt=new ov(I),Xt.init(),kt=new Xx(I,Xt),qt=new Q2(I,Xt,t,kt),Ct=new Gx(I,Xt),qt.reverseDepthBuffer&&f&&Ct.buffers.depth.setReversed(!0),me=new lv(I),Rt=new wx,E=new Wx(I,Xt,Ct,Rt,qt,kt,me),_=new ev(S),F=new sv(S),q=new m_(I),ue=new Z2(I,q),Z=new av(I,q,me,ue),W=new uv(I,Z,q,me),Dt=new hv(I,qt,E),J=new tv(Rt),Tt=new bx(S,_,F,Xt,qt,ue,J),ot=new Qx(S,Rt),dt=new Cx,Kt=new Nx(Xt),Pt=new $2(S,_,F,Ct,W,p,c),pt=new zx(S,W,qt),C=new t3(I,me,qt,Ct),mt=new J2(I,Xt,me),Yt=new cv(I,Xt,me),me.programs=Tt.programs,S.capabilities=qt,S.extensions=Xt,S.properties=Rt,S.renderLists=dt,S.shadowMap=pt,S.state=Ct,S.info=me}rt();const V=new Zx(S,I);this.xr=V,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){const M=Xt.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=Xt.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return z},this.setPixelRatio=function(M){M!==void 0&&(z=M,this.setSize(H,$,!1))},this.getSize=function(M){return M.set(H,$)},this.setSize=function(M,P,O=!0){if(V.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}H=M,$=P,n.width=Math.floor(M*z),n.height=Math.floor(P*z),O===!0&&(n.style.width=M+"px",n.style.height=P+"px"),this.setViewport(0,0,M,P)},this.getDrawingBufferSize=function(M){return M.set(H*z,$*z).floor()},this.setDrawingBufferSize=function(M,P,O){H=M,$=P,z=O,n.width=Math.floor(M*O),n.height=Math.floor(P*O),this.setViewport(0,0,M,P)},this.getCurrentViewport=function(M){return M.copy(w)},this.getViewport=function(M){return M.copy(Et)},this.setViewport=function(M,P,O,B){M.isVector4?Et.set(M.x,M.y,M.z,M.w):Et.set(M,P,O,B),Ct.viewport(w.copy(Et).multiplyScalar(z).round())},this.getScissor=function(M){return M.copy(Vt)},this.setScissor=function(M,P,O,B){M.isVector4?Vt.set(M.x,M.y,M.z,M.w):Vt.set(M,P,O,B),Ct.scissor(G.copy(Vt).multiplyScalar(z).round())},this.getScissorTest=function(){return le},this.setScissorTest=function(M){Ct.setScissorTest(le=M)},this.setOpaqueSort=function(M){it=M},this.setTransparentSort=function(M){ht=M},this.getClearColor=function(M){return M.copy(Pt.getClearColor())},this.setClearColor=function(){Pt.setClearColor.apply(Pt,arguments)},this.getClearAlpha=function(){return Pt.getClearAlpha()},this.setClearAlpha=function(){Pt.setClearAlpha.apply(Pt,arguments)},this.clear=function(M=!0,P=!0,O=!0){let B=0;if(M){let L=!1;if(D!==null){const Q=D.texture.format;L=Q===Bh||Q===Oh||Q===Fh}if(L){const Q=D.texture.type,ct=Q===ki||Q===Br||Q===po||Q===vs||Q===Uh||Q===Nh,vt=Pt.getClearColor(),xt=Pt.getClearAlpha(),It=vt.r,Ot=vt.g,Mt=vt.b;ct?(g[0]=It,g[1]=Ot,g[2]=Mt,g[3]=xt,I.clearBufferuiv(I.COLOR,0,g)):(v[0]=It,v[1]=Ot,v[2]=Mt,v[3]=xt,I.clearBufferiv(I.COLOR,0,v))}else B|=I.COLOR_BUFFER_BIT}P&&(B|=I.DEPTH_BUFFER_BIT),O&&(B|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",Y,!1),n.removeEventListener("webglcontextrestored",lt,!1),n.removeEventListener("webglcontextcreationerror",at,!1),dt.dispose(),Kt.dispose(),Rt.dispose(),_.dispose(),F.dispose(),W.dispose(),ue.dispose(),C.dispose(),Tt.dispose(),V.dispose(),V.removeEventListener("sessionstart",qu),V.removeEventListener("sessionend",Yu),mr.stop()};function Y(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),N=!0}function lt(){console.log("THREE.WebGLRenderer: Context Restored."),N=!1;const M=me.autoReset,P=pt.enabled,O=pt.autoUpdate,B=pt.needsUpdate,L=pt.type;rt(),me.autoReset=M,pt.enabled=P,pt.autoUpdate=O,pt.needsUpdate=B,pt.type=L}function at(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Ft(M){const P=M.target;P.removeEventListener("dispose",Ft),be(P)}function be(M){Je(M),Rt.remove(M)}function Je(M){const P=Rt.get(M).programs;P!==void 0&&(P.forEach(function(O){Tt.releaseProgram(O)}),M.isShaderMaterial&&Tt.releaseShaderCache(M))}this.renderBufferDirect=function(M,P,O,B,L,Q){P===null&&(P=Ae);const ct=L.isMesh&&L.matrixWorld.determinant()<0,vt=$0(M,P,O,B,L);Ct.setMaterial(B,ct);let xt=O.index,It=1;if(B.wireframe===!0){if(xt=Z.getWireframeAttribute(O),xt===void 0)return;It=2}const Ot=O.drawRange,Mt=O.attributes.position;let Qt=Ot.start*It,fe=(Ot.start+Ot.count)*It;Q!==null&&(Qt=Math.max(Qt,Q.start*It),fe=Math.min(fe,(Q.start+Q.count)*It)),xt!==null?(Qt=Math.max(Qt,0),fe=Math.min(fe,xt.count)):Mt!=null&&(Qt=Math.max(Qt,0),fe=Math.min(fe,Mt.count));const ge=fe-Qt;if(ge<0||ge===1/0)return;ue.setup(L,B,vt,O,xt);let hn,ne=mt;if(xt!==null&&(hn=q.get(xt),ne=Yt,ne.setIndex(hn)),L.isMesh)B.wireframe===!0?(Ct.setLineWidth(B.wireframeLinewidth*Ne()),ne.setMode(I.LINES)):ne.setMode(I.TRIANGLES);else if(L.isLine){let At=B.linewidth;At===void 0&&(At=1),Ct.setLineWidth(At*Ne()),L.isLineSegments?ne.setMode(I.LINES):L.isLineLoop?ne.setMode(I.LINE_LOOP):ne.setMode(I.LINE_STRIP)}else L.isPoints?ne.setMode(I.POINTS):L.isSprite&&ne.setMode(I.TRIANGLES);if(L.isBatchedMesh)if(L._multiDrawInstances!==null)ne.renderMultiDrawInstances(L._multiDrawStarts,L._multiDrawCounts,L._multiDrawCount,L._multiDrawInstances);else if(Xt.get("WEBGL_multi_draw"))ne.renderMultiDraw(L._multiDrawStarts,L._multiDrawCounts,L._multiDrawCount);else{const At=L._multiDrawStarts,Ei=L._multiDrawCounts,ie=L._multiDrawCount,qn=xt?q.get(xt).bytesPerElement:1,Gr=Rt.get(B).currentProgram.getUniforms();for(let Mn=0;Mn<ie;Mn++)Gr.setValue(I,"_gl_DrawID",Mn),ne.render(At[Mn]/qn,Ei[Mn])}else if(L.isInstancedMesh)ne.renderInstances(Qt,ge,L.count);else if(O.isInstancedBufferGeometry){const At=O._maxInstanceCount!==void 0?O._maxInstanceCount:1/0,Ei=Math.min(O.instanceCount,At);ne.renderInstances(Qt,ge,Ei)}else ne.render(Qt,ge)};function se(M,P,O){M.transparent===!0&&M.side===Pi&&M.forceSinglePass===!1?(M.side=pn,M.needsUpdate=!0,Fo(M,P,O),M.side=ar,M.needsUpdate=!0,Fo(M,P,O),M.side=Pi):Fo(M,P,O)}this.compile=function(M,P,O=null){O===null&&(O=M),d=Kt.get(O),d.init(P),T.push(d),O.traverseVisible(function(L){L.isLight&&L.layers.test(P.layers)&&(d.pushLight(L),L.castShadow&&d.pushShadow(L))}),M!==O&&M.traverseVisible(function(L){L.isLight&&L.layers.test(P.layers)&&(d.pushLight(L),L.castShadow&&d.pushShadow(L))}),d.setupLights();const B=new Set;return M.traverse(function(L){if(!(L.isMesh||L.isPoints||L.isLine||L.isSprite))return;const Q=L.material;if(Q)if(Array.isArray(Q))for(let ct=0;ct<Q.length;ct++){const vt=Q[ct];se(vt,O,L),B.add(vt)}else se(Q,O,L),B.add(Q)}),T.pop(),d=null,B},this.compileAsync=function(M,P,O=null){const B=this.compile(M,P,O);return new Promise(L=>{function Q(){if(B.forEach(function(ct){Rt.get(ct).currentProgram.isReady()&&B.delete(ct)}),B.size===0){L(M);return}setTimeout(Q,10)}Xt.get("KHR_parallel_shader_compile")!==null?Q():setTimeout(Q,10)})};let Xn=null;function Si(M){Xn&&Xn(M)}function qu(){mr.stop()}function Yu(){mr.start()}const mr=new Up;mr.setAnimationLoop(Si),typeof self<"u"&&mr.setContext(self),this.setAnimationLoop=function(M){Xn=M,V.setAnimationLoop(M),M===null?mr.stop():mr.start()},V.addEventListener("sessionstart",qu),V.addEventListener("sessionend",Yu),this.render=function(M,P){if(P!==void 0&&P.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),P.parent===null&&P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),V.enabled===!0&&V.isPresenting===!0&&(V.cameraAutoUpdate===!0&&V.updateCamera(P),P=V.getCamera()),M.isScene===!0&&M.onBeforeRender(S,M,P,D),d=Kt.get(M,T.length),d.init(P),T.push(d),Lt.multiplyMatrices(P.projectionMatrix,P.matrixWorldInverse),X.setFromProjectionMatrix(Lt),yt=this.localClippingEnabled,et=J.init(this.clippingPlanes,yt),m=dt.get(M,A.length),m.init(),A.push(m),V.enabled===!0&&V.isPresenting===!0){const Q=S.xr.getDepthSensingMesh();Q!==null&&vc(Q,P,-1/0,S.sortObjects)}vc(M,P,0,S.sortObjects),m.finish(),S.sortObjects===!0&&m.sort(it,ht),jt=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,jt&&Pt.addToRenderList(m,M),this.info.render.frame++,et===!0&&J.beginShadows();const O=d.state.shadowsArray;pt.render(O,M,P),et===!0&&J.endShadows(),this.info.autoReset===!0&&this.info.reset();const B=m.opaque,L=m.transmissive;if(d.setupLights(),P.isArrayCamera){const Q=P.cameras;if(L.length>0)for(let ct=0,vt=Q.length;ct<vt;ct++){const xt=Q[ct];Ku(B,L,M,xt)}jt&&Pt.render(M);for(let ct=0,vt=Q.length;ct<vt;ct++){const xt=Q[ct];ju(m,M,xt,xt.viewport)}}else L.length>0&&Ku(B,L,M,P),jt&&Pt.render(M),ju(m,M,P);D!==null&&(E.updateMultisampleRenderTarget(D),E.updateRenderTargetMipmap(D)),M.isScene===!0&&M.onAfterRender(S,M,P),ue.resetDefaultState(),y=-1,x=null,T.pop(),T.length>0?(d=T[T.length-1],et===!0&&J.setGlobalState(S.clippingPlanes,d.state.camera)):d=null,A.pop(),A.length>0?m=A[A.length-1]:m=null};function vc(M,P,O,B){if(M.visible===!1)return;if(M.layers.test(P.layers)){if(M.isGroup)O=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(P);else if(M.isLight)d.pushLight(M),M.castShadow&&d.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||X.intersectsSprite(M)){B&&Gt.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Lt);const ct=W.update(M),vt=M.material;vt.visible&&m.push(M,ct,vt,O,Gt.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||X.intersectsObject(M))){const ct=W.update(M),vt=M.material;if(B&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Gt.copy(M.boundingSphere.center)):(ct.boundingSphere===null&&ct.computeBoundingSphere(),Gt.copy(ct.boundingSphere.center)),Gt.applyMatrix4(M.matrixWorld).applyMatrix4(Lt)),Array.isArray(vt)){const xt=ct.groups;for(let It=0,Ot=xt.length;It<Ot;It++){const Mt=xt[It],Qt=vt[Mt.materialIndex];Qt&&Qt.visible&&m.push(M,ct,Qt,O,Gt.z,Mt)}}else vt.visible&&m.push(M,ct,vt,O,Gt.z,null)}}const Q=M.children;for(let ct=0,vt=Q.length;ct<vt;ct++)vc(Q[ct],P,O,B)}function ju(M,P,O,B){const L=M.opaque,Q=M.transmissive,ct=M.transparent;d.setupLightsView(O),et===!0&&J.setGlobalState(S.clippingPlanes,O),B&&Ct.viewport(w.copy(B)),L.length>0&&No(L,P,O),Q.length>0&&No(Q,P,O),ct.length>0&&No(ct,P,O),Ct.buffers.depth.setTest(!0),Ct.buffers.depth.setMask(!0),Ct.buffers.color.setMask(!0),Ct.setPolygonOffset(!1)}function Ku(M,P,O,B){if((O.isScene===!0?O.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[B.id]===void 0&&(d.state.transmissionRenderTarget[B.id]=new kr(1,1,{generateMipmaps:!0,type:Xt.has("EXT_color_buffer_half_float")||Xt.has("EXT_color_buffer_float")?Mo:ki,minFilter:Lr,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$t.workingColorSpace}));const Q=d.state.transmissionRenderTarget[B.id],ct=B.viewport||w;Q.setSize(ct.z,ct.w);const vt=S.getRenderTarget();S.setRenderTarget(Q),S.getClearColor(j),K=S.getClearAlpha(),K<1&&S.setClearColor(16777215,.5),S.clear(),jt&&Pt.render(O);const xt=S.toneMapping;S.toneMapping=sr;const It=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),d.setupLightsView(B),et===!0&&J.setGlobalState(S.clippingPlanes,B),No(M,O,B),E.updateMultisampleRenderTarget(Q),E.updateRenderTargetMipmap(Q),Xt.has("WEBGL_multisampled_render_to_texture")===!1){let Ot=!1;for(let Mt=0,Qt=P.length;Mt<Qt;Mt++){const fe=P[Mt],ge=fe.object,hn=fe.geometry,ne=fe.material,At=fe.group;if(ne.side===Pi&&ge.layers.test(B.layers)){const Ei=ne.side;ne.side=pn,ne.needsUpdate=!0,$u(ge,O,B,hn,ne,At),ne.side=Ei,ne.needsUpdate=!0,Ot=!0}}Ot===!0&&(E.updateMultisampleRenderTarget(Q),E.updateRenderTargetMipmap(Q))}S.setRenderTarget(vt),S.setClearColor(j,K),It!==void 0&&(B.viewport=It),S.toneMapping=xt}function No(M,P,O){const B=P.isScene===!0?P.overrideMaterial:null;for(let L=0,Q=M.length;L<Q;L++){const ct=M[L],vt=ct.object,xt=ct.geometry,It=B===null?ct.material:B,Ot=ct.group;vt.layers.test(O.layers)&&$u(vt,P,O,xt,It,Ot)}}function $u(M,P,O,B,L,Q){M.onBeforeRender(S,P,O,B,L,Q),M.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),L.onBeforeRender(S,P,O,B,M,Q),L.transparent===!0&&L.side===Pi&&L.forceSinglePass===!1?(L.side=pn,L.needsUpdate=!0,S.renderBufferDirect(O,P,B,L,M,Q),L.side=ar,L.needsUpdate=!0,S.renderBufferDirect(O,P,B,L,M,Q),L.side=Pi):S.renderBufferDirect(O,P,B,L,M,Q),M.onAfterRender(S,P,O,B,L,Q)}function Fo(M,P,O){P.isScene!==!0&&(P=Ae);const B=Rt.get(M),L=d.state.lights,Q=d.state.shadowsArray,ct=L.state.version,vt=Tt.getParameters(M,L.state,Q,P,O),xt=Tt.getProgramCacheKey(vt);let It=B.programs;B.environment=M.isMeshStandardMaterial?P.environment:null,B.fog=P.fog,B.envMap=(M.isMeshStandardMaterial?F:_).get(M.envMap||B.environment),B.envMapRotation=B.environment!==null&&M.envMap===null?P.environmentRotation:M.envMapRotation,It===void 0&&(M.addEventListener("dispose",Ft),It=new Map,B.programs=It);let Ot=It.get(xt);if(Ot!==void 0){if(B.currentProgram===Ot&&B.lightsStateVersion===ct)return Ju(M,vt),Ot}else vt.uniforms=Tt.getUniforms(M),M.onBeforeCompile(vt,S),Ot=Tt.acquireProgram(vt,xt),It.set(xt,Ot),B.uniforms=vt.uniforms;const Mt=B.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Mt.clippingPlanes=J.uniform),Ju(M,vt),B.needsLights=J0(M),B.lightsStateVersion=ct,B.needsLights&&(Mt.ambientLightColor.value=L.state.ambient,Mt.lightProbe.value=L.state.probe,Mt.directionalLights.value=L.state.directional,Mt.directionalLightShadows.value=L.state.directionalShadow,Mt.spotLights.value=L.state.spot,Mt.spotLightShadows.value=L.state.spotShadow,Mt.rectAreaLights.value=L.state.rectArea,Mt.ltc_1.value=L.state.rectAreaLTC1,Mt.ltc_2.value=L.state.rectAreaLTC2,Mt.pointLights.value=L.state.point,Mt.pointLightShadows.value=L.state.pointShadow,Mt.hemisphereLights.value=L.state.hemi,Mt.directionalShadowMap.value=L.state.directionalShadowMap,Mt.directionalShadowMatrix.value=L.state.directionalShadowMatrix,Mt.spotShadowMap.value=L.state.spotShadowMap,Mt.spotLightMatrix.value=L.state.spotLightMatrix,Mt.spotLightMap.value=L.state.spotLightMap,Mt.pointShadowMap.value=L.state.pointShadowMap,Mt.pointShadowMatrix.value=L.state.pointShadowMatrix),B.currentProgram=Ot,B.uniformsList=null,Ot}function Zu(M){if(M.uniformsList===null){const P=M.currentProgram.getUniforms();M.uniformsList=Ma.seqWithValue(P.seq,M.uniforms)}return M.uniformsList}function Ju(M,P){const O=Rt.get(M);O.outputColorSpace=P.outputColorSpace,O.batching=P.batching,O.batchingColor=P.batchingColor,O.instancing=P.instancing,O.instancingColor=P.instancingColor,O.instancingMorph=P.instancingMorph,O.skinning=P.skinning,O.morphTargets=P.morphTargets,O.morphNormals=P.morphNormals,O.morphColors=P.morphColors,O.morphTargetsCount=P.morphTargetsCount,O.numClippingPlanes=P.numClippingPlanes,O.numIntersection=P.numClipIntersection,O.vertexAlphas=P.vertexAlphas,O.vertexTangents=P.vertexTangents,O.toneMapping=P.toneMapping}function $0(M,P,O,B,L){P.isScene!==!0&&(P=Ae),E.resetTextureUnits();const Q=P.fog,ct=B.isMeshStandardMaterial?P.environment:null,vt=D===null?S.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:Ls,xt=(B.isMeshStandardMaterial?F:_).get(B.envMap||ct),It=B.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,Ot=!!O.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),Mt=!!O.morphAttributes.position,Qt=!!O.morphAttributes.normal,fe=!!O.morphAttributes.color;let ge=sr;B.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(ge=S.toneMapping);const hn=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,ne=hn!==void 0?hn.length:0,At=Rt.get(B),Ei=d.state.lights;if(et===!0&&(yt===!0||M!==x)){const Dn=M===x&&B.id===y;J.setState(B,M,Dn)}let ie=!1;B.version===At.__version?(At.needsLights&&At.lightsStateVersion!==Ei.state.version||At.outputColorSpace!==vt||L.isBatchedMesh&&At.batching===!1||!L.isBatchedMesh&&At.batching===!0||L.isBatchedMesh&&At.batchingColor===!0&&L.colorTexture===null||L.isBatchedMesh&&At.batchingColor===!1&&L.colorTexture!==null||L.isInstancedMesh&&At.instancing===!1||!L.isInstancedMesh&&At.instancing===!0||L.isSkinnedMesh&&At.skinning===!1||!L.isSkinnedMesh&&At.skinning===!0||L.isInstancedMesh&&At.instancingColor===!0&&L.instanceColor===null||L.isInstancedMesh&&At.instancingColor===!1&&L.instanceColor!==null||L.isInstancedMesh&&At.instancingMorph===!0&&L.morphTexture===null||L.isInstancedMesh&&At.instancingMorph===!1&&L.morphTexture!==null||At.envMap!==xt||B.fog===!0&&At.fog!==Q||At.numClippingPlanes!==void 0&&(At.numClippingPlanes!==J.numPlanes||At.numIntersection!==J.numIntersection)||At.vertexAlphas!==It||At.vertexTangents!==Ot||At.morphTargets!==Mt||At.morphNormals!==Qt||At.morphColors!==fe||At.toneMapping!==ge||At.morphTargetsCount!==ne)&&(ie=!0):(ie=!0,At.__version=B.version);let qn=At.currentProgram;ie===!0&&(qn=Fo(B,P,L));let Gr=!1,Mn=!1,Gs=!1;const _e=qn.getUniforms(),ri=At.uniforms;if(Ct.useProgram(qn.program)&&(Gr=!0,Mn=!0,Gs=!0),B.id!==y&&(y=B.id,Mn=!0),Gr||x!==M){Ct.buffers.depth.getReversed()?(st.copy(M.projectionMatrix),Wg(st),Xg(st),_e.setValue(I,"projectionMatrix",st)):_e.setValue(I,"projectionMatrix",M.projectionMatrix),_e.setValue(I,"viewMatrix",M.matrixWorldInverse);const Wi=_e.map.cameraPosition;Wi!==void 0&&Wi.setValue(I,Nt.setFromMatrixPosition(M.matrixWorld)),qt.logarithmicDepthBuffer&&_e.setValue(I,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&_e.setValue(I,"isOrthographic",M.isOrthographicCamera===!0),x!==M&&(x=M,Mn=!0,Gs=!0)}if(L.isSkinnedMesh){_e.setOptional(I,L,"bindMatrix"),_e.setOptional(I,L,"bindMatrixInverse");const Dn=L.skeleton;Dn&&(Dn.boneTexture===null&&Dn.computeBoneTexture(),_e.setValue(I,"boneTexture",Dn.boneTexture,E))}L.isBatchedMesh&&(_e.setOptional(I,L,"batchingTexture"),_e.setValue(I,"batchingTexture",L._matricesTexture,E),_e.setOptional(I,L,"batchingIdTexture"),_e.setValue(I,"batchingIdTexture",L._indirectTexture,E),_e.setOptional(I,L,"batchingColorTexture"),L._colorsTexture!==null&&_e.setValue(I,"batchingColorTexture",L._colorsTexture,E));const Hs=O.morphAttributes;if((Hs.position!==void 0||Hs.normal!==void 0||Hs.color!==void 0)&&Dt.update(L,O,qn),(Mn||At.receiveShadow!==L.receiveShadow)&&(At.receiveShadow=L.receiveShadow,_e.setValue(I,"receiveShadow",L.receiveShadow)),B.isMeshGouraudMaterial&&B.envMap!==null&&(ri.envMap.value=xt,ri.flipEnvMap.value=xt.isCubeTexture&&xt.isRenderTargetTexture===!1?-1:1),B.isMeshStandardMaterial&&B.envMap===null&&P.environment!==null&&(ri.envMapIntensity.value=P.environmentIntensity),Mn&&(_e.setValue(I,"toneMappingExposure",S.toneMappingExposure),At.needsLights&&Z0(ri,Gs),Q&&B.fog===!0&&ot.refreshFogUniforms(ri,Q),ot.refreshMaterialUniforms(ri,B,z,$,d.state.transmissionRenderTarget[M.id]),Ma.upload(I,Zu(At),ri,E)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(Ma.upload(I,Zu(At),ri,E),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&_e.setValue(I,"center",L.center),_e.setValue(I,"modelViewMatrix",L.modelViewMatrix),_e.setValue(I,"normalMatrix",L.normalMatrix),_e.setValue(I,"modelMatrix",L.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){const Dn=B.uniformsGroups;for(let Wi=0,Xi=Dn.length;Wi<Xi;Wi++){const Qu=Dn[Wi];C.update(Qu,qn),C.bind(Qu,qn)}}return qn}function Z0(M,P){M.ambientLightColor.needsUpdate=P,M.lightProbe.needsUpdate=P,M.directionalLights.needsUpdate=P,M.directionalLightShadows.needsUpdate=P,M.pointLights.needsUpdate=P,M.pointLightShadows.needsUpdate=P,M.spotLights.needsUpdate=P,M.spotLightShadows.needsUpdate=P,M.rectAreaLights.needsUpdate=P,M.hemisphereLights.needsUpdate=P}function J0(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return b},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(M,P,O){Rt.get(M.texture).__webglTexture=P,Rt.get(M.depthTexture).__webglTexture=O;const B=Rt.get(M);B.__hasExternalTextures=!0,B.__autoAllocateDepthBuffer=O===void 0,B.__autoAllocateDepthBuffer||Xt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),B.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(M,P){const O=Rt.get(M);O.__webglFramebuffer=P,O.__useDefaultFramebuffer=P===void 0},this.setRenderTarget=function(M,P=0,O=0){D=M,R=P,b=O;let B=!0,L=null,Q=!1,ct=!1;if(M){const xt=Rt.get(M);if(xt.__useDefaultFramebuffer!==void 0)Ct.bindFramebuffer(I.FRAMEBUFFER,null),B=!1;else if(xt.__webglFramebuffer===void 0)E.setupRenderTarget(M);else if(xt.__hasExternalTextures)E.rebindTextures(M,Rt.get(M.texture).__webglTexture,Rt.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const Mt=M.depthTexture;if(xt.__boundDepthTexture!==Mt){if(Mt!==null&&Rt.has(Mt)&&(M.width!==Mt.image.width||M.height!==Mt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");E.setupDepthRenderbuffer(M)}}const It=M.texture;(It.isData3DTexture||It.isDataArrayTexture||It.isCompressedArrayTexture)&&(ct=!0);const Ot=Rt.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ot[P])?L=Ot[P][O]:L=Ot[P],Q=!0):M.samples>0&&E.useMultisampledRTT(M)===!1?L=Rt.get(M).__webglMultisampledFramebuffer:Array.isArray(Ot)?L=Ot[O]:L=Ot,w.copy(M.viewport),G.copy(M.scissor),k=M.scissorTest}else w.copy(Et).multiplyScalar(z).floor(),G.copy(Vt).multiplyScalar(z).floor(),k=le;if(Ct.bindFramebuffer(I.FRAMEBUFFER,L)&&B&&Ct.drawBuffers(M,L),Ct.viewport(w),Ct.scissor(G),Ct.setScissorTest(k),Q){const xt=Rt.get(M.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+P,xt.__webglTexture,O)}else if(ct){const xt=Rt.get(M.texture),It=P||0;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,xt.__webglTexture,O||0,It)}y=-1},this.readRenderTargetPixels=function(M,P,O,B,L,Q,ct){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let vt=Rt.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ct!==void 0&&(vt=vt[ct]),vt){Ct.bindFramebuffer(I.FRAMEBUFFER,vt);try{const xt=M.texture,It=xt.format,Ot=xt.type;if(!qt.textureFormatReadable(It)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!qt.textureTypeReadable(Ot)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}P>=0&&P<=M.width-B&&O>=0&&O<=M.height-L&&I.readPixels(P,O,B,L,kt.convert(It),kt.convert(Ot),Q)}finally{const xt=D!==null?Rt.get(D).__webglFramebuffer:null;Ct.bindFramebuffer(I.FRAMEBUFFER,xt)}}},this.readRenderTargetPixelsAsync=async function(M,P,O,B,L,Q,ct){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let vt=Rt.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ct!==void 0&&(vt=vt[ct]),vt){const xt=M.texture,It=xt.format,Ot=xt.type;if(!qt.textureFormatReadable(It))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!qt.textureTypeReadable(Ot))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(P>=0&&P<=M.width-B&&O>=0&&O<=M.height-L){Ct.bindFramebuffer(I.FRAMEBUFFER,vt);const Mt=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,Mt),I.bufferData(I.PIXEL_PACK_BUFFER,Q.byteLength,I.STREAM_READ),I.readPixels(P,O,B,L,kt.convert(It),kt.convert(Ot),0);const Qt=D!==null?Rt.get(D).__webglFramebuffer:null;Ct.bindFramebuffer(I.FRAMEBUFFER,Qt);const fe=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Hg(I,fe,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,Mt),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,Q),I.deleteBuffer(Mt),I.deleteSync(fe),Q}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(M,P=null,O=0){M.isTexture!==!0&&(Qs("WebGLRenderer: copyFramebufferToTexture function signature has changed."),P=arguments[0]||null,M=arguments[1]);const B=Math.pow(2,-O),L=Math.floor(M.image.width*B),Q=Math.floor(M.image.height*B),ct=P!==null?P.x:0,vt=P!==null?P.y:0;E.setTexture2D(M,0),I.copyTexSubImage2D(I.TEXTURE_2D,O,0,0,ct,vt,L,Q),Ct.unbindTexture()},this.copyTextureToTexture=function(M,P,O=null,B=null,L=0){M.isTexture!==!0&&(Qs("WebGLRenderer: copyTextureToTexture function signature has changed."),B=arguments[0]||null,M=arguments[1],P=arguments[2],L=arguments[3]||0,O=null);let Q,ct,vt,xt,It,Ot,Mt,Qt,fe;const ge=M.isCompressedTexture?M.mipmaps[L]:M.image;O!==null?(Q=O.max.x-O.min.x,ct=O.max.y-O.min.y,vt=O.isBox3?O.max.z-O.min.z:1,xt=O.min.x,It=O.min.y,Ot=O.isBox3?O.min.z:0):(Q=ge.width,ct=ge.height,vt=ge.depth||1,xt=0,It=0,Ot=0),B!==null?(Mt=B.x,Qt=B.y,fe=B.z):(Mt=0,Qt=0,fe=0);const hn=kt.convert(P.format),ne=kt.convert(P.type);let At;P.isData3DTexture?(E.setTexture3D(P,0),At=I.TEXTURE_3D):P.isDataArrayTexture||P.isCompressedArrayTexture?(E.setTexture2DArray(P,0),At=I.TEXTURE_2D_ARRAY):(E.setTexture2D(P,0),At=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,P.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,P.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,P.unpackAlignment);const Ei=I.getParameter(I.UNPACK_ROW_LENGTH),ie=I.getParameter(I.UNPACK_IMAGE_HEIGHT),qn=I.getParameter(I.UNPACK_SKIP_PIXELS),Gr=I.getParameter(I.UNPACK_SKIP_ROWS),Mn=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,ge.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,ge.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,xt),I.pixelStorei(I.UNPACK_SKIP_ROWS,It),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Ot);const Gs=M.isDataArrayTexture||M.isData3DTexture,_e=P.isDataArrayTexture||P.isData3DTexture;if(M.isRenderTargetTexture||M.isDepthTexture){const ri=Rt.get(M),Hs=Rt.get(P),Dn=Rt.get(ri.__renderTarget),Wi=Rt.get(Hs.__renderTarget);Ct.bindFramebuffer(I.READ_FRAMEBUFFER,Dn.__webglFramebuffer),Ct.bindFramebuffer(I.DRAW_FRAMEBUFFER,Wi.__webglFramebuffer);for(let Xi=0;Xi<vt;Xi++)Gs&&I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Rt.get(M).__webglTexture,L,Ot+Xi),M.isDepthTexture?(_e&&I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Rt.get(P).__webglTexture,L,fe+Xi),I.blitFramebuffer(xt,It,Q,ct,Mt,Qt,Q,ct,I.DEPTH_BUFFER_BIT,I.NEAREST)):_e?I.copyTexSubImage3D(At,L,Mt,Qt,fe+Xi,xt,It,Q,ct):I.copyTexSubImage2D(At,L,Mt,Qt,fe+Xi,xt,It,Q,ct);Ct.bindFramebuffer(I.READ_FRAMEBUFFER,null),Ct.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else _e?M.isDataTexture||M.isData3DTexture?I.texSubImage3D(At,L,Mt,Qt,fe,Q,ct,vt,hn,ne,ge.data):P.isCompressedArrayTexture?I.compressedTexSubImage3D(At,L,Mt,Qt,fe,Q,ct,vt,hn,ge.data):I.texSubImage3D(At,L,Mt,Qt,fe,Q,ct,vt,hn,ne,ge):M.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,L,Mt,Qt,Q,ct,hn,ne,ge.data):M.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,L,Mt,Qt,ge.width,ge.height,hn,ge.data):I.texSubImage2D(I.TEXTURE_2D,L,Mt,Qt,Q,ct,hn,ne,ge);I.pixelStorei(I.UNPACK_ROW_LENGTH,Ei),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,ie),I.pixelStorei(I.UNPACK_SKIP_PIXELS,qn),I.pixelStorei(I.UNPACK_SKIP_ROWS,Gr),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Mn),L===0&&P.generateMipmaps&&I.generateMipmap(At),Ct.unbindTexture()},this.copyTextureToTexture3D=function(M,P,O=null,B=null,L=0){return M.isTexture!==!0&&(Qs("WebGLRenderer: copyTextureToTexture3D function signature has changed."),O=arguments[0]||null,B=arguments[1]||null,M=arguments[2],P=arguments[3],L=arguments[4]||0),Qs('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(M,P,O,B,L)},this.initRenderTarget=function(M){Rt.get(M).__webglFramebuffer===void 0&&E.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?E.setTextureCube(M,0):M.isData3DTexture?E.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?E.setTexture2DArray(M,0):E.setTexture2D(M,0),Ct.unbindTexture()},this.resetState=function(){R=0,b=0,D=null,Ct.reset(),ue.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ii}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const n=this.getContext();n.drawingBufferColorspace=$t._getDrawingBufferColorSpace(t),n.unpackColorSpace=$t._getUnpackColorSpace()}}class n3 extends gn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pi,this.environmentIntensity=1,this.environmentRotation=new pi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,n){return super.copy(t,n),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const n=super.toJSON(t);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}}class i3 extends To{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new oe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Jf=new De,rh=new Tp,ra=new Eo,sa=new U;class r3 extends gn{constructor(t=new Hi,n=new i3){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=n,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,n){const i=this.geometry,r=this.matrixWorld,s=t.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ra.copy(i.boundingSphere),ra.applyMatrix4(r),ra.radius+=s,t.ray.intersectsSphere(ra)===!1)return;Jf.copy(r).invert(),rh.copy(t.ray).applyMatrix4(Jf);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=i.index,u=i.attributes.position;if(l!==null){const f=Math.max(0,o.start),p=Math.min(l.count,o.start+o.count);for(let g=f,v=p;g<v;g++){const m=l.getX(g);sa.fromBufferAttribute(u,m),Qf(sa,m,c,r,t,n,this)}}else{const f=Math.max(0,o.start),p=Math.min(u.count,o.start+o.count);for(let g=f,v=p;g<v;g++)sa.fromBufferAttribute(u,g),Qf(sa,g,c,r,t,n,this)}}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function Qf(e,t,n,i,r,s,o){const a=rh.distanceSqToPoint(e);if(a<n){const c=new U;rh.closestPointToPoint(e,c),c.applyMatrix4(i);const l=r.ray.origin.distanceTo(c);if(l<r.near||l>r.far)return;s.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}class zp{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,n){const i=this.getUtoTmapping(t);return this.getPoint(i,n)}getPoints(t=5){const n=[];for(let i=0;i<=t;i++)n.push(this.getPoint(i/t));return n}getSpacedPoints(t=5){const n=[];for(let i=0;i<=t;i++)n.push(this.getPointAt(i/t));return n}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const n=[];let i,r=this.getPoint(0),s=0;n.push(0);for(let o=1;o<=t;o++)i=this.getPoint(o/t),s+=i.distanceTo(r),n.push(s),r=i;return this.cacheArcLengths=n,n}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,n){const i=this.getLengths();let r=0;const s=i.length;let o;n?o=n:o=t*i[s-1];let a=0,c=s-1,l;for(;a<=c;)if(r=Math.floor(a+(c-a)/2),l=i[r]-o,l<0)a=r+1;else if(l>0)c=r-1;else{c=r;break}if(r=c,i[r]===o)return r/(s-1);const h=i[r],f=i[r+1]-h,p=(o-h)/f;return(r+p)/(s-1)}getTangent(t,n){let r=t-1e-4,s=t+1e-4;r<0&&(r=0),s>1&&(s=1);const o=this.getPoint(r),a=this.getPoint(s),c=n||(o.isVector2?new ee:new U);return c.copy(a).sub(o).normalize(),c}getTangentAt(t,n){const i=this.getUtoTmapping(t);return this.getTangent(i,n)}computeFrenetFrames(t,n){const i=new U,r=[],s=[],o=[],a=new U,c=new De;for(let p=0;p<=t;p++){const g=p/t;r[p]=this.getTangentAt(g,new U)}s[0]=new U,o[0]=new U;let l=Number.MAX_VALUE;const h=Math.abs(r[0].x),u=Math.abs(r[0].y),f=Math.abs(r[0].z);h<=l&&(l=h,i.set(1,0,0)),u<=l&&(l=u,i.set(0,1,0)),f<=l&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let p=1;p<=t;p++){if(s[p]=s[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(r[p-1],r[p]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(nn(r[p-1].dot(r[p]),-1,1));s[p].applyMatrix4(c.makeRotationAxis(a,g))}o[p].crossVectors(r[p],s[p])}if(n===!0){let p=Math.acos(nn(s[0].dot(s[t]),-1,1));p/=t,r[0].dot(a.crossVectors(s[0],s[t]))>0&&(p=-p);for(let g=1;g<=t;g++)s[g].applyMatrix4(c.makeRotationAxis(r[g],p*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}function zh(){let e=0,t=0,n=0,i=0;function r(s,o,a,c){e=s,t=a,n=-3*s+3*o-2*a-c,i=2*s-2*o+a+c}return{initCatmullRom:function(s,o,a,c,l){r(o,a,l*(a-s),l*(c-o))},initNonuniformCatmullRom:function(s,o,a,c,l,h,u){let f=(o-s)/l-(a-s)/(l+h)+(a-o)/h,p=(a-o)/h-(c-o)/(h+u)+(c-a)/u;f*=h,p*=h,r(o,a,f,p)},calc:function(s){const o=s*s,a=o*s;return e+t*s+n*o+i*a}}}const oa=new U,Kc=new zh,$c=new zh,Zc=new zh;class s3 extends zp{constructor(t=[],n=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=n,this.curveType=i,this.tension=r}getPoint(t,n=new U){const i=n,r=this.points,s=r.length,o=(s-(this.closed?0:1))*t;let a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:c===0&&a===s-1&&(a=s-2,c=1);let l,h;this.closed||a>0?l=r[(a-1)%s]:(oa.subVectors(r[0],r[1]).add(r[0]),l=oa);const u=r[a%s],f=r[(a+1)%s];if(this.closed||a+2<s?h=r[(a+2)%s]:(oa.subVectors(r[s-1],r[s-2]).add(r[s-1]),h=oa),this.curveType==="centripetal"||this.curveType==="chordal"){const p=this.curveType==="chordal"?.5:.25;let g=Math.pow(l.distanceToSquared(u),p),v=Math.pow(u.distanceToSquared(f),p),m=Math.pow(f.distanceToSquared(h),p);v<1e-4&&(v=1),g<1e-4&&(g=v),m<1e-4&&(m=v),Kc.initNonuniformCatmullRom(l.x,u.x,f.x,h.x,g,v,m),$c.initNonuniformCatmullRom(l.y,u.y,f.y,h.y,g,v,m),Zc.initNonuniformCatmullRom(l.z,u.z,f.z,h.z,g,v,m)}else this.curveType==="catmullrom"&&(Kc.initCatmullRom(l.x,u.x,f.x,h.x,this.tension),$c.initCatmullRom(l.y,u.y,f.y,h.y,this.tension),Zc.initCatmullRom(l.z,u.z,f.z,h.z,this.tension));return i.set(Kc.calc(c),$c.calc(c),Zc.calc(c)),i}copy(t){super.copy(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){const r=t.points[n];this.points.push(r.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let n=0,i=this.points.length;n<i;n++){const r=this.points[n];t.points.push(r.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){const r=t.points[n];this.points.push(new U().fromArray(r))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function td(e,t,n,i,r){const s=(i-t)*.5,o=(r-n)*.5,a=e*e,c=e*a;return(2*n-2*i+s+o)*c+(-3*n+3*i-2*s-o)*a+s*e+n}class o3 extends zp{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,n=new ee){const i=n,r=this.points,s=(r.length-1)*t,o=Math.floor(s),a=s-o,c=r[o===0?o:o-1],l=r[o],h=r[o>r.length-2?r.length-1:o+1],u=r[o>r.length-3?r.length-1:o+2];return i.set(td(a,c.x,l.x,h.x,u.x),td(a,c.y,l.y,h.y,u.y)),i}copy(t){super.copy(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){const r=t.points[n];this.points.push(r.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let n=0,i=this.points.length;n<i;n++){const r=this.points[n];t.points.push(r.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){const r=t.points[n];this.points.push(new ee().fromArray(r))}return this}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Dh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Dh);const Ze=(e,t,n)=>Math.min(n,Math.max(t,e)),Jc=(e,t,n,i)=>e+(t-e)*(1-Math.exp(-n*i)),a3=(e,t)=>{let n=t-e;for(;n>Math.PI;)n-=Math.PI*2;for(;n<-Math.PI;)n+=Math.PI*2;return n};function c3(e=1){let t=e>>>0;return()=>(t=t*1664525+1013904223>>>0,t/4294967296)}const no=24,sh=9.5,ed=38,l3=2.7,h3=`
attribute vec3 aDir;
attribute vec3 aColor;
attribute float aPart;
attribute vec3 aRand;
attribute float aSeed;
uniform float uExplode;
uniform float uTime;
uniform float uSize;
uniform float uPR;
uniform float uScatter;
uniform float uHi;
uniform float uSel;
uniform vec3 uOff[${no}];
varying vec3 vColor;
varying float vA;
void main() {
  int idx = int(aPart + 0.5);
  vec3 p = position + aDir * uExplode + uOff[idx];
  p += 0.010 * vec3(sin(uTime * 1.3 + aSeed * 40.0), cos(uTime * 1.1 + aSeed * 31.0), sin(uTime * 0.9 + aSeed * 23.0));
  p += aRand * uScatter * 4.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float hi = abs(aPart - uHi) < 0.5 ? 1.0 : 0.0;
  float sel = abs(aPart - uSel) < 0.5 ? 1.0 : 0.0;
  float tw = 0.82 + 0.18 * sin(uTime * 2.0 + aSeed * 60.0);
  float boost = max(hi, sel);
  gl_PointSize = uSize * uPR * (0.8 + 0.5 * fract(aSeed * 7.13)) * (1.0 + 0.7 * boost) * (${sh.toFixed(1)} / -mv.z);
  vColor = mix(aColor * tw, vec3(1.0), 0.45 * boost);
  vA = (0.9 - 0.9 * uScatter) * (1.0 + 0.2 * boost);
  gl_Position = projectionMatrix * mv;
}`,u3=`
varying vec3 vColor;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.05, d);
  gl_FragColor = vec4(vColor, a * vA);
}`;function f3(e){const t=parseInt(e.slice(1),16);return[(t>>16)/255,(t>>8&255)/255,(t&255)/255]}class d3{constructor(t,n){this.models=n,this.renderer=new e3({canvas:t,antialias:!0,alpha:!0,powerPreference:"high-performance"}),this.renderer.setClearColor(0,0),this.camera=new Bn(ed,1,.1,100),this.camera.position.set(0,0,sh),this.scene=new n3,this.group=new eo,this.scene.add(this.group),this.uniforms={uExplode:{value:0},uTime:{value:0},uSize:{value:2.7},uPR:{value:1},uScatter:{value:1},uHi:{value:-1},uSel:{value:-1},uOff:{value:Array.from({length:no},()=>new U)}},this.material=new zi({vertexShader:h3,fragmentShader:u3,uniforms:this.uniforms,transparent:!0,depthWrite:!1,depthTest:!1,blending:gl}),this.explode=0,this.explodeTarget=.85,this.intensity=1,this.rot={x:0,y:0,z:0},this.vel={x:0,y:0},this.scale=1,this.scaleTarget=1,this.holdVel=!1,this.autoSpin=!0,this.idle=0,this.scatterTarget=0,this.pending=-1,this.index=-1,this.hover=-1,this.sel=-1,this.shift=0,this.offT=Array.from({length:no},()=>new U),this.cache=new Map,this.onModel=null,this.resize(),addEventListener("resize",()=>this.resize()),this._load(0)}get partCount(){return this.parts.length}get shownExplode(){return this.explode*this.intensity}resize(){const t=innerWidth,n=innerHeight;this.W=t,this.H=n,this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2)),this.renderer.setSize(t,n,!1),this.camera.aspect=t/n,this.camera.updateProjectionMatrix(),this.uniforms.uPR.value=this.renderer.getPixelRatio();const i=2*Math.tan(ed*Math.PI/360)*sh/n,r=t>900?300:0;this.shift=r/2*i,this.unitsPerPx=i}_geometry(t){if(this.cache.has(t))return this.cache.get(t);const i=this.models[t].build();let r=0;for(const N of i)for(const R of N.instances)r+=R.cloud.n;const s=[1e9,1e9,1e9],o=[-1e9,-1e9,-1e9],a=[1e9,1e9,1e9],c=[-1e9,-1e9,-1e9];for(const N of i)for(const R of N.instances){const b=R.cloud.p;for(let D=0;D<b.length;D+=3)for(let y=0;y<3;y++){const x=b[D+y],w=x+R.dir[y];x<s[y]&&(s[y]=x),x>o[y]&&(o[y]=x),w<a[y]&&(a[y]=w),w>c[y]&&(c[y]=w)}}const l=[0,1,2].map(N=>(s[N]+o[N]+a[N]+c[N])/4),h=new Float32Array(r*3),u=new Float32Array(r*3),f=new Float32Array(r*3),p=new Float32Array(r),g=new Float32Array(r*3),v=new Float32Array(r);let m=0,d=0;const A=[];i.forEach((N,R)=>{const b=f3(N.color),D=[],y=[];N.instances.forEach(x=>{D.push({a:[x.anchor[0]-l[0],x.anchor[1]-l[1],x.anchor[2]-l[2]],d:x.dir});const w=x.cloud.p,G=w.length/3;for(let k=0;k<G;k++,d++){const j=w[k*3]-l[0],K=w[k*3+1]-l[1],H=w[k*3+2]-l[2];h.set([j,K,H],d*3),u.set(x.dir,d*3);const $=.78+.32*Math.random();f.set([b[0]*$,b[1]*$,b[2]*$],d*3),p[d]=R;const z=Math.random(),it=Math.random()*Math.PI*2,ht=Math.random()*2-1,Et=Math.sqrt(1-ht*ht);g.set([Et*Math.cos(it)*z,ht*z,Et*Math.sin(it)*z],d*3),v[d]=Math.random(),m=Math.max(m,Math.hypot(j+x.dir[0],K+x.dir[1],H+x.dir[2])),Math.random()<160/Math.max(160,G)&&y.push(j,K,H,x.dir[0],x.dir[1],x.dir[2])}}),A.push({name:N.name,desc:N.desc,color:N.color,anchors:D,samples:new Float32Array(y)})});const T=new Hi;T.setAttribute("position",new rn(h,3)),T.setAttribute("aDir",new rn(u,3)),T.setAttribute("aColor",new rn(f,3)),T.setAttribute("aPart",new rn(p,1)),T.setAttribute("aRand",new rn(g,3)),T.setAttribute("aSeed",new rn(v,1)),T.boundingSphere=new Eo(new U,50);const S={geo:T,meta:A,fit:l3/Math.max(.5,m),count:r};return this.cache.set(t,S),S}_load(t){const n=this._geometry(t);this.points&&this.group.remove(this.points),this.points=new r3(n.geo,this.material),this.points.frustumCulled=!1,this.group.add(this.points),this.parts=n.meta,this.fit=n.fit,this.count=n.count,this.index=t,this.hover=-1,this.sel=-1,this.uniforms.uHi.value=-1,this.uniforms.uSel.value=-1,this.releaseAll(!0);const i=this.models[t].view;this.rot.x=i.x,this.rot.y=i.y,this.rot.z=i.z,this.vel.x=this.vel.y=0,this.scatterTarget=0,this.onModel&&this.onModel(t,this.models[t],n)}setModel(t){const n=this.models.length;t=(t%n+n)%n,!(t===this.index&&this.pending<0)&&(this.pending=t,this.scatterTarget=1)}next(t=1){this.setModel((this.pending>=0?this.pending:this.index)+t)}setHover(t){this.hover=t,this.uniforms.uHi.value=t}setSel(t){this.sel=t,this.uniforms.uSel.value=t}rotateBy(t,n,i=1/60){this.rot.y+=t,this.rot.x=Ze(this.rot.x+n,-1.4,1.4),this.vel.y+=(t/Math.max(i,.008)-this.vel.y)*.3,this.vel.x+=(n/Math.max(i,.008)-this.vel.x)*.3,this.idle=0}rollBy(t){this.rot.z=Ze(this.rot.z+t,-1.2,1.2),this.idle=0}zoomBy(t){this.scaleTarget=Ze(this.scaleTarget*t,.5,2.6)}resetView(){const t=this.models[this.index].view;this.rot.x=t.x,this.rot.y=t.y,this.rot.z=t.z,this.vel.x=this.vel.y=0,this.scaleTarget=1,this.releaseAll(),this.setSel(-1)}dragPart(t,n,i){if(t<0||t>=this.parts.length)return;const r=new U(n*this.unitsPerPx,-i*this.unitsPerPx,0);r.applyQuaternion(this.group.quaternion.clone().invert()).divideScalar(Math.max(1e-4,this.group.scale.x)),this.offT[t].add(r),this.idle=0}releaseAll(t=!1){for(let n=0;n<no;n++)this.offT[n].set(0,0,0),t&&this.uniforms.uOff.value[n].set(0,0,0)}_toScreen(t,n){return n.set(t[0],t[1],t[2]).applyMatrix4(this.group.matrixWorld).project(this.camera),{x:(n.x*.5+.5)*this.W,y:(-n.y*.5+.5)*this.H,z:n.z}}pick(t,n,i=100){const r=this.shownExplode,s=new U;let o=-1,a=i;return this.group.updateMatrixWorld(!0),this.parts.forEach((c,l)=>{const h=c.samples,u=this.uniforms.uOff.value[l];for(let f=0;f<h.length;f+=6){const p=this._toScreen([h[f]+h[f+3]*r+u.x,h[f+1]+h[f+4]*r+u.y,h[f+2]+h[f+5]*r+u.z],s),g=Math.hypot(p.x-t,p.y-n);g<a&&(a=g,o=l)}}),o}labelPoints(){const t=this.shownExplode,n=new U;return this.group.updateMatrixWorld(!0),this.parts.map((i,r)=>{const{a:s,d:o}=i.anchors[0],a=this.uniforms.uOff.value[r],c=this._toScreen([s[0]+o[0]*t+a.x,s[1]+o[1]*t+a.y,s[2]+o[2]*t+a.z],n);return{i:r,x:c.x,y:c.y,name:i.name,color:i.color}})}centerScreen(){const t=new U;return this.group.updateMatrixWorld(!0),this._toScreen([0,0,0],t)}update(t,n){if(this.idle+=t,this.explode=Jc(this.explode,this.explodeTarget,5,t),this.scale=Jc(this.scale,this.scaleTarget,6,t),this.uniforms.uScatter.value=Jc(this.uniforms.uScatter.value,this.scatterTarget,this.scatterTarget?7:3.2,t),this.pending>=0&&this.uniforms.uScatter.value>.97){const r=this.pending;this.pending=-1,this._load(r),this.scatterTarget=0,this.uniforms.uScatter.value=1}if(!this.holdVel){this.rot.y+=this.vel.y*t,this.rot.x=Ze(this.rot.x+this.vel.x*t,-1.4,1.4);const r=Math.exp(-2.6*t);this.vel.x*=r,this.vel.y*=r,this.autoSpin&&this.idle>2&&Math.hypot(this.vel.x,this.vel.y)<.05&&(this.rot.y+=.14*t)}const i=this.uniforms.uOff.value;for(let r=0;r<no;r++){const s=this.offT[r].lengthSq()>1e-6;i[r].lerp(this.offT[r],1-Math.exp(-(s?16:4)*t))}this.uniforms.uExplode.value=this.explode*this.intensity,this.uniforms.uTime.value=n,this.group.rotation.set(this.rot.x,this.rot.y,this.rot.z,"YXZ"),this.group.scale.setScalar(this.fit*this.scale),this.group.position.x=this.shift,this.group.updateMatrixWorld(!0),this.renderer.render(this.scene,this.camera)}}const Pe=c3(20260111),Vi=Math.PI*2,Re=(e,t)=>e+(t-e)*Pe(),p3=Pe;class Ce{constructor(){this.p=[]}get n(){return this.p.length/3}add(t,n,i){return this.p.push(t,n,i),this}merge(...t){for(const n of t){const i=n.p;for(let r=0;r<i.length;r++)this.p.push(i[r])}return this}move(t,n=0,i=0){const r=this.p;for(let s=0;s<r.length;s+=3)r[s]+=t,r[s+1]+=n,r[s+2]+=i;return this}scale(t,n=t,i=t){const r=this.p;for(let s=0;s<r.length;s+=3)r[s]*=t,r[s+1]*=n,r[s+2]*=i;return this}rotate(t,n=0,i=0){const r=new pi(t,n,i),s=new U,o=this.p;for(let a=0;a<o.length;a+=3)s.set(o[a],o[a+1],o[a+2]).applyEuler(r),o[a]=s.x,o[a+1]=s.y,o[a+2]=s.z;return this}align(t){const n=new U(...t).normalize(),i=new Is().setFromUnitVectors(new U(0,1,0),n),r=new U,s=this.p;for(let o=0;o<s.length;o+=3)r.set(s[o],s[o+1],s[o+2]).applyQuaternion(i),s[o]=r.x,s[o+1]=r.y,s[o+2]=r.z;return this}centroid(){const t=this.p,n=Math.max(1,t.length/3);let i=0,r=0,s=0;for(let o=0;o<t.length;o+=3)i+=t[o],r+=t[o+1],s+=t[o+2];return[i/n,r/n,s/n]}}const ve=(...e)=>new Ce().merge(...e),Ut=(e,t,n,i)=>({name:e,desc:t,color:n,instances:i}),wt=(e,t=[0,0,0],n)=>({cloud:e,dir:t,anchor:n||e.centroid()});function Jn(e,t,n,i,r={}){const{a0:s=0,a1:o=Vi,rings:a=0,lines:c=0,cap0:l=!1,cap1:h=!1}=r,u=new Ce,f=o-s,p=f>=Vi-1e-6,g=N=>e+(t-e)*N,v=-n/2,m=a||c?Math.floor(i*.45):0,d=(l?1:0)+(h?1:0),A=d?Math.floor(i*.08):0,T=i-m-A*d;for(let N=0;N<T;N++){const R=Pe(),b=s+f*Pe(),D=g(R);u.add(D*Math.cos(b),v+n*R,D*Math.sin(b))}if(a){const N=Math.floor(m*(c?.5:1)/a);for(let R=0;R<a;R++){const b=a>1?R/(a-1):.5,D=g(b);for(let y=0;y<N;y++){const x=s+f*Pe();u.add(D*Math.cos(x),v+n*b,D*Math.sin(x))}}}if(c){const N=Math.floor(m*(a?.5:1)/c);for(let R=0;R<c;R++){const b=p?R/c:c>1?R/(c-1):.5,D=s+f*b;for(let y=0;y<N;y++){const x=Pe(),w=g(x);u.add(w*Math.cos(D),v+n*x,w*Math.sin(D))}}}const S=(N,R)=>{for(let b=0;b<A;b++){const D=N*Math.sqrt(Pe()),y=s+f*Pe();u.add(D*Math.cos(y),R,D*Math.sin(y))}};return l&&S(e,v),h&&S(t,v+n),u}function fi(e,t,n,i=0){const r=new Ce;for(let s=0;s<n;s++){const o=Math.sqrt(Re(e*e,t*t)),a=Pe()*Vi;r.add(o*Math.cos(a),i,o*Math.sin(a))}return r}function oo(e,t,n){const i=new Ce;for(let r=0;r<n;r++){const s=Pe()*Vi;i.add(e*Math.cos(s),t,e*Math.sin(s))}return i}function ds(e,t,n,i={}){const{a0:r=0,a1:s=Vi}=i,o=new Ce;for(let a=0;a<n;a++){const c=r+(s-r)*Pe(),l=Pe()*Vi,h=e+t*Math.cos(l);o.add(h*Math.cos(c),t*Math.sin(l),h*Math.sin(c))}return o}function Vh(){for(;;){const e=Re(-1,1),t=Re(-1,1),n=Re(-1,1),i=e*e+t*t+n*n;if(i>1||i<1e-4)continue;const r=Math.sqrt(i);return[e/r,t/r,n/r]}}function bn(e,t,n,i){const r=new Ce;for(let s=0;s<i;s++){const[o,a,c]=Vh();r.add(o*e,a*t,c*n)}return r}function Ks(e,t,n,i,r={}){const{edges:s=.25,noBottom:o=!1}=r,a=new Ce,c=[[e*t,()=>[Re(-e/2,e/2),Re(-t/2,t/2),n/2]],[e*t,()=>[Re(-e/2,e/2),Re(-t/2,t/2),-n/2]],[e*n,()=>[Re(-e/2,e/2),t/2,Re(-n/2,n/2)]],[o?0:e*n,()=>[Re(-e/2,e/2),-t/2,Re(-n/2,n/2)]],[t*n,()=>[e/2,Re(-t/2,t/2),Re(-n/2,n/2)]],[t*n,()=>[-e/2,Re(-t/2,t/2),Re(-n/2,n/2)]]],l=c.reduce((f,p)=>f+p[0],0),h=Math.floor(i*(1-s));for(let f=0;f<h;f++){let p=Pe()*l,g=c[0];for(const m of c){if(p<m[0]){g=m;break}p-=m[0]}const v=g[1]();a.add(v[0],v[1],v[2])}const u=[e,t,n];for(let f=h;f<i;f++){const p=Math.floor(Pe()*3),g=[0,0,0];for(let v=0;v<3;v++)g[v]=v===p?Re(-u[v]/2,u[v]/2):(Pe()<.5?-1:1)*u[v]/2;o&&g[1]<0&&(g[1]=t/2),a.add(g[0],g[1],g[2])}return a}function is(e,t,n,i,r,s={}){const{pitch:o=.6,twist:a=.5,y:c=0}=s,l=new Ce,h=Math.floor(r/e);for(let u=0;u<e;u++){const f=u/e*Vi,p=Math.cos(f),g=Math.sin(f);for(let v=0;v<h;v++){const m=Pe(),d=Pe()-.5,A=o+a*(m-.5),T=t+m*(n-t),S=d*i*Math.cos(A),N=d*i*Math.sin(A);l.add(p*T-g*S,c+N,g*T+p*S)}}return l}function Cr(e,t,n={}){const{a0:i=0,a1:r=Vi}=n,s=[];let o=0;for(let c=0;c<e.length-1;c++){const[l,h]=e[c],[u,f]=e[c+1],p=Math.hypot(u-l,f-h)*((l+u)/2+.02);s.push(p),o+=p}const a=new Ce;for(let c=0;c<t;c++){let l=Pe()*o,h=0;for(;h<s.length-1&&l>s[h];)l-=s[h],h++;const[u,f]=e[h],[p,g]=e[h+1],v=Pe(),m=u+(p-u)*v,d=i+(r-i)*Pe();a.add(m*Math.cos(d),f+(g-f)*v,m*Math.sin(d))}return a}function cn(e,t,n,i=200,r={}){const s=new U(...e),o=new U(...t),a=s.distanceTo(o),c=Jn(n,n,a,i,{cap0:r.caps,cap1:r.caps});c.align(o.clone().sub(s));const l=s.clone().add(o).multiplyScalar(.5);return c.move(l.x,l.y,l.z)}function oh(e,t,n,i={}){const r=new s3(e.map(l=>new U(...l)),!!i.closed),s=new Ce,o=new U(0,1,0),a=new U,c=new U;for(let l=0;l<n;l++){const h=Pe(),u=r.getPointAt(h),f=r.getTangentAt(h);a.crossVectors(f,o),a.lengthSq()<1e-4&&a.set(1,0,0).cross(f),a.normalize(),c.crossVectors(f,a);const p=Pe()*Vi,g=t*(i.taper?i.taper(h):1);s.add(u.x+(a.x*Math.cos(p)+c.x*Math.sin(p))*g,u.y+(a.y*Math.cos(p)+c.y*Math.sin(p))*g,u.z+(a.z*Math.cos(p)+c.z*Math.sin(p))*g)}return s}const as=Math.PI,si=e=>e.rotate(0,0,-as/2),m3=.7,Ji=(e,t=[0,0,0])=>[e*m3+t[0],t[1],t[2]];function g3(){const e=[],t=(u,f)=>si(Jn(1.35,1.28,4.9,4600,{a0:u,a1:f,rings:8,lines:16}).move(0,-.55,0));e.push(Ut("Nacelle","Outer casing. It guides the bypass air and carries the engine loads.","#e9e6ff",[wt(t(as/2,3*as/2),[0,1.75,0]),wt(t(-as/2,as/2),[0,-1.75,0])]));const n=ve(is(18,.36,1.18,.36,5400,{pitch:.75,twist:.6}),Cr([[0,-.34],[.16,-.24],[.33,0],[.4,.22]],1300),fi(.3,.42,300,.22),oo(1.18,0,380));e.push(Ut("Fan","Large front fan. Most of its air bypasses the core and makes the thrust.","#4fe3e0",[wt(si(n.move(0,-2.3,0)),Ji(-2.3))]));const i=is(30,.62,1.28,.16,2200,{pitch:1.3,twist:0}).move(0,-1.55,0);e.push(Ut("Guide vanes","Fixed vanes that straighten the swirling bypass air.","#8ad7ff",[wt(si(i),Ji(-1.55,[0,0,.9]))]));const r=ve(Jn(.27,.3,.8,700,{rings:3,lines:8}));for(let u=0;u<3;u++)r.merge(is(26,.28,.62-.05*u,.12,900,{pitch:.7,y:-.3+u*.3}));e.push(Ut("Low-pressure compressor","First compressor stages. They squeeze the air entering the core.","#ffd23f",[wt(si(r.move(0,-1.3,0)),Ji(-1.3))]));const s=ve(Jn(.5,.34,1.2,1700,{rings:6,lines:12}));for(let u=0;u<5;u++){const f=u/4,p=.5+(.34-.5)*f;s.merge(is(30,p,p+.16,.1,720,{pitch:.7,y:-.5+f}))}e.push(Ut("High-pressure compressor","Squeezes the air many times over before it meets the fuel.","#ff9f2e",[wt(si(s.move(0,-.45,0)),Ji(-.45))]));const o=ve(Cr([[.72,-.45],[.76,-.2],[.76,.3],[.64,.5]],1700),Cr([[.34,-.45],[.3,0],[.3,.5]],900),ds(.52,.12,1e3,{}).rotate(0,0,0));for(let u=0;u<16;u++){const f=u/16*as*2;o.merge(cn([.52*Math.cos(f),-.6,.52*Math.sin(f)],[.52*Math.cos(f),-.38,.52*Math.sin(f)],.025,70))}e.push(Ut("Combustion chamber","Fuel burns here with the compressed air, making hot high-pressure gas.","#ff4f9a",[wt(si(o.move(0,.45,0)),Ji(.45,[0,0,-.6]))]));const a=ve();for(let u=0;u<2;u++)a.merge(fi(.12,.55,520,-.15+u*.3),is(36,.4,.63,.11,950,{pitch:.8,y:-.15+u*.3}));e.push(Ut("High-pressure turbine","Extracts energy from the hot gas to drive the high-pressure compressor.","#ff6b4a",[wt(si(a.move(0,1.15,0)),Ji(1.15))]));const c=ve();for(let u=0;u<4;u++){const f=.52+u*.08;c.merge(fi(.12,f-.05,420,-.4+u*.27),is(40,f-.1,f+.1,.1,800,{pitch:.8,y:-.4+u*.27}))}e.push(Ut("Low-pressure turbine","Last turbine stages. They spin the fan through the long core shaft.","#c58bff",[wt(si(c.move(0,1.9,0)),Ji(1.9))]));const l=ve(cn([0,-2.6,0],[0,2.3,0],.07,1100,{caps:!0}),fi(.07,.17,160,-.6),fi(.07,.17,160,1.4));e.push(Ut("Core shaft","Connects the turbines at the back to the fan at the front.","#ffe14d",[wt(si(l),[0,-.5,1.9])]));const h=ve(Cr([[.92,-.5],[.8,0],[.64,.5]],2300),Cr([[.3,-.4],[.2,.2],[0,.7]],900),oo(.92,-.5,260),oo(.64,.5,200));return e.push(Ut("Exhaust nozzle","Accelerates the hot gas out of the back to add thrust.","#f4f1ff",[wt(si(h.move(0,2.9,0)),Ji(2.9))])),e}const tr=Math.PI,nd=9,rs=e=>e.rotate(tr/2,0,0);function _3(e,t,n){const i=new Ce;for(let r=0;r<n;r++){const s=Re(-t/2,t/2),o=e+(Math.sin(s*42)>0?.07:0),a=p3()*tr*2;i.add(o*Math.cos(a),s,o*Math.sin(a))}return i}function v3(){const e=[],t=Array.from({length:nd},(c,l)=>{const h=l/nd*tr*2+tr/2;return[Math.cos(h),Math.sin(h),0]}),n=(c,l,h)=>c.align(l).move(l[0]*h,l[1]*h,l[2]*h),i=ve(bn(.82,.82,.42,3600),ds(.82,.04,500).rotate(tr/2,0,0),fi(.3,.55,600,0).rotate(tr/2,0,0).move(0,0,.42));e.push(Ut("Crankcase","Central housing. It holds the crankshaft and ties all nine cylinders together.","#46d9d0",[wt(i,[0,0,.2])])),e.push(Ut("Cylinders (9)","Nine finned cylinders around the crankcase. Air flowing past the fins cools them.","#d4c9ff",t.map(c=>{const l=ve(_3(.19,.85,1500),bn(.25,.15,.25,520).move(0,.47,0),oo(.26,-.42,160));return wt(n(l,c,.78+.425),[c[0]*1.6,c[1]*1.6,0])}))),e.push(Ut("Pistons","Each piston is pushed by burning fuel and drives the crankshaft.","#ffd23f",t.map(c=>{const l=ve(Jn(.15,.15,.22,380,{rings:3,cap1:!0}));return wt(n(l,c,.98),[c[0]*.85,c[1]*.85,0])}))),e.push(Ut("Connecting rods","Link every piston to the master rod on the crankshaft.","#38c9b8",t.map(c=>wt(n(cn([0,0,0],[0,.78,0],.028,160),c,.15),[c[0]*.45,c[1]*.45,0]))));const r=ve(rs(Jn(.14,.14,1.3,1200,{rings:4,lines:6,cap0:!0,cap1:!0})),rs(fi(.05,.46,900,0)),bn(.12,.12,.12,220).move(.3,0,.12));e.push(Ut("Crankshaft","Turns the up-and-down piston motion into rotation for the propeller.","#ffffff",[wt(r,[0,0,-1])]));const s=ve(rs(fi(.18,.98,1700,0)),rs(ds(.98,.05,520)),rs(Jn(.18,.22,.4,500,{rings:2,lines:8})).move(0,0,-.2)).move(0,0,-.6);e.push(Ut("Propeller hub","Reduction gear cover. The propeller bolts onto this.","#ff5a52",[wt(s,[0,0,-2.5])]));const o=ve(rs(ds(1.95,.09,1500)));for(const c of t)o.merge(n(cn([0,0,0],[0,.4,0],.035,90),c,1.55));e.push(Ut("Exhaust ring","Collects the hot exhaust from every cylinder into one outlet.","#ffa53a",[wt(o.move(0,0,.15),[0,0,1.8])]));const a=ve(bn(.58,.58,.34,1900),Cr([[.2,.3],[.16,.8]],400).rotate(tr/2,0,0).move(0,0,.1),oo(.58,0,280).rotate(tr/2,0,0)).move(0,0,.8);return e.push(Ut("Supercharger","Pumps extra air into the engine for more power at altitude.","#ff3d5a",[wt(a,[0,0,3])])),e}const Sr=Math.PI,Qc=new o3([[2.25,.02],[2.15,.18],[1.7,.34],[1.1,.42],[.6,.48],[.15,.92],[-.2,.96],[-.7,.9],[-1.15,.6],[-1.6,.5],[-2.1,.45],[-2.25,.3]].map(e=>new ee(e[0],e[1]))).getPoints(400);function Vp(e){for(let t=0;t<Qc.length-1;t++){const n=Qc[t],i=Qc[t+1];if(e<=n.x&&e>=i.x||e>=n.x&&e<=i.x){const r=(e-n.x)/(i.x-n.x||1);return n.y+(i.y-n.y)*r}}return e>0?.02:.3}const Gp=e=>.92*Math.pow(Math.max(0,1-Math.pow(Math.abs(e)/2.3,5)),.4);function aa(e,t,n){const i=new Ce;for(let r=0;r<n;r++){const s=Re(e,t),o=Vp(s),a=Gp(s)*(1-.3*Ze((o-.45)/.45,0,1)),c=Re(-a,a);i.add(s,o-.06*(c/a)*(c/a),c)}return i}function ss(e,t,n,i){const r=new Ce;for(let s=0;s<i;s++){const o=Re(e,t),a=Re(.04,Math.max(.1,Vp(o)-.03)),c=Gp(o)*(1-.3*Ze((a-.45)/.5,0,1));r.add(o,a,n*c)}return r}function x3(){const e=[];e.push(Ut("Hood","Covers the engine bay and shapes the airflow over the nose.","#ff4f6e",[wt(aa(.55,2.2,3200),[.7,1.25,0])])),e.push(Ut("Windshield","Laminated glass. It carries the cabin loads in a crash.","#6fe3ff",[wt(aa(-.15,.55,1500),[.2,1.75,0])])),e.push(Ut("Roof","Closes the cabin and ties the pillars together.","#ff8fb8",[wt(aa(-.75,-.15,1500),[0,2.2,0])])),e.push(Ut("Trunk lid","Rear deck over the luggage space.","#ff4f6e",[wt(aa(-2.25,-.75,2600),[-.7,1.25,0])])),e.push(Ut("Doors","Side panels with the door frame and side-impact beams.","#ff8fb8",[wt(ss(-.95,.55,1,2e3),[0,.3,1.8]),wt(ss(-.95,.55,-1,2e3),[0,.3,-1.8])])),e.push(Ut("Front fenders","Front wing panels that wrap the front wheels.","#ff3d54",[wt(ss(.55,2.25,1,2e3),[.5,.2,1.8]),wt(ss(.55,2.25,-1,2e3),[.5,.2,-1.8])])),e.push(Ut("Rear fenders","Rear wing panels that wrap the rear wheels.","#ff3d54",[wt(ss(-2.25,-.95,1,1700),[-.5,.2,1.8]),wt(ss(-2.25,-.95,-1,1700),[-.5,.2,-1.8])]));const t=ve(Ks(.5,.03,1.5,900,{edges:.4}).move(-2.2,.78,0),cn([-2.2,.45,.5],[-2.2,.78,.5],.03,120),cn([-2.2,.45,-.5],[-2.2,.78,-.5],.03,120));e.push(Ut("Rear spoiler","Adds downforce so the car stays planted at speed.","#ff3d4e",[wt(t,[-1.3,1.9,0])])),e.push(Ut("Headlights","LED headlamp units in the front corners.","#fff06a",[wt(bn(.12,.07,.17,380).move(2.05,.28,.6),[1.2,.6,.5]),wt(bn(.12,.07,.17,380).move(2.05,.28,-.6),[1.2,.6,-.5])]));const n=h=>ve(Ks(.45,.1,.42,520).move(-.45,.28,h),Ks(.1,.5,.42,520).rotate(0,0,.18).move(-.68,.52,h));e.push(Ut("Seats","Bucket seats with side bolsters.","#ff7ad0",[wt(n(.32),[-.4,1.3,.6]),wt(n(-.32),[-.4,1.3,-.6])]));const i=ve(ds(.14,.018,420).rotate(0,0,1),cn([0,0,0],[.12,-.2,0],.014,90)).move(.05,.52,-.32);e.push(Ut("Steering wheel","Leather-wrapped wheel with the steering column.","#ffffff",[wt(i,[.7,1.6,-.3])]));const r=ve(Ks(.9,.42,.7,2300,{edges:.3}).move(1,.12,0),Ks(.5,.12,.5,400).move(1,.42,0));for(let h=0;h<6;h++)r.merge(Jn(.07,.07,.2,200,{cap1:!0}).move(.7+h%3*.3,.38,h<3?.17:-.17));e.push(Ut("Engine","Mid-front V6 that provides the power.","#ffd23f",[wt(r,[1.2,.5,0])]));const s=ve(cn([.5,-.05,0],[-1.35,-.05,0],.06,700,{caps:!0}),bn(.22,.18,.3,700).move(-1.35,-.05,0));e.push(Ut("Driveshaft","Carries power from the gearbox to the rear differential.","#ff9f2e",[wt(s,[-.2,-2,0])]));const o=ve(oh([[.5,-.1,.3],[-.3,-.15,.32],[-1.2,-.15,.35],[-2.1,-.12,.35]],.05,800),Jn(.12,.12,.6,520,{rings:3,cap0:!0,cap1:!0}).rotate(0,0,Sr/2).move(-1.7,-.14,.35),Jn(.07,.09,.2,200).rotate(0,0,Sr/2).move(-2.25,-.1,.3),Jn(.07,.09,.2,200).rotate(0,0,Sr/2).move(-2.25,-.1,.55));e.push(Ut("Exhaust","Routes exhaust gas past the muffler and out the back.","#ff6a3d",[wt(o,[-1.3,-1.5,.9])]));const a=ve(cn([-2,-.1,.55],[2,-.1,.55],.035,900),cn([-2,-.1,-.55],[2,-.1,-.55],.035,900),...[-1.8,-1,-.2,.6,1.4,2].map(h=>cn([h,-.1,-.55],[h,-.1,.55],.03,420)),cn([1.35,0,-.95],[1.35,0,.95],.03,340),cn([-1.35,0,-.95],[-1.35,0,.95],.03,340));e.push(Ut("Chassis frame","The structural skeleton. Everything else bolts onto it.","#ffffff",[wt(a,[0,-1.1,0])]));const c=[];for(const h of[1,-1])for(const u of[1,-1])c.push([h*1.35,u]);const l=()=>{const h=ve(ds(.34,.14,1500).rotate(Sr/2,0,0),fi(0,.24,520).rotate(Sr/2,0,0));for(let u=0;u<5;u++){const f=u/5*Sr*2;h.merge(cn([0,0,0],[.24*Math.cos(f),.24*Math.sin(f),0],.018,90))}return h};return e.push(Ut("Wheels & tires","Alloy wheels with performance tires.","#f4f1ff",c.map(([h,u])=>wt(l().move(h,.02,u*.95),[h*.2,-.15,u*1.5])))),e.push(Ut("Brake discs","Ventilated discs that stop the car.","#4fe3e0",c.map(([h,u])=>wt(ve(fi(.07,.21,380).rotate(Sr/2,0,0)).move(h,.02,u*.74),[0,0,u*.9])))),e}const M3=Math.PI,y3=1.15,S3=.92,E3=1.55;function T3(){for(;;){const[e,t,n]=Vh();if(n<-.3&&t<-.35)continue;let i=t;i<-.2&&(i=-.2+(i+.2)*.5);const r=i>0?1-.22*Math.exp(-(e*e)/.006)*Math.min(1,i*2.5):1,o=(1+.045*Math.sin(10*e+3*Math.sin(7*i))*Math.sin(9*n+2*Math.sin(6*e))+.03*Math.sin(15*i+6*n))*r;return{d:[e,t,n],p:[y3*e*o,S3*i*o,E3*n*o]}}}function A3(){const e=[],t={frontal:[new Ce,new Ce],parietal:[new Ce,new Ce],occipital:[new Ce,new Ce],temporal:[new Ce,new Ce]};for(let c=0;c<34e3;c++){const{d:l,p:h}=T3(),[,u,f]=l;let p;f>.35&&u>-.25?p="frontal":f<-.35?p="occipital":u>.2?p="parietal":p="temporal",t[p][h[0]<0?0:1].add(h[0],h[1],h[2])}const n=(c,l,h,u,f,p)=>e.push(Ut(l,h,u,[wt(t[c][1],p),wt(t[c][0],f)]));n("frontal","Frontal lobe","Planning, decisions, speech and voluntary movement.","#c9b6ff",[-.9,.2,1.4],[.9,.2,1.4]),n("parietal","Parietal lobe","Processes touch and helps you sense where your body is in space.","#ff8fd0",[-.9,1.25,-.3],[.9,1.25,-.3]),n("occipital","Occipital lobe","The visual centre. It turns signals from the eyes into images.","#ff6f6f",[-.9,.2,-1.45],[.9,.2,-1.45]),n("temporal","Temporal lobe","Hearing, language comprehension and memory.","#ffc247",[-1.7,-.6,.1],[1.7,-.6,.1]);const i=oh([[0,.1,.85],[0,.35,.55],[0,.5,0],[0,.35,-.6],[0,.05,-.9]],.11,2e3,{taper:c=>.6+.4*Math.sin(M3*c)});e.push(Ut("Corpus callosum","A thick band of fibres that lets the two hemispheres talk to each other.","#ffe14d",[wt(i,[0,.55,0])])),e.push(Ut("Thalamus","Relay station that routes sensory signals to the cortex.","#ffb02e",[wt(bn(.2,.16,.26,600).move(.24,.02,0),[.7,-.2,0]),wt(bn(.2,.16,.26,600).move(-.24,.02,0),[-.7,-.2,0])]));const r=c=>oh([[.5*c,-.45,.35],[.62*c,-.5,0],[.6*c,-.4,-.45],[.45*c,-.2,-.85]],.07,800,{taper:l=>.7+.5*l});e.push(Ut("Hippocampus","Forms new memories. Named after the seahorse it resembles.","#4fe3e0",[wt(r(1),[1,-.9,-.1]),wt(r(-1),[-1,-.9,-.1])])),e.push(Ut("Amygdala","Handles emotion, especially fear and alertness.","#ff4fa8",[wt(bn(.13,.13,.13,320).move(.55,-.32,.5),[1.2,-1,.6]),wt(bn(.13,.13,.13,320).move(-.55,-.32,.5),[-1.2,-1,.6])]));const s=ve(bn(.14,.1,.14,380).move(0,-.38,.28),bn(.07,.07,.07,160).move(0,-.62,.35),cn([0,-.4,.3],[0,-.58,.35],.02,60));e.push(Ut("Hypothalamus & pituitary","Controls hormones, hunger, sleep and body temperature.","#ff8ac8",[wt(s,[0,-1.3,.7])]));const o=Cr([[.2,0],[.17,-.35],[.15,-.8]],1500).move(0,-.55,-.3);e.push(Ut("Brainstem","Links the brain to the spinal cord and runs breathing and heartbeat.","#52e0d0",[wt(o,[0,-1.5,-.3])]));const a=new Ce;for(let c=0;c<4800;c++){const[l,h,u]=Vh();if(h>.5)continue;const f=1+.05*Math.sin(26*h);a.add(.78*l*f,-.62+.42*h*f,-1+.52*u*f)}return e.push(Ut("Cerebellum",'The "little brain". It fine-tunes balance and coordination.',"#ff5bd2",[wt(a,[0,-.9,-1.4])])),e}const mo=[{id:"jet",name:"Turbofan Jet Engine",category:"Machines",subtitle:"Fan, compressors, combustor, turbines, nozzle",view:{x:.28,y:-.55,z:0},build:g3},{id:"radial",name:"Radial Aircraft Engine",category:"Machines",subtitle:"Nine cylinders around one crankshaft",view:{x:.35,y:.55,z:0},build:v3},{id:"car",name:"Sports Car",category:"Machines",subtitle:"Body, chassis, drivetrain and interior",view:{x:.3,y:-.7,z:0},build:x3},{id:"brain",name:"Human Brain",category:"Biology",subtitle:"Lobes, cerebellum and the structures inside",view:{x:.18,y:.7,z:0},build:A3}];var bo=typeof self<"u"?self:{};function Hp(e){t:{for(var t=["CLOSURE_FLAGS"],n=bo,i=0;i<t.length;i++)if((n=n[t[i]])==null){t=null;break t}t=n}return(e=t&&t[e])!=null&&e}function Er(){throw Error("Invalid UTF8")}function id(e,t){return t=String.fromCharCode.apply(null,t),e==null?t:e+t}let ca,tl;const b3=typeof TextDecoder<"u";let w3;const R3=typeof TextEncoder<"u";function Wp(e){if(R3)e=(w3||(w3=new TextEncoder)).encode(e);else{let n=0;const i=new Uint8Array(3*e.length);for(let r=0;r<e.length;r++){var t=e.charCodeAt(r);if(128>t)i[n++]=t;else{if(2048>t)i[n++]=t>>6|192;else{if(55296<=t&&57343>=t){if(56319>=t&&r<e.length){const s=e.charCodeAt(++r);if(56320<=s&&57343>=s){t=1024*(t-55296)+s-56320+65536,i[n++]=t>>18|240,i[n++]=t>>12&63|128,i[n++]=t>>6&63|128,i[n++]=63&t|128;continue}r--}t=65533}i[n++]=t>>12|224,i[n++]=t>>6&63|128}i[n++]=63&t|128}}e=n===i.length?i:i.subarray(0,n)}return e}var go,Xp=Hp(610401301),C3=Hp(188588736);const rd=bo.navigator;function ah(e){return!!Xp&&!!go&&go.brands.some(({brand:t})=>t&&t.indexOf(e)!=-1)}function kn(e){var t;return(t=bo.navigator)&&(t=t.userAgent)||(t=""),t.indexOf(e)!=-1}function ir(){return!!Xp&&!!go&&0<go.brands.length}function el(){return ir()?ah("Chromium"):(kn("Chrome")||kn("CriOS"))&&!(!ir()&&kn("Edge"))||kn("Silk")}function Gh(e){return Gh[" "](e),e}go=rd&&rd.userAgentData||null,Gh[" "]=function(){};var P3=!ir()&&(kn("Trident")||kn("MSIE"));!kn("Android")||el(),el(),kn("Safari")&&(el()||!ir()&&kn("Coast")||!ir()&&kn("Opera")||!ir()&&kn("Edge")||(ir()?ah("Microsoft Edge"):kn("Edg/"))||ir()&&ah("Opera"));var qp={},io=null;function L3(e){var t=e.length,n=3*t/4;n%3?n=Math.floor(n):"=.".indexOf(e[t-1])!=-1&&(n="=.".indexOf(e[t-2])!=-1?n-2:n-1);var i=new Uint8Array(n),r=0;return function(s,o){function a(p){for(;c<s.length;){var g=s.charAt(c++),v=io[g];if(v!=null)return v;if(!/^[\s\xa0]*$/.test(g))throw Error("Unknown base64 encoding at char: "+g)}return p}Yp();for(var c=0;;){var l=a(-1),h=a(0),u=a(64),f=a(64);if(f===64&&l===-1)break;o(l<<2|h>>4),u!=64&&(o(h<<4&240|u>>2),f!=64&&o(u<<6&192|f))}}(e,function(s){i[r++]=s}),r!==n?i.subarray(0,r):i}function Yp(){if(!io){io={};for(var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),t=["+/=","+/","-_=","-_.","-_"],n=0;5>n;n++){var i=e.concat(t[n].split(""));qp[n]=i;for(var r=0;r<i.length;r++){var s=i[r];io[s]===void 0&&(io[s]=r)}}}}var jp=typeof Uint8Array<"u",Kp=!P3&&typeof btoa=="function";function sd(e){if(!Kp){var t;t===void 0&&(t=0),Yp(),t=qp[t];var n=Array(Math.floor(e.length/3)),i=t[64]||"";let c=0,l=0;for(;c<e.length-2;c+=3){var r=e[c],s=e[c+1],o=e[c+2],a=t[r>>2];r=t[(3&r)<<4|s>>4],s=t[(15&s)<<2|o>>6],o=t[63&o],n[l++]=a+r+s+o}switch(a=0,o=i,e.length-c){case 2:o=t[(15&(a=e[c+1]))<<2]||i;case 1:e=e[c],n[l]=t[e>>2]+t[(3&e)<<4|a>>4]+o+i}return n.join("")}for(t="",n=0,i=e.length-10240;n<i;)t+=String.fromCharCode.apply(null,e.subarray(n,n+=10240));return t+=String.fromCharCode.apply(null,n?e.subarray(n):e),btoa(t)}const od=/[-_.]/g,D3={"-":"+",_:"/",".":"="};function I3(e){return D3[e]||""}function $p(e){if(!Kp)return L3(e);od.test(e)&&(e=e.replace(od,I3)),e=atob(e);const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}function wo(e){return jp&&e!=null&&e instanceof Uint8Array}let U3;function Ka(){return U3||(U3=new Uint8Array(0))}var ys={};let N3;function Zp(e){if(e!==ys)throw Error("illegal external caller")}function zr(){return N3||(N3=new Fi(null,ys))}function Hh(e){Zp(ys);var t=e.g;return(t=t==null||wo(t)?t:typeof t=="string"?$p(t):null)==null?t:e.g=t}var Fi=class{constructor(e,t){if(Zp(t),this.g=e,e!=null&&e.length===0)throw Error("ByteString should be constructed with non-empty values")}h(){const e=Hh(this);return e?new Uint8Array(e):Ka()}};function Jp(e,t){return Error(`Invalid wire type: ${e} (at position ${t})`)}function Wh(){return Error("Failed to read varint, encoding is invalid.")}function Qp(e,t){return Error(`Tried to read past the end of the data ${t} > ${e}`)}function Xh(e){if(typeof e=="string")return{buffer:$p(e),P:!1};if(Array.isArray(e))return{buffer:new Uint8Array(e),P:!1};if(e.constructor===Uint8Array)return{buffer:e,P:!1};if(e.constructor===ArrayBuffer)return{buffer:new Uint8Array(e),P:!1};if(e.constructor===Fi)return{buffer:Hh(e)||Ka(),P:!0};if(e instanceof Uint8Array)return{buffer:new Uint8Array(e.buffer,e.byteOffset,e.byteLength),P:!1};throw Error("Type not convertible to a Uint8Array, expected a Uint8Array, an ArrayBuffer, a base64 encoded string, a ByteString or an Array of numbers")}function qh(){return typeof BigInt=="function"}const F3=typeof Uint8Array.prototype.slice=="function";let tm,xe=0,Ve=0;function Ir(e){const t=0>e;let n=(e=Math.abs(e))>>>0;if(e=Math.floor((e-n)/4294967296),t){const[i,r]=Kh(n,e);e=r,n=i}xe=n>>>0,Ve=e>>>0}function Yh(e){const t=tm||(tm=new DataView(new ArrayBuffer(8)));t.setFloat32(0,+e,!0),Ve=0,xe=t.getUint32(0,!0)}function ch(e,t){return 4294967296*t+(e>>>0)}function jh(e,t){const n=2147483648&t;return n&&(t=~t>>>0,(e=1+~e>>>0)==0&&(t=t+1>>>0)),e=ch(e,t),n?-e:e}function Da(e,t){if(e>>>=0,2097151>=(t>>>=0))var n=""+(4294967296*t+e);else qh()?n=""+(BigInt(t)<<BigInt(32)|BigInt(e)):(e=(16777215&e)+6777216*(n=16777215&(e>>>24|t<<8))+6710656*(t=t>>16&65535),n+=8147497*t,t*=2,1e7<=e&&(n+=Math.floor(e/1e7),e%=1e7),1e7<=n&&(t+=Math.floor(n/1e7),n%=1e7),n=t+ad(n)+ad(e));return n}function ad(e){return e=String(e),"0000000".slice(e.length)+e}function em(){var e=xe,t=Ve;if(2147483648&t)if(qh())e=""+(BigInt(0|t)<<BigInt(32)|BigInt(e>>>0));else{const[n,i]=Kh(e,t);e="-"+Da(n,i)}else e=Da(e,t);return e}function $a(e){if(16>e.length)Ir(Number(e));else if(qh())e=BigInt(e),xe=Number(e&BigInt(4294967295))>>>0,Ve=Number(e>>BigInt(32)&BigInt(4294967295));else{const t=+(e[0]==="-");Ve=xe=0;const n=e.length;for(let i=t,r=(n-t)%6+t;r<=n;i=r,r+=6){const s=Number(e.slice(i,r));Ve*=1e6,xe=1e6*xe+s,4294967296<=xe&&(Ve+=Math.trunc(xe/4294967296),Ve>>>=0,xe>>>=0)}if(t){const[i,r]=Kh(xe,Ve);xe=i,Ve=r}}}function Kh(e,t){return t=~t,e?e=1+~e:t+=1,[e,t]}function $h(e,t){let n,i=0,r=0,s=0;const o=e.h;let a=e.g;do n=o[a++],i|=(127&n)<<s,s+=7;while(32>s&&128&n);for(32<s&&(r|=(127&n)>>4),s=3;32>s&&128&n;s+=7)n=o[a++],r|=(127&n)<<s;if(Ur(e,a),128>n)return t(i>>>0,r>>>0);throw Wh()}function Zh(e){let t=0,n=e.g;const i=n+10,r=e.h;for(;n<i;){const s=r[n++];if(t|=s,(128&s)==0)return Ur(e,n),!!(127&t)}throw Wh()}function cr(e){const t=e.h;let n=e.g,i=t[n++],r=127&i;if(128&i&&(i=t[n++],r|=(127&i)<<7,128&i&&(i=t[n++],r|=(127&i)<<14,128&i&&(i=t[n++],r|=(127&i)<<21,128&i&&(i=t[n++],r|=i<<28,128&i&&128&t[n++]&&128&t[n++]&&128&t[n++]&&128&t[n++]&&128&t[n++])))))throw Wh();return Ur(e,n),r}function lr(e){return cr(e)>>>0}function lh(e){var t=e.h;const n=e.g,i=t[n],r=t[n+1],s=t[n+2];return t=t[n+3],Ur(e,e.g+4),(i<<0|r<<8|s<<16|t<<24)>>>0}function hh(e){var t=lh(e);e=2*(t>>31)+1;const n=t>>>23&255;return t&=8388607,n==255?t?NaN:1/0*e:n==0?e*Math.pow(2,-149)*t:e*Math.pow(2,n-150)*(t+Math.pow(2,23))}function O3(e){return cr(e)}function nl(e,t,{ca:n=!1}={}){e.ca=n,t&&(t=Xh(t),e.h=t.buffer,e.m=t.P,e.j=0,e.l=e.h.length,e.g=e.j)}function Ur(e,t){if(e.g=t,t>e.l)throw Qp(e.l,t)}function nm(e,t){if(0>t)throw Error(`Tried to read a negative byte length: ${t}`);const n=e.g,i=n+t;if(i>e.l)throw Qp(t,e.l-n);return e.g=i,n}function im(e,t){if(t==0)return zr();var n=nm(e,t);return e.ca&&e.m?n=e.h.subarray(n,n+t):(e=e.h,n=n===(t=n+t)?Ka():F3?e.slice(n,t):new Uint8Array(e.subarray(n,t))),n.length==0?zr():new Fi(n,ys)}var cd=[];function rm(e){var t=e.g;if(t.g==t.l)return!1;e.l=e.g.g;var n=lr(e.g);if(t=n>>>3,!(0<=(n&=7)&&5>=n))throw Jp(n,e.l);if(1>t)throw Error(`Invalid field number: ${t} (at position ${e.l})`);return e.m=t,e.h=n,!0}function ya(e){switch(e.h){case 0:e.h!=0?ya(e):Zh(e.g);break;case 1:Ur(e=e.g,e.g+8);break;case 2:if(e.h!=2)ya(e);else{var t=lr(e.g);Ur(e=e.g,e.g+t)}break;case 5:Ur(e=e.g,e.g+4);break;case 3:for(t=e.m;;){if(!rm(e))throw Error("Unmatched start-group tag: stream EOF");if(e.h==4){if(e.m!=t)throw Error("Unmatched end-group tag");break}ya(e)}break;default:throw Jp(e.h,e.l)}}function Ro(e,t,n){const i=e.g.l,r=lr(e.g),s=e.g.g+r;let o=s-i;if(0>=o&&(e.g.l=s,n(t,e,void 0,void 0,void 0),o=s-e.g.g),o)throw Error(`Message parsing ended unexpectedly. Expected to read ${r} bytes, instead read ${r-o} bytes, either the data ended unexpectedly or the message misreported its own length`);return e.g.g=s,e.g.l=i,t}function Jh(e){var t=lr(e.g),n=nm(e=e.g,t);if(e=e.h,b3){var i,r=e;(i=tl)||(i=tl=new TextDecoder("utf-8",{fatal:!0})),t=n+t,r=n===0&&t===r.length?r:r.subarray(n,t);try{var s=i.decode(r)}catch(a){if(ca===void 0){try{i.decode(new Uint8Array([128]))}catch{}try{i.decode(new Uint8Array([97])),ca=!0}catch{ca=!1}}throw!ca&&(tl=void 0),a}}else{t=(s=n)+t,n=[];let a,c=null;for(;s<t;){var o=e[s++];128>o?n.push(o):224>o?s>=t?Er():(a=e[s++],194>o||(192&a)!=128?(s--,Er()):n.push((31&o)<<6|63&a)):240>o?s>=t-1?Er():(a=e[s++],(192&a)!=128||o===224&&160>a||o===237&&160<=a||(192&(i=e[s++]))!=128?(s--,Er()):n.push((15&o)<<12|(63&a)<<6|63&i)):244>=o?s>=t-2?Er():(a=e[s++],(192&a)!=128||a-144+(o<<28)>>30||(192&(i=e[s++]))!=128||(192&(r=e[s++]))!=128?(s--,Er()):(o=(7&o)<<18|(63&a)<<12|(63&i)<<6|63&r,o-=65536,n.push(55296+(o>>10&1023),56320+(1023&o)))):Er(),8192<=n.length&&(c=id(c,n),n.length=0)}s=id(c,n)}return s}function sm(e){const t=lr(e.g);return im(e.g,t)}function Za(e,t,n){var i=lr(e.g);for(i=e.g.g+i;e.g.g<i;)n.push(t(e.g))}var la=[];function ld(e){return e?/^\d+$/.test(e)?($a(e),new hd(xe,Ve)):null:B3||(B3=new hd(0,0))}var hd=class{constructor(e,t){this.h=e>>>0,this.g=t>>>0}};let B3;function ud(e){return e?/^-?\d+$/.test(e)?($a(e),new fd(xe,Ve)):null:k3||(k3=new fd(0,0))}var fd=class{constructor(e,t){this.h=e>>>0,this.g=t>>>0}};let k3;function Ia(e,t,n){for(;0<n||127<t;)e.g.push(127&t|128),t=(t>>>7|n<<25)>>>0,n>>>=7;e.g.push(t)}function Co(e,t){for(;127<t;)e.g.push(127&t|128),t>>>=7;e.g.push(t)}function Ja(e,t){if(0<=t)Co(e,t);else{for(let n=0;9>n;n++)e.g.push(127&t|128),t>>=7;e.g.push(1)}}function _o(e,t){e.g.push(t>>>0&255),e.g.push(t>>>8&255),e.g.push(t>>>16&255),e.g.push(t>>>24&255)}function Ss(e,t){t.length!==0&&(e.l.push(t),e.h+=t.length)}function Gn(e,t,n){Co(e.g,8*t+n)}function Qh(e,t){return Gn(e,t,2),t=e.g.end(),Ss(e,t),t.push(e.h),t}function tu(e,t){var n=t.pop();for(n=e.h+e.g.length()-n;127<n;)t.push(127&n|128),n>>>=7,e.h++;t.push(n),e.h++}function Qa(e,t,n){Gn(e,t,2),Co(e.g,n.length),Ss(e,e.g.end()),Ss(e,n)}function uh(e,t,n,i){n!=null&&(t=Qh(e,t),i(n,e),tu(e,t))}class Ns{constructor(t,n,i,r){this.g=t,this.h=n,this.l=i,this.pa=r}}function wn(e){return Array.prototype.slice.call(e)}function eu(e){return typeof Symbol=="function"&&typeof Symbol()=="symbol"?Symbol():e}var mi=eu(),dd=eu("0di"),il=eu("2ex"),nu=mi?(e,t)=>{e[mi]|=t}:(e,t)=>{e.g!==void 0?e.g|=t:Object.defineProperties(e,{g:{value:t,configurable:!0,writable:!0,enumerable:!1}})},Ua=mi?(e,t)=>{e[mi]&=~t}:(e,t)=>{e.g!==void 0&&(e.g&=~t)};function en(e,t,n){return n?e|t:e&~t}var Ie=mi?e=>0|e[mi]:e=>0|e.g,re=mi?e=>e[mi]:e=>e.g,Le=mi?(e,t)=>(e[mi]=t,e):(e,t)=>(e.g!==void 0?e.g=t:Object.defineProperties(e,{g:{value:t,configurable:!0,writable:!0,enumerable:!1}}),e);function Fs(e){return nu(e,34),e}function z3(e,t){Le(t,-14591&(0|e))}function fh(e,t){Le(t,-14557&(34|e))}function om(e){return(e=e>>14&1023)===0?536870912:e}var iu,Po={},am={};function pd(e){return!(!e||typeof e!="object"||e.Ja!==am)}function ru(e){return e!==null&&typeof e=="object"&&!Array.isArray(e)&&e.constructor===Object}function su(e,t,n){if(e!=null){if(typeof e=="string")e=e?new Fi(e,ys):zr();else if(e.constructor!==Fi)if(wo(e))e=e.length?new Fi(n?e:new Uint8Array(e),ys):zr();else{if(!t)throw Error();e=void 0}}return e}function Na(e,t,n){if(!Array.isArray(e)||e.length)return!1;const i=Ie(e);return!!(1&i)||!(!t||!(Array.isArray(t)?t.includes(n):t.has(n)))&&(Le(e,1|i),!0)}const md=[];function xi(e){if(2&e)throw Error()}Le(md,55),iu=Object.freeze(md);class Fa{constructor(t,n,i){this.l=0,this.g=t,this.h=n,this.m=i}next(){if(this.l<this.g.length){const t=this.g[this.l++];return{done:!1,value:this.h?this.h.call(this.m,t):t}}return{done:!0,value:void 0}}[Symbol.iterator](){return new Fa(this.g,this.h,this.m)}}let or,V3,G3;function cm(e,t){(t=or?t[or]:void 0)&&(e[or]=wn(t))}function lm(e,t){e.__closure__error__context__984382||(e.__closure__error__context__984382={}),e.__closure__error__context__984382.severity=t}function H3(){const e=Error();lm(e,"incident"),function(t){bo.setTimeout(()=>{throw t},0)}(e)}function dh(e){return lm(e=Error(e),"warning"),e}function dr(e){return e==null||typeof e=="number"?e:e==="NaN"||e==="Infinity"||e==="-Infinity"?Number(e):void 0}function hm(e){return e==null||typeof e=="boolean"?e:typeof e=="number"?!!e:void 0}Object.freeze(new class{}),Object.freeze(new class{});const W3=/^-?([1-9][0-9]*|0)(\.[0-9]+)?$/;function tc(e){const t=typeof e;return t==="number"?Number.isFinite(e):t==="string"&&W3.test(e)}function Os(e){if(e==null)return e;if(typeof e=="string"){if(!e)return;e=+e}return typeof e=="number"&&Number.isFinite(e)?0|e:void 0}function X3(e){if(e==null)return e;if(typeof e=="string"){if(!e)return;e=+e}return typeof e=="number"&&Number.isFinite(e)?e>>>0:void 0}function gd(e){return e[0]!=="-"&&(20>e.length||e.length===20&&184467>Number(e.substring(0,6)))}function um(e){return e[0]==="-"?20>e.length||e.length===20&&-922337<Number(e.substring(0,7)):19>e.length||e.length===19&&922337>Number(e.substring(0,6))}function ou(e){return e=Math.trunc(e),Number.isSafeInteger(e)||(Ir(e),e=jh(xe,Ve)),e}function au(e){var t=Math.trunc(Number(e));return Number.isSafeInteger(t)?String(t):((t=e.indexOf("."))!==-1&&(e=e.substring(0,t)),um(e)||($a(e),e=em()),e)}function Oa(e){return e==null?e:tc(e)?typeof e=="number"?ou(e):au(e):void 0}function Lo(e){if(typeof e!="string")throw Error();return e}function Bs(e){if(e!=null&&typeof e!="string")throw Error();return e}function Nr(e){return e==null||typeof e=="string"?e:void 0}function cu(e,t,n,i){if(e!=null&&typeof e=="object"&&e.X===Po)return e;if(!Array.isArray(e))return n?2&i?(e=t[dd])?t=e:(Fs((e=new t).s),t=t[dd]=e):t=new t:t=void 0,t;let r=n=Ie(e);return r===0&&(r|=32&i),r|=2&i,r!==n&&Le(e,r),new t(e)}function q3(e,t,n){if(t){var i=!!i;if(!tc(t=e))throw dh("int64");typeof t=="string"?i=au(t):i?(i=Math.trunc(t),Number.isSafeInteger(i)?i=String(i):um(t=String(i))?i=t:(Ir(i),i=em())):i=ou(t)}else i=Oa(e);return typeof(n=(e=i)==null?n?0:void 0:e)=="string"&&(i=+n,Number.isSafeInteger(i))?i:n}let Ba,lu,Y3;function ka(e){switch(typeof e){case"boolean":return lu||(lu=[0,void 0,!0]);case"number":return 0<e?void 0:e===0?Y3||(Y3=[0,void 0]):[-e,void 0];case"string":return[0,e];case"object":return e}}function Fr(e,t){return fm(e,t[0],t[1])}function fm(e,t,n){if(e==null&&(e=Ba),Ba=void 0,e==null){var i=96;n?(e=[n],i|=512):e=[],t&&(i=-16760833&i|(1023&t)<<14)}else{if(!Array.isArray(e))throw Error("narr");if(2048&(i=Ie(e)))throw Error("farr");if(64&i)return e;if(i|=64,n&&(i|=512,n!==e[0]))throw Error("mid");t:{const r=(n=e).length;if(r){const s=r-1;if(ru(n[s])){if(1024<=(t=s-(+!!(512&(i|=256))-1)))throw Error("pvtlmt");i=-16760833&i|(1023&t)<<14;break t}}if(t){if(1024<(t=Math.max(t,r-(+!!(512&i)-1))))throw Error("spvt");i=-16760833&i|(1023&t)<<14}}}return Le(e,i),e}const j3={};let K3=function(){try{return Gh(new class extends Map{constructor(){super()}}),!1}catch{return!0}}();class rl{constructor(){this.g=new Map}get(t){return this.g.get(t)}set(t,n){return this.g.set(t,n),this.size=this.g.size,this}delete(t){return t=this.g.delete(t),this.size=this.g.size,t}clear(){this.g.clear(),this.size=this.g.size}has(t){return this.g.has(t)}entries(){return this.g.entries()}keys(){return this.g.keys()}values(){return this.g.values()}forEach(t,n){return this.g.forEach(t,n)}[Symbol.iterator](){return this.entries()}}const $3=K3?(Object.setPrototypeOf(rl.prototype,Map.prototype),Object.defineProperties(rl.prototype,{size:{value:0,configurable:!0,enumerable:!0,writable:!0}}),rl):class extends Map{constructor(){super()}};function _d(e){return e}function sl(e){if(2&e.N)throw Error("Cannot mutate an immutable Map")}var Vn=class extends $3{constructor(e,t,n=_d,i=_d){super();let r=Ie(e);r|=64,Le(e,r),this.N=r,this.U=t,this.S=n,this.Z=this.U?Z3:i;for(let s=0;s<e.length;s++){const o=e[s],a=n(o[0],!1,!0);let c=o[1];t?c===void 0&&(c=null):c=i(o[1],!1,!0,void 0,void 0,r),super.set(a,c)}}oa(e=vd){if(this.size!==0)return this.Y(e)}Y(e=vd){const t=[],n=super.entries();for(var i;!(i=n.next()).done;)(i=i.value)[0]=e(i[0]),i[1]=e(i[1]),t.push(i);return t}clear(){sl(this),super.clear()}delete(e){return sl(this),super.delete(this.S(e,!0,!1))}entries(){var e=this.na();return new Fa(e,J3,this)}keys(){return this.Ia()}values(){var e=this.na();return new Fa(e,Vn.prototype.get,this)}forEach(e,t){super.forEach((n,i)=>{e.call(t,this.get(i),i,this)})}set(e,t){return sl(this),(e=this.S(e,!0,!1))==null?this:t==null?(super.delete(e),this):super.set(e,this.Z(t,!0,!0,this.U,!1,this.N))}Oa(e){const t=this.S(e[0],!1,!0);e=e[1],e=this.U?e===void 0?null:e:this.Z(e,!1,!0,void 0,!1,this.N),super.set(t,e)}has(e){return super.has(this.S(e,!1,!1))}get(e){e=this.S(e,!1,!1);const t=super.get(e);if(t!==void 0){var n=this.U;return n?((n=this.Z(t,!1,!0,n,this.ta,this.N))!==t&&super.set(e,n),n):t}}na(){return Array.from(super.keys())}Ia(){return super.keys()}[Symbol.iterator](){return this.entries()}};function Z3(e,t,n,i,r,s){return e=cu(e,i,n,s),r&&(e=nc(e)),e}function vd(e){return e}function J3(e){return[e,this.get(e)]}let Q3;function xd(){return Q3||(Q3=new Vn(Fs([]),void 0,void 0,void 0,j3))}function hu(e,t,n,i,r){if(e!=null){if(Array.isArray(e))e=Na(e,void 0,0)?void 0:r&&2&Ie(e)?e:ec(e,t,n,i!==void 0,r);else if(ru(e)){const s={};for(let o in e)s[o]=hu(e[o],t,n,i,r);e=s}else e=t(e,i);return e}}function ec(e,t,n,i,r){const s=i||n?Ie(e):0;i=i?!!(32&s):void 0;const o=wn(e);for(let a=0;a<o.length;a++)o[a]=hu(o[a],t,n,i,r);return n&&(cm(o,e),n(s,o)),o}function tM(e){return hu(e,uu,void 0,void 0,!1)}function uu(e){return e.X===Po?e.toJSON():e instanceof Vn?e.oa(tM):function(t){switch(typeof t){case"number":return isFinite(t)?t:String(t);case"boolean":return t?1:0;case"object":if(t)if(Array.isArray(t)){if(Na(t,void 0,0))return}else{if(wo(t))return sd(t);if(t instanceof Fi){const n=t.g;return n==null?"":typeof n=="string"?n:t.g=sd(n)}if(t instanceof Vn)return t.oa()}}return t}(e)}function ph(e,t,n=fh){if(e!=null){if(jp&&e instanceof Uint8Array)return t?e:new Uint8Array(e);if(Array.isArray(e)){var i=Ie(e);return 2&i||(t&&(t=i===0||!!(32&i)&&!(64&i||!(16&i))),e=t?Le(e,-12293&(34|i)):ec(e,ph,4&i?fh:n,!0,!0)),e}return e.X===Po?(n=e.s,e=2&(i=re(n))?e:fu(e,n,i,!0)):e instanceof Vn&&!(2&e.N)&&(n=Fs(e.Y(ph)),e=new Vn(n,e.U,e.S,e.Z)),e}}function fu(e,t,n,i){return e=e.constructor,Ba=t=dm(t,n,i),t=new e(t),Ba=void 0,t}function dm(e,t,n){const i=n||2&t?fh:z3,r=!!(32&t);return e=function(s,o,a){const c=wn(s);var l=c.length;const h=256&o?c[l-1]:void 0;for(l+=h?-1:0,o=512&o?1:0;o<l;o++)c[o]=a(c[o]);if(h){o=c[o]={};for(const u in h)o[u]=a(h[u])}return cm(c,s),c}(e,t,s=>ph(s,r,i)),nu(e,32|(n?2:0)),e}function nc(e){const t=e.s,n=re(t);return 2&n?fu(e,t,n,!1):e}function pm(e,t,n,i){return!(4&t)||n!=null}function hr(e,t){return Mi(e=e.s,re(e),t)}function Md(e,t,n,i){if(!(0>(t=i+(+!!(512&t)-1))||t>=e.length||t>=n))return e[t]}function Mi(e,t,n,i){if(n===-1)return null;const r=om(t);if(!(n>=r)){var s=e.length;return i&&256&t&&(i=e[s-1][n])!=null?(Md(e,t,r,n)&&il!=null&&(4<=(t=(e=G3??(G3={}))[il]||0)||(e[il]=t+1,H3())),i):Md(e,t,r,n)}return 256&t?e[e.length-1][n]:void 0}function de(e,t,n,i){const r=e.s;let s=re(r);return xi(s),Me(r,s,t,n,i),e}function Me(e,t,n,i,r){const s=om(t);if(n>=s||r){let o=t;if(256&t)r=e[e.length-1];else{if(i==null)return o;r=e[s+(+!!(512&t)-1)]={},o|=256}return r[n]=i,n<s&&(e[n+(+!!(512&t)-1)]=void 0),o!==t&&Le(e,o),o}return e[n+(+!!(512&t)-1)]=i,256&t&&n in(e=e[e.length-1])&&delete e[n],t}function ks(e,t,n,i,r){var s=2&t;let o=Mi(e,t,n,r);Array.isArray(o)||(o=iu);const a=!(2&i);i=!(1&i);const c=!!(32&t);let l=Ie(o);return l!==0||!c||s||a?1&l||(l|=1,Le(o,l)):(l|=33,Le(o,l)),s?(e=!1,2&l||(Fs(o),e=!!(4&l)),(i||e)&&Object.freeze(o)):(s=!!(2&l)||!!(2048&l),i&&s?(o=wn(o),i=1,c&&!a&&(i|=32),Le(o,i),Me(e,t,n,o,r)):a&&32&l&&!s&&Ua(o,32)),o}function Sa(e,t){e=e.s;let n=re(e);const i=Mi(e,n,t),r=dr(i);return r!=null&&r!==i&&Me(e,n,t,r),r}function mm(e){e=e.s;let t=re(e);const n=Mi(e,t,1),i=su(n,!0,!!(34&t));return i!=null&&i!==n&&Me(e,t,1,i),i}function ls(e,t,n){const i=e.s;let r=re(i);const s=2&r?1:2;let o=gm(i,r,t);var a=Ie(o);if(pm(e,a,void 0)){(4&a||Object.isFrozen(o))&&(o=wn(o),a=Vr(a,r),r=Me(i,r,t,o));let c=e=0;for(;e<o.length;e++){const l=n(o[e]);l!=null&&(o[c++]=l)}c<e&&(o.length=c),a=en(a=_m(a,r),20,!0),a=en(a,4096,!1),a=en(a,8192,!1),Le(o,a),2&a&&Object.freeze(o)}return ao(a)||(n=a,(a=(e=s===1||s===4&&!!(32&a))?en(a,2,!0):Es(a,r,!1))!==n&&Le(o,a),e&&Object.freeze(o)),s===2&&ao(a)&&(o=wn(o),a=Es(a=Vr(a,r),r,!1),Le(o,a),Me(i,r,t,o)),o}function gm(e,t,n){return e=Mi(e,t,n),Array.isArray(e)?e:iu}function _m(e,t){return e===0&&(e=Vr(e,t)),en(e,1,!0)}function ao(e){return!!(2&e)&&!!(4&e)||!!(2048&e)}function vm(e){e=wn(e);for(let t=0;t<e.length;t++){const n=e[t]=wn(e[t]);Array.isArray(n[1])&&(n[1]=Fs(n[1]))}return e}function za(e,t,n){{const a=e.s;let c=re(a);if(xi(c),n==null)Me(a,c,t);else{var i,r=Ie(n),s=r,o=!!(2&r)||Object.isFrozen(n);if((i=!o)&&(i=!1),pm(e,r))for(r=21,o&&(n=wn(n),s=0,r=Es(r=Vr(r,c),c,!0)),e=0;e<n.length;e++)n[e]=Lo(n[e]);i&&(n=wn(n),s=0,r=Es(r=Vr(r,c),c,!0)),r!==s&&Le(n,r),Me(a,c,t,n)}}}function mh(e,t,n,i){e=e.s;let r=re(e);xi(r),Me(e,r,t,(i==="0"?Number(n)===0:n===i)?void 0:n)}function Do(e,t,n,i){const r=re(e);xi(r),e=ks(e,r,t,2),i=n(i,!!(4&(t=Ie(e)))&&!!(4096&t)),e.push(i)}function eM(e){return e}function ol(e,t){return du(e=e.s,re(e),n0)===t?t:-1}function du(e,t,n){let i=0;for(let r=0;r<n.length;r++){const s=n[r];Mi(e,t,s)!=null&&(i!==0&&(t=Me(e,t,i)),i=s)}return i}function pu(e,t,n,i){let r=re(e);xi(r);const s=Mi(e,r,n,i);let o;if(s!=null&&s.X===Po)return(t=nc(s))!==s&&Me(e,r,n,t,i),t.s;if(Array.isArray(s)){const a=Ie(s);o=2&a?dm(s,a,!1):s,o=Fr(o,t)}else o=Fr(void 0,t);return o!==s&&Me(e,r,n,o,i),o}function xm(e,t,n,i){e=e.s;let r=re(e);const s=Mi(e,r,n,i);return(t=cu(s,t,!1,r))!==s&&t!=null&&Me(e,r,n,t,i),t}function Zt(e,t,n,i=!1){if((t=xm(e,t,n,i))==null)return t;e=e.s;let r=re(e);if(!(2&r)){const s=nc(t);s!==t&&Me(e,r,n,t=s,i)}return t}function Mm(e,t,n,i,r,s){var o=2,a=!!(2&t);o=a?1:o,r=!!r,s&&(s=!a),a=gm(e,t,i);var c=Ie(a);const l=!!(4&c);if(!l){var h=a,u=t;const f=!!(2&(c=_m(c,t)));f&&(u=en(u,2,!0));let p=!f,g=!0,v=0,m=0;for(;v<h.length;v++){const d=cu(h[v],n,!1,u);if(d instanceof n){if(!f){const A=!!(2&Ie(d.s));p&&(p=!A),g&&(g=A)}h[m++]=d}}m<v&&(h.length=m),c=en(c,4,!0),c=en(c,16,g),c=en(c,8,p),Le(h,c),f&&Object.freeze(h)}if(s&&!(8&c||!a.length&&(o===1||o===4&&32&c))){for(ao(c)&&(a=wn(a),c=Vr(c,t),t=Me(e,t,i,a)),n=a,s=c,h=0;h<n.length;h++)(c=n[h])!==(u=nc(c))&&(n[h]=u);s=en(s,8,!0),s=en(s,16,!n.length),Le(n,s),c=s}return ao(c)||(n=c,(c=(s=o===1||o===4&&!!(32&c))?en(c,!a.length||16&c&&(!l||32&c)?2:2048,!0):Es(c,t,r))!==n&&Le(a,c),s&&Object.freeze(a)),o===2&&ao(c)&&(a=wn(a),c=Es(c=Vr(c,t),t,r),Le(a,c),Me(e,t,i,a)),a}function Gi(e,t,n){e=e.s;const i=re(e);return Mm(e,i,t,n,!1,!(2&i))}function bt(e,t,n,i,r){return i==null&&(i=void 0),de(e,n,i,r)}function co(e,t,n,i){i==null&&(i=void 0),e=e.s;let r=re(e);xi(r),(n=du(e,r,n))&&n!==t&&i!=null&&(r=Me(e,r,n)),Me(e,r,t,i)}function Vr(e,t){return e=en(e,2,!!(2&t)),e=en(e,32,!0),en(e,2048,!1)}function Es(e,t,n){return 32&t&&n||(e=en(e,32,!1)),e}function Va(e,t,n,i){e=e.s;const r=re(e);xi(r),t=Mm(e,r,n,t,!0),n=i??new n,t.push(n),2&Ie(n.s)?Ua(t,8):Ua(t,16)}function zn(e,t){return Os(hr(e,t))}function ti(e,t){return e??t}function Fe(e,t){return ti(Sa(e,t),0)}function gi(e,t){return ti(Nr(hr(e,t)),"")}function vo(e,t,n){if(n!=null&&typeof n!="boolean")throw e=typeof n,Error(`Expected boolean but got ${e!="object"?e:n?Array.isArray(n)?"array":e:"null"}: ${n}`);de(e,t,n)}function _i(e,t,n){if(n!=null){if(typeof n!="number"||!Number.isFinite(n))throw dh("int32");n|=0}de(e,t,n)}function _t(e,t,n){if(n!=null&&typeof n!="number")throw Error(`Value of float/double field must be a number, found ${typeof n}: ${n}`);de(e,t,n)}function ei(e,t,n){t.g?t.m(e,t.g,t.h,n,!0):t.m(e,t.h,n,!0)}Vn.prototype.toJSON=void 0,Vn.prototype.Ja=am;var gt=class{constructor(e,t){this.s=fm(e,t)}toJSON(){return ym(this,ec(this.s,uu,void 0,void 0,!1),!0)}l(){var e=ay;return e.g?e.l(this,e.g,e.h,!0):e.l(this,e.h,e.defaultValue,!0)}clone(){const e=this.s;return fu(this,e,re(e),!1)}P(){return!!(2&Ie(this.s))}};function ym(e,t,n){var i=C3?void 0:e.constructor.B;const r=re(n?e.s:t);if(!(e=t.length))return t;let s,o;if(ru(n=t[e-1])){t:{var a=n;let h={},u=!1;for(var c in a){let f=a[c];if(Array.isArray(f)){let p=f;(Na(f,i,+c)||pd(f)&&f.size===0)&&(f=null),f!=p&&(u=!0)}f!=null?h[c]=f:u=!0}if(u){for(var l in h){a=h;break t}a=null}}a!=n&&(s=!0),e--}for(c=+!!(512&r)-1;0<e&&(n=t[l=e-1],l-=c,n==null||Na(n,i,l)||pd(n)&&n.size===0);e--)o=!0;return(s||o)&&(t=Array.prototype.slice.call(t,0,e),a&&t.push(a)),t}function Sm(e){return Array.isArray(e)?e[0]instanceof Ns?e:[fM,e]:[e,void 0]}function zs(e,t){if(Array.isArray(t)){var n=Ie(t);if(4&n)return t;for(var i=0,r=0;i<t.length;i++){const s=e(t[i]);s!=null&&(t[r++]=s)}return r<i&&(t.length=r),Le(t,-12289&(5|n)),2&n&&Object.freeze(t),t}}gt.prototype.X=Po,gt.prototype.toString=function(){return ym(this,this.s,!1).toString()};const yd=Symbol();function mu(e){let t=e[yd];if(!t){const n=Tm(e),i=_u(e),r=i.l;t=r?(s,o)=>r(s,o,i):(s,o)=>{for(;rm(o)&&o.h!=4;){var a=o.m,c=i[a];if(!c){var l=i.ea;l&&(l=l[a])&&(c=i[a]=nM(l))}c&&c(o,s,a)||(a=(c=o).l,ya(c),c.ia?c=void 0:(l=c.g.g-a,c.g.g=a,c=im(c.g,l)),a=s,c&&(or||(or=Symbol()),(l=a[or])?l.push(c):a[or]=[c]))}n===Em||n===Ea||n.j||(s[V3||(V3=Symbol())]=n)},e[yd]=t}return t}function nM(e){const t=(e=Sm(e))[0].g;if(e=e[1]){const n=mu(e),i=_u(e).T;return(r,s,o)=>t(r,s,o,i,n)}return t}class al{}let Em,Ea;const lo=Symbol();function iM(e,t,n){const i=n[1];let r;if(i){const s=i[lo];r=s?s.T:ka(i[0]),e[t]=s??i}r&&r===lu?(e.g||(e.g=new Set)).add(t):n[0]&&(e.h||(e.h=new Set)).add(t)}function Sd(e,t){return[e.l,!t||0<t[0]?void 0:t]}function Tm(e){var t=e[lo];if(t)return t;if(!(t=gu(e,e[lo]=new al,Sd,Sd,iM)).ea&&!t.h&&!t.g){let n=!0;for(let i in t)isNaN(i)||(n=!1);n?(ka(e[0])===lu?Ea?t=Ea:((t=new al).T=ka(!0),t=Ea=t):t=Em||(Em=new al),t=e[lo]=t):t.j=!0}return t}function rM(e,t,n){e[t]=n}function gu(e,t,n,i,r=rM){t.T=ka(e[0]);let s=0;var o=e[++s];o&&o.constructor===Object&&(t.ea=o,typeof(o=e[++s])=="function"&&(t.l=o,t.m=e[++s],o=e[++s]));const a={};for(;Array.isArray(o)&&typeof o[0]=="number"&&0<o[0];){for(var c=0;c<o.length;c++)a[o[c]]=o;o=e[++s]}for(c=1;o!==void 0;){let u;typeof o=="number"&&(c+=o,o=e[++s]);var l=void 0;if(o instanceof Ns?u=o:(u=dM,s--),u.pa){o=e[++s],l=e;var h=s;typeof o=="function"&&(o=o(),l[h]=o),l=o}for(h=c+1,typeof(o=e[++s])=="number"&&0>o&&(h-=o,o=e[++s]);c<h;c++){const f=a[c];r(t,c,l?i(u,l,f):n(u,f))}}return t}const Ed=Symbol();function Am(e){let t=e[Ed];if(!t){const n=ic(e);t=(i,r)=>wm(i,r,n),e[Ed]=t}return t}const gh=Symbol();function sM(e){return e.h}function oM(e,t){let n,i;const r=e.h;return(s,o,a)=>r(s,o,a,i||(i=ic(t).T),n||(n=Am(t)))}function ic(e){let t=e[gh];return t||(t=gu(e,e[gh]={},sM,oM),bm(e),t)}const _h=Symbol();function aM(e,t){const n=e.g;return t?(i,r,s)=>n(i,r,s,t):n}function cM(e,t,n){const i=e.g;let r,s;return(o,a,c)=>i(o,a,c,s||(s=_u(t).T),r||(r=mu(t)),n)}function _u(e){let t=e[_h];return t||(Tm(e),t=gu(e,e[_h]={},aM,cM),bm(e),t)}function bm(e){_h in e&&lo in e&&gh in e&&(e.length=0)}function Td(e,t){var n=e[t];if(n)return n;if((n=e.ea)&&(n=n[t])){var i=(n=Sm(n))[0].h;if(n=n[1]){const r=Am(n),s=ic(n).T;n=(n=e.m)?n(s,r):(o,a,c)=>i(o,a,c,s,r)}else n=i;return e[t]=n}}function wm(e,t,n){for(var i=re(e),r=+!!(512&i)-1,s=e.length,o=512&i?1:0,a=s+(256&i?-1:0);o<a;o++){const c=e[o];if(c==null)continue;const l=o-r,h=Td(n,l);h&&h(t,c,l)}if(256&i){i=e[s-1];for(let c in i)r=+c,Number.isNaN(r)||(s=i[c])!=null&&(a=Td(n,r))&&a(t,s,r)}if(e=or?e[or]:void 0)for(Ss(t,t.g.end()),n=0;n<e.length;n++)Ss(t,Hh(e[n])||Ka())}function vn(e,t){return new Ns(e,t,!1,!1)}function Vs(e,t){return new Ns(e,t,!0,!1)}function rc(e,t){return new Ns(e,t,!1,!0)}function xn(e,t,n){Me(e,re(e),t,n)}var lM=rc(function(e,t,n,i,r){return e.h===2&&(e=Ro(e,Fr([void 0,void 0],i),r),xi(i=re(t)),(r=Mi(t,i,n))instanceof Vn?2&r.N?((r=r.Y()).push(e),Me(t,i,n,r)):r.Oa(e):Array.isArray(r)?(2&Ie(r)&&Me(t,i,n,r=vm(r)),r.push(e)):Me(t,i,n,[e]),!0)},function(e,t,n,i,r){if(t instanceof Vn)t.forEach((s,o)=>{uh(e,n,Fr([o,s],i),r)});else if(Array.isArray(t))for(let s=0;s<t.length;s++){const o=t[s];Array.isArray(o)&&uh(e,n,Fr(o,i),r)}});function Rm(e,t,n){t:if(t!=null){if(tc(t)){if(typeof t=="string"){t=au(t);break t}if(typeof t=="number"){t=ou(t);break t}}t=void 0}t!=null&&(typeof t=="string"&&ud(t),t!=null&&(Gn(e,n,0),typeof t=="number"?(e=e.g,Ir(t),Ia(e,xe,Ve)):(n=ud(t),Ia(e.g,n.h,n.g))))}function Cm(e,t,n){(t=Os(t))!=null&&t!=null&&(Gn(e,n,0),Ja(e.g,t))}function Pm(e,t,n){(t=hm(t))!=null&&(Gn(e,n,0),e.g.g.push(t?1:0))}function Lm(e,t,n){(t=Nr(t))!=null&&Qa(e,n,Wp(t))}function sc(e,t,n,i,r){uh(e,n,t instanceof gt?t.s:Array.isArray(t)?Fr(t,i):void 0,r)}function Dm(e,t,n){(t=t==null||typeof t=="string"||wo(t)||t instanceof Fi?t:void 0)!=null&&Qa(e,n,Xh(t).buffer)}function Im(e,t,n){return(e.h===5||e.h===2)&&(t=ks(t,re(t),n,2,!1),e.h==2?Za(e,hh,t):t.push(hh(e.g)),!0)}var Ge,Oi=vn(function(e,t,n){if(e.h!==1)return!1;var i=e.g;e=lh(i);const r=lh(i);i=2*(r>>31)+1;const s=r>>>20&2047;return e=4294967296*(1048575&r)+e,xn(t,n,s==2047?e?NaN:1/0*i:s==0?i*Math.pow(2,-1074)*e:i*Math.pow(2,s-1075)*(e+4503599627370496)),!0},function(e,t,n){(t=dr(t))!=null&&(Gn(e,n,1),e=e.g,(n=tm||(tm=new DataView(new ArrayBuffer(8)))).setFloat64(0,+t,!0),xe=n.getUint32(0,!0),Ve=n.getUint32(4,!0),_o(e,xe),_o(e,Ve))}),Ye=vn(function(e,t,n){return e.h===5&&(xn(t,n,hh(e.g)),!0)},function(e,t,n){(t=dr(t))!=null&&(Gn(e,n,5),e=e.g,Yh(t),_o(e,xe))}),hM=Vs(Im,function(e,t,n){if((t=zs(dr,t))!=null)for(let o=0;o<t.length;o++){var i=e,r=n,s=t[o];s!=null&&(Gn(i,r,5),i=i.g,Yh(s),_o(i,xe))}}),vu=Vs(Im,function(e,t,n){if((t=zs(dr,t))!=null&&t.length){Gn(e,n,2),Co(e.g,4*t.length);for(let i=0;i<t.length;i++)n=e.g,Yh(t[i]),_o(n,xe)}}),ur=vn(function(e,t,n){return e.h===0&&(xn(t,n,$h(e.g,jh)),!0)},Rm),cl=vn(function(e,t,n){return e.h===0&&(xn(t,n,(e=$h(e.g,jh))===0?void 0:e),!0)},Rm),uM=vn(function(e,t,n){return e.h===0&&(xn(t,n,$h(e.g,ch)),!0)},function(e,t,n){t:if(t!=null){if(tc(t)){if(typeof t=="string"){var i=Math.trunc(Number(t));Number.isSafeInteger(i)&&0<=i?t=String(i):((i=t.indexOf("."))!==-1&&(t=t.substring(0,i)),gd(t)||($a(t),t=Da(xe,Ve)));break t}if(typeof t=="number"){t=0<=(t=Math.trunc(t))&&Number.isSafeInteger(t)?t:function(r){if(0>r){Ir(r);const s=Da(xe,Ve);return r=Number(s),Number.isSafeInteger(r)?r:s}return gd(String(r))?r:(Ir(r),ch(xe,Ve))}(t);break t}}t=void 0}t!=null&&(typeof t=="string"&&ld(t),t!=null&&(Gn(e,n,0),typeof t=="number"?(e=e.g,Ir(t),Ia(e,xe,Ve)):(n=ld(t),Ia(e.g,n.h,n.g))))}),Ue=vn(function(e,t,n){return e.h===0&&(xn(t,n,cr(e.g)),!0)},Cm),oc=Vs(function(e,t,n){return(e.h===0||e.h===2)&&(t=ks(t,re(t),n,2,!1),e.h==2?Za(e,cr,t):t.push(cr(e.g)),!0)},function(e,t,n){if((t=zs(Os,t))!=null&&t.length){n=Qh(e,n);for(let i=0;i<t.length;i++)Ja(e.g,t[i]);tu(e,n)}}),Ts=vn(function(e,t,n){return e.h===0&&(xn(t,n,(e=cr(e.g))===0?void 0:e),!0)},Cm),Be=vn(function(e,t,n){return e.h===0&&(xn(t,n,Zh(e.g)),!0)},Pm),ho=vn(function(e,t,n){return e.h===0&&(xn(t,n,(e=Zh(e.g))===!1?void 0:e),!0)},Pm),sn=Vs(function(e,t,n){return e.h===2&&(Do(t,n,eM,e=Jh(e)),!0)},function(e,t,n){if((t=zs(Nr,t))!=null)for(let o=0;o<t.length;o++){var i=e,r=n,s=t[o];s!=null&&Qa(i,r,Wp(s))}}),fr=vn(function(e,t,n){return e.h===2&&(xn(t,n,(e=Jh(e))===""?void 0:e),!0)},Lm),ce=vn(function(e,t,n){return e.h===2&&(xn(t,n,Jh(e)),!0)},Lm),fM=rc(function(e,t,n,i,r){return e.h===2&&(Ro(e,pu(t,i,n,!0),r),!0)},sc),dM=rc(function(e,t,n,i,r){return e.h===2&&(Ro(e,pu(t,i,n),r),!0)},sc);Ge=new Ns(function(e,t,n,i,r){if(e.h!==2)return!1;i=Fr(void 0,i);let s=re(t);xi(s);let o=ks(t,s,n,3);return s=re(t),4&Ie(o)&&(o=wn(o),Le(o,-2079&(1|Ie(o))),Me(t,s,n,o)),o.push(i),Ro(e,i,r),!0},function(e,t,n,i,r){if(Array.isArray(t))for(let s=0;s<t.length;s++)sc(e,t[s],n,i,r)},!0,!0);var he=rc(function(e,t,n,i,r,s){if(e.h!==2)return!1;let o=re(t);return xi(o),(s=du(t,o,s))&&n!==s&&Me(t,o,s),Ro(e,t=pu(t,i,n),r),!0},sc),Um=vn(function(e,t,n){return e.h===2&&(xn(t,n,sm(e)),!0)},Dm),pM=Vs(function(e,t,n){return(e.h===0||e.h===2)&&(t=ks(t,re(t),n,2,!1),e.h==2?Za(e,lr,t):t.push(lr(e.g)),!0)},function(e,t,n){if((t=zs(X3,t))!=null)for(let o=0;o<t.length;o++){var i=e,r=n,s=t[o];s!=null&&(Gn(i,r,0),Co(i.g,s))}}),vi=vn(function(e,t,n){return e.h===0&&(xn(t,n,cr(e.g)),!0)},function(e,t,n){(t=Os(t))!=null&&(t=parseInt(t,10),Gn(e,n,0),Ja(e.g,t))}),mM=Vs(function(e,t,n){return(e.h===0||e.h===2)&&(t=ks(t,re(t),n,2,!1),e.h==2?Za(e,O3,t):t.push(cr(e.g)),!0)},function(e,t,n){if((t=zs(Os,t))!=null&&t.length){n=Qh(e,n);for(let i=0;i<t.length;i++)Ja(e.g,t[i]);tu(e,n)}});class gM{constructor(t,n){this.h=t,this.g=n,this.l=Zt,this.m=bt,this.defaultValue=void 0}}function ni(e,t){return new gM(e,t)}function pr(e,t){return(n,i)=>{if(la.length){const s=la.pop();s.o(i),nl(s.g,n,i),n=s}else n=new class{constructor(s,o){if(cd.length){const a=cd.pop();nl(a,s,o),s=a}else s=new class{constructor(a,c){this.h=null,this.m=!1,this.g=this.l=this.j=0,nl(this,a,c)}clear(){this.h=null,this.m=!1,this.g=this.l=this.j=0,this.ca=!1}}(s,o);this.g=s,this.l=this.g.g,this.h=this.m=-1,this.o(o)}o({ia:s=!1}={}){this.ia=s}}(n,i);try{const s=new e,o=s.s;mu(t)(o,n);var r=s}finally{n.g.clear(),n.m=-1,n.h=-1,100>la.length&&la.push(n)}return r}}function ac(e){return function(){const t=new class{constructor(){this.l=[],this.h=0,this.g=new class{constructor(){this.g=[]}length(){return this.g.length}end(){const o=this.g;return this.g=[],o}}}};wm(this.s,t,ic(e)),Ss(t,t.g.end());const n=new Uint8Array(t.h),i=t.l,r=i.length;let s=0;for(let o=0;o<r;o++){const a=i[o];n.set(a,s),s+=a.length}return t.l=[n],n}}var Ad=class extends gt{constructor(e){super(e)}},Nm=[0,fr,vn(function(e,t,n){return e.h===2&&(xn(t,n,(e=sm(e))===zr()?void 0:e),!0)},function(e,t,n){if(t!=null){if(t instanceof gt){const i=t.Qa;return void(i&&(t=i(t),t!=null&&Qa(e,n,Xh(t).buffer)))}if(Array.isArray(t))return}Dm(e,t,n)})],_M=[0,ce],Fm=[0,Ue,vi,Be,-1,oc,vi,-1],vM=[0,Be,-1],Om=class extends gt{constructor(){super()}};Om.B=[6];var Bm=[0,Be,ce,Be,vi,-1,mM,ce,-1,vM,vi],km=[0,ce,-2],bd=class extends gt{constructor(){super()}},zm=[0],Vm=[0,Ue,Be,-4],Rn=class extends gt{constructor(e){super(e,2)}},Ee={},xM=[-2,Ee,Be];Ee[336783863]=[0,ce,Be,-1,Ue,[0,[1,2,3,4,5,6],he,zm,he,Bm,he,km,he,Vm,he,Fm,he,[0,ce]],_M,Be,[0,[1,3],[2,4],he,[0,oc],-1,he,[0,sn],-1,Ge,[0,ce,-1]],ce];var MM=[0,fr,ho],Gm=[0,cl,-1,ho,-3,cl,oc,fr,Ts,cl,-1,ho,Ts,ho,-2,fr],Io=[-1,{}],Hm=[0,ce,1,Io],Wm=[0,ce,sn,Io];function Cn(e,t){mh(e,2,Bs(t),"")}function pe(e,t){Do(e.s,3,Lo,t)}function Wt(e,t){Do(e.s,4,Lo,t)}var on=class extends gt{constructor(e){super(e,500)}o(e){return bt(this,0,7,e)}};on.B=[3,4,5,6,8,13,17,1005];var yM=[-500,fr,-1,sn,-3,xM,Ge,Nm,Ts,-1,Hm,Wm,Ge,MM,fr,Gm,Ts,sn,987,sn],SM=[0,fr,-1,Io],EM=[-500,ce,-1,[-1,{}],998,ce],TM=[-500,ce,sn,-1,[-2,{},Be],997,sn,-1],AM=[-500,ce,sn,Io,998,sn];function Pn(e,t){Va(e,1,on,t)}function ye(e,t){Do(e.s,10,Lo,t)}function te(e,t){Do(e.s,15,Lo,t)}var ln=class extends gt{constructor(e){super(e,500)}o(e){return bt(this,0,1001,e)}};ln.B=[1,6,7,9,10,15,16,17,14,1002];var Xm=[-500,Ge,yM,4,Ge,EM,Ge,TM,Ts,Ge,AM,sn,Ts,Hm,Wm,Ge,SM,sn,-2,Gm,fr,-1,ho,979,Io,Ge,Nm],bM=pr(ln,Xm);ln.prototype.g=ac(Xm);var wM=[0,Ge,[0,Ue,-2]],RM=class extends gt{constructor(e){super(e)}},CM=[0,Ue,Ye,ce,-1],xu=class extends gt{constructor(e){super(e)}g(){return Gi(this,RM,1)}};xu.B=[1];var qm=[0,Ge,CM],cc=pr(xu,qm),PM=[0,Ue,Ye],LM=[0,Ue,-1,wM],DM=class extends gt{constructor(e){super(e)}},IM=[0,Ue,-3],UM=[0,Ye,-3],NM=class extends gt{constructor(e){super(e)}},FM=[0,Ye,-1,ce,Ye],Ta=class extends gt{constructor(e){super(e)}h(){return Zt(this,DM,2)}g(){return Gi(this,NM,5)}};Ta.B=[5];var OM=[0,vi,IM,UM,LM,Ge,FM],Ym=class extends gt{constructor(e){super(e)}};Ym.B=[1,2,3,8,9];var jm=pr(Ym,[0,sn,oc,vu,OM,ce,-1,ur,Ge,PM,sn,ur]),Km=class extends gt{constructor(e){super(e)}},BM=[0,Ye,-4],$m=class extends gt{constructor(e){super(e)}};$m.B=[1];var ps=pr($m,[0,Ge,BM]),Zm=class extends gt{constructor(e){super(e)}},kM=[0,Ye,-4],Jm=class extends gt{constructor(e){super(e)}};Jm.B=[1];var Uo=pr(Jm,[0,Ge,kM]),Qm=class extends gt{constructor(e){super(e)}};Qm.B=[3];var zM=[0,Ue,-1,vu,vi],t0=class extends gt{constructor(){super()}};t0.prototype.g=ac([0,Ye,-4,ur]);var VM=class extends gt{constructor(e){super(e)}},GM=[0,1,Ue,ce,qm],e0=class extends gt{constructor(e){super(e)}};e0.B=[1];var HM=pr(e0,[0,Ge,GM,ur]),vh=class extends gt{constructor(e){super(e)}};vh.B=[1];var WM=class extends gt{constructor(e){super(e)}qa(){const e=mm(this);return e??zr()}},XM=class extends gt{constructor(e){super(e)}},n0=[1,2],qM=[0,n0,he,[0,vu],he,[0,Um],Ue,ce],i0=class extends gt{constructor(e){super(e)}};i0.B=[1];var YM=pr(i0,[0,Ge,qM,ur]),lc=class extends gt{constructor(e){super(e)}};lc.B=[4,5];var r0=[0,ce,Ue,Ye,sn,-1],wd=class extends gt{constructor(e){super(e)}},jM=[0,Be,-1],Rd=class extends gt{constructor(e){super(e)}},Aa=[1,2,3,4,5],Ga=class extends gt{constructor(e){super(e)}g(){return mm(this)!=null}h(){return Nr(hr(this,2))!=null}},s0=[0,Um,ce,[0,Ue,ur,-1],[0,uM,ur]],Te=class extends gt{constructor(e){super(e)}g(){return hm(hr(this,2))??!1}},ke=[0,s0,Be,[0,Aa,he,Vm,he,Bm,he,Fm,he,zm,he,km],vi],hc=class extends gt{constructor(e){super(e)}},Mu=[0,ke,Ye,-1,Ue],KM=ni(502141897,hc);Ee[502141897]=Mu;var o0=[0,s0];Ee[512499200]=o0;var a0=[0,o0];Ee[515723506]=a0;var $M=pr(class extends gt{constructor(e){super(e)}},[0,[0,vi,-1,hM,pM],zM]),c0=[0,ke];Ee[508981768]=c0;var l0=class extends gt{constructor(e){super(e)}},yu=[0,ke,Ye,c0,Be],h0=class extends gt{constructor(e){super(e)}},u0=[0,ke,Mu,yu,Ye,a0];Ee[508968149]=yu;var ZM=ni(508968150,h0);Ee[508968150]=u0;var f0=class extends gt{constructor(e){super(e)}},JM=ni(513916220,f0);Ee[513916220]=[0,ke,u0,Ue];var os=class extends gt{constructor(e){super(e)}h(){return Zt(this,lc,2)}g(){de(this,2)}},d0=[0,ke,r0];Ee[478825465]=d0;var p0=[0,ke];Ee[478825422]=p0;var QM=class extends gt{constructor(e){super(e)}},m0=[0,ke,p0,d0,-1],g0=class extends gt{constructor(e){super(e)}},_0=[0,ke,Ye,Ue],Su=class extends gt{constructor(e){super(e)}},Eu=[0,ke,Ye],Tu=class extends gt{constructor(e){super(e)}},v0=[0,ke,_0,Eu,Ye],x0=class extends gt{constructor(e){super(e)}},ty=[0,ke,v0,m0];Ee[463370452]=m0,Ee[464864288]=_0,Ee[474472470]=Eu;var ey=ni(462713202,Tu);Ee[462713202]=v0;var ny=ni(479097054,x0);Ee[479097054]=ty;var iy=class extends gt{constructor(e){super(e)}},ry=[0,ke],M0=class extends gt{constructor(e){super(e)}},Au=[0,ke,Ye,-1,Ue];Ee[514774813]=Au;var y0=class extends gt{constructor(e){super(e)}},bu=[0,ke,Ye,Be];Ee[518928384]=bu;var S0=class extends gt{constructor(){super()}};S0.prototype.g=ac([0,ke,Eu,ry,Mu,yu,Au,bu]);var E0=class extends gt{constructor(e){super(e)}},sy=ni(456383383,E0);Ee[456383383]=[0,ke,r0];var T0=class extends gt{constructor(e){super(e)}},oy=ni(476348187,T0);Ee[476348187]=[0,ke,jM];var A0=class extends gt{constructor(e){super(e)}},b0=[0,vi,-1],xh=class extends gt{constructor(e){super(e)}};xh.B=[3];var ay=ni(458105876,class extends gt{constructor(e){super(e)}g(){var e=this.s;const t=re(e);var n=2&t;return e=function(i,r,s){var o=xh;const a=2&r;let c=!1;if(s==null){if(a)return xd();s=[]}else if(s.constructor===Vn){if(!(2&s.N)||a)return s;s=s.Y()}else Array.isArray(s)?c=!!(2&Ie(s)):s=[];if(a){if(!s.length)return xd();c||(c=!0,Fs(s))}else c&&(c=!1,s=vm(s));return c||(64&Ie(s)?Ua(s,32):32&r&&nu(s,32)),Me(i,r,2,o=new Vn(s,o,q3,void 0),!1),o}(e,t,Mi(e,t,2)),e==null||!n&&xh&&(e.ta=!0),n=e}});Ee[458105876]=[0,b0,lM,[!0,ur,[0,ce,-1,sn]]];var wu=class extends gt{constructor(e){super(e)}},w0=ni(458105758,wu);Ee[458105758]=[0,ke,ce,b0];var Ru=class extends gt{constructor(e){super(e)}};Ru.B=[5,6];var cy=ni(443442058,Ru);Ee[443442058]=[0,ke,ce,Ue,Ye,sn,-1];var R0=class extends gt{constructor(e){super(e)}},ly=ni(516587230,R0);function Mh(e,t){return t=t?t.clone():new lc,e.displayNamesLocale!==void 0?de(t,1,Bs(e.displayNamesLocale)):e.displayNamesLocale===void 0&&de(t,1),e.maxResults!==void 0?_i(t,2,e.maxResults):"maxResults"in e&&de(t,2),e.scoreThreshold!==void 0?_t(t,3,e.scoreThreshold):"scoreThreshold"in e&&de(t,3),e.categoryAllowlist!==void 0?za(t,4,e.categoryAllowlist):"categoryAllowlist"in e&&de(t,4),e.categoryDenylist!==void 0?za(t,5,e.categoryDenylist):"categoryDenylist"in e&&de(t,5),t}function Cu(e,t=-1,n=""){return{categories:e.map(i=>({index:ti(zn(i,1),0)??-1,score:Fe(i,2)??0,categoryName:gi(i,3)??"",displayName:gi(i,4)??""})),headIndex:t,headName:n}}function C0(e){var o,a;var t=ls(e,3,dr),n=ls(e,2,Os),i=ls(e,1,Nr),r=ls(e,9,Nr);const s={categories:[],keypoints:[]};for(let c=0;c<t.length;c++)s.categories.push({score:t[c],index:n[c]??-1,categoryName:i[c]??"",displayName:r[c]??""});if((t=(o=Zt(e,Ta,4))==null?void 0:o.h())&&(s.boundingBox={originX:zn(t,1)??0,originY:zn(t,2)??0,width:zn(t,3)??0,height:zn(t,4)??0,angle:0}),(a=Zt(e,Ta,4))==null?void 0:a.g().length)for(const c of Zt(e,Ta,4).g())s.keypoints.push({x:Sa(c,1)??0,y:Sa(c,2)??0,score:Sa(c,4)??0,label:Nr(hr(c,3))??""});return s}function uc(e){const t=[];for(const n of Gi(e,Zm,1))t.push({x:Fe(n,1)??0,y:Fe(n,2)??0,z:Fe(n,3)??0,visibility:Fe(n,4)??0});return t}function uo(e){const t=[];for(const n of Gi(e,Km,1))t.push({x:Fe(n,1)??0,y:Fe(n,2)??0,z:Fe(n,3)??0,visibility:Fe(n,4)??0});return t}function Cd(e){return Array.from(e,t=>127<t?t-256:t)}function Pd(e,t){if(e.length!==t.length)throw Error(`Cannot compute cosine similarity between embeddings of different sizes (${e.length} vs. ${t.length}).`);let n=0,i=0,r=0;for(let s=0;s<e.length;s++)n+=e[s]*t[s],i+=e[s]*e[s],r+=t[s]*t[s];if(0>=i||0>=r)throw Error("Cannot compute cosine similarity on embedding with 0 norm.");return n/Math.sqrt(i*r)}let ha;Ee[516587230]=[0,ke,Au,bu,Ye];const hy=new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11]);async function P0(){if(ha===void 0)try{await WebAssembly.instantiate(hy),ha=!0}catch{ha=!1}return ha}async function $s(e,t=""){const n=await P0()?"wasm_internal":"wasm_nosimd_internal";return{wasmLoaderPath:`${t}/${e}_${n}.js`,wasmBinaryPath:`${t}/${e}_${n}.wasm`}}var br=class{};function L0(){var e=navigator;return typeof OffscreenCanvas<"u"&&(!function(t=navigator){return(t=t.userAgent).includes("Safari")&&!t.includes("Chrome")}(e)||!!((e=e.userAgent.match(/Version\/([\d]+).*Safari/))&&1<=e.length&&17<=Number(e[1])))}async function Ld(e){if(typeof importScripts!="function"){const t=document.createElement("script");return t.src=e.toString(),t.crossOrigin="anonymous",new Promise((n,i)=>{t.addEventListener("load",()=>{n()},!1),t.addEventListener("error",r=>{i(r)},!1),document.body.appendChild(t)})}importScripts(e.toString())}function D0(e){return e.videoWidth!==void 0?[e.videoWidth,e.videoHeight]:e.naturalWidth!==void 0?[e.naturalWidth,e.naturalHeight]:e.displayWidth!==void 0?[e.displayWidth,e.displayHeight]:[e.width,e.height]}function St(e,t,n){e.m||console.error("No wasm multistream support detected: ensure dependency inclusion of :gl_graph_runner_internal_multi_input target"),n(t=e.i.stringToNewUTF8(t)),e.i._free(t)}function Dd(e,t,n){if(!e.i.canvas)throw Error("No OpenGL canvas configured.");if(n?e.i._bindTextureToStream(n):e.i._bindTextureToCanvas(),!(n=e.i.canvas.getContext("webgl2")||e.i.canvas.getContext("webgl")))throw Error("Failed to obtain WebGL context from the provided canvas. `getContext()` should only be invoked with `webgl` or `webgl2`.");e.i.gpuOriginForWebTexturesIsBottomLeft&&n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!0),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,t),e.i.gpuOriginForWebTexturesIsBottomLeft&&n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1);const[i,r]=D0(t);return!e.l||i===e.i.canvas.width&&r===e.i.canvas.height||(e.i.canvas.width=i,e.i.canvas.height=r),[i,r]}function Id(e,t,n){e.m||console.error("No wasm multistream support detected: ensure dependency inclusion of :gl_graph_runner_internal_multi_input target");const i=new Uint32Array(t.length);for(let r=0;r<t.length;r++)i[r]=e.i.stringToNewUTF8(t[r]);t=e.i._malloc(4*i.length),e.i.HEAPU32.set(i,t>>2),n(t);for(const r of i)e.i._free(r);e.i._free(t)}function oi(e,t,n){e.i.simpleListeners=e.i.simpleListeners||{},e.i.simpleListeners[t]=n}function Qi(e,t,n){let i=[];e.i.simpleListeners=e.i.simpleListeners||{},e.i.simpleListeners[t]=(r,s,o)=>{s?(n(i,o),i=[]):i.push(r)}}br.forVisionTasks=function(e){return $s("vision",e)},br.forTextTasks=function(e){return $s("text",e)},br.forGenAiExperimentalTasks=function(e){return $s("genai_experimental",e)},br.forGenAiTasks=function(e){return $s("genai",e)},br.forAudioTasks=function(e){return $s("audio",e)},br.isSimdSupported=function(){return P0()};async function uy(e,t,n,i){return e=await(async(r,s,o,a,c)=>{if(s&&await Ld(s),!self.ModuleFactory||o&&(await Ld(o),!self.ModuleFactory))throw Error("ModuleFactory not set.");return self.Module&&c&&((s=self.Module).locateFile=c.locateFile,c.mainScriptUrlOrBlob&&(s.mainScriptUrlOrBlob=c.mainScriptUrlOrBlob)),c=await self.ModuleFactory(self.Module||c),self.ModuleFactory=self.Module=void 0,new r(c,a)})(e,n.wasmLoaderPath,n.assetLoaderPath,t,{locateFile:r=>r.endsWith(".wasm")?n.wasmBinaryPath.toString():n.assetBinaryPath&&r.endsWith(".data")?n.assetBinaryPath.toString():r}),await e.o(i),e}function ll(e,t){const n=Zt(e.baseOptions,Ga,1)||new Ga;typeof t=="string"?(de(n,2,Bs(t)),de(n,1)):t instanceof Uint8Array&&(de(n,1,su(t,!1,!1)),de(n,2)),bt(e.baseOptions,0,1,n)}function Ud(e){try{const t=e.K.length;if(t===1)throw Error(e.K[0].message);if(1<t)throw Error("Encountered multiple errors: "+e.K.map(n=>n.message).join(", "))}finally{e.K=[]}}function ft(e,t){e.J=Math.max(e.J,t)}function fc(e,t){e.C=new on,Cn(e.C,"PassThroughCalculator"),pe(e.C,"free_memory"),Wt(e.C,"free_memory_unused_out"),ye(t,"free_memory"),Pn(t,e.C)}function As(e,t){pe(e.C,t),Wt(e.C,t+"_unused_out")}function dc(e){e.g.addBoolToStream(!0,"free_memory",e.J)}var ba=class{constructor(e){this.g=e,this.K=[],this.J=0,this.g.setAutoRenderToScreen(!1)}l(e,t=!0){var n,i,r,s,o,a;if(t){const c=e.baseOptions||{};if((n=e.baseOptions)!=null&&n.modelAssetBuffer&&((i=e.baseOptions)!=null&&i.modelAssetPath))throw Error("Cannot set both baseOptions.modelAssetPath and baseOptions.modelAssetBuffer");if(!((r=Zt(this.baseOptions,Ga,1))!=null&&r.g()||(s=Zt(this.baseOptions,Ga,1))!=null&&s.h()||(o=e.baseOptions)!=null&&o.modelAssetBuffer||(a=e.baseOptions)!=null&&a.modelAssetPath))throw Error("Either baseOptions.modelAssetPath or baseOptions.modelAssetBuffer must be set");if(function(l,h){let u=Zt(l.baseOptions,Rd,3);if(!u){var f=u=new Rd,p=new bd;co(f,4,Aa,p)}"delegate"in h&&(h.delegate==="GPU"?(h=u,f=new Om,co(h,2,Aa,f)):(h=u,f=new bd,co(h,4,Aa,f))),bt(l.baseOptions,0,3,u)}(this,c),c.modelAssetPath)return fetch(c.modelAssetPath.toString()).then(l=>{if(l.ok)return l.arrayBuffer();throw Error(`Failed to fetch model: ${c.modelAssetPath} (${l.status})`)}).then(l=>{try{this.g.i.FS_unlink("/model.dat")}catch{}this.g.i.FS_createDataFile("/","model.dat",new Uint8Array(l),!0,!1,!1),ll(this,"/model.dat"),this.m(),this.L()});if(c.modelAssetBuffer instanceof Uint8Array)ll(this,c.modelAssetBuffer);else if(c.modelAssetBuffer)return async function(l){const h=[];for(var u=0;;){const{done:f,value:p}=await l.read();if(f)break;h.push(p),u+=p.length}if(h.length===0)return new Uint8Array(0);if(h.length===1)return h[0];l=new Uint8Array(u),u=0;for(const f of h)l.set(f,u),u+=f.length;return l}(c.modelAssetBuffer).then(l=>{ll(this,l),this.m(),this.L()})}return this.m(),this.L(),Promise.resolve()}L(){}fa(){let e;if(this.g.fa(t=>{e=bM(t)}),!e)throw Error("Failed to retrieve CalculatorGraphConfig");return e}setGraph(e,t){this.g.attachErrorListener((n,i)=>{this.K.push(Error(i))}),this.g.Ma(),this.g.setGraph(e,t),this.C=void 0,Ud(this)}finishProcessing(){this.g.finishProcessing(),Ud(this)}close(){this.C=void 0,this.g.closeGraph()}};function Bi(e,t){if(!e)throw Error(`Unable to obtain required WebGL resource: ${t}`);return e}ba.prototype.close=ba.prototype.close,function(e,t){e=e.split(".");var n,i=bo;for((e[0]in i)||i.execScript===void 0||i.execScript("var "+e[0]);e.length&&(n=e.shift());)e.length||t===void 0?i=i[n]&&i[n]!==Object.prototype[n]?i[n]:i[n]={}:i[n]=t}("TaskRunner",ba);class fy{constructor(t,n,i,r){this.g=t,this.h=n,this.m=i,this.l=r}bind(){this.g.bindVertexArray(this.h)}close(){this.g.deleteVertexArray(this.h),this.g.deleteBuffer(this.m),this.g.deleteBuffer(this.l)}}function Nd(e,t,n){const i=e.g;if(n=Bi(i.createShader(n),"Failed to create WebGL shader"),i.shaderSource(n,t),i.compileShader(n),!i.getShaderParameter(n,i.COMPILE_STATUS))throw Error(`Could not compile WebGL shader: ${i.getShaderInfoLog(n)}`);return i.attachShader(e.h,n),n}function Fd(e,t){const n=e.g,i=Bi(n.createVertexArray(),"Failed to create vertex array");n.bindVertexArray(i);const r=Bi(n.createBuffer(),"Failed to create buffer");n.bindBuffer(n.ARRAY_BUFFER,r),n.enableVertexAttribArray(e.K),n.vertexAttribPointer(e.K,2,n.FLOAT,!1,0,0),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),n.STATIC_DRAW);const s=Bi(n.createBuffer(),"Failed to create buffer");return n.bindBuffer(n.ARRAY_BUFFER,s),n.enableVertexAttribArray(e.J),n.vertexAttribPointer(e.J,2,n.FLOAT,!1,0,0),n.bufferData(n.ARRAY_BUFFER,new Float32Array(t?[0,1,0,0,1,0,1,1]:[0,0,0,1,1,1,1,0]),n.STATIC_DRAW),n.bindBuffer(n.ARRAY_BUFFER,null),n.bindVertexArray(null),new fy(n,i,r,s)}function Pu(e,t){if(e.g){if(t!==e.g)throw Error("Cannot change GL context once initialized")}else e.g=t}function Lu(e,t,n,i){return Pu(e,t),e.h||(e.m(),e.D()),n?(e.v||(e.v=Fd(e,!0)),n=e.v):(e.A||(e.A=Fd(e,!1)),n=e.A),t.useProgram(e.h),n.bind(),e.l(),e=i(),n.g.bindVertexArray(null),e}function pc(e,t,n){return Pu(e,t),e=Bi(t.createTexture(),"Failed to create texture"),t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,n??t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,n??t.LINEAR),t.bindTexture(t.TEXTURE_2D,null),e}function mc(e,t,n){Pu(e,t),e.u||(e.u=Bi(t.createFramebuffer(),"Failed to create framebuffe.")),t.bindFramebuffer(t.FRAMEBUFFER,e.u),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,n,0)}function Du(e){var t;(t=e.g)==null||t.bindFramebuffer(e.g.FRAMEBUFFER,null)}var Iu=class{H(){return`
  precision mediump float;
  varying vec2 vTex;
  uniform sampler2D inputTexture;
  void main() {
    gl_FragColor = texture2D(inputTexture, vTex);
  }
 `}m(){const e=this.g;if(this.h=Bi(e.createProgram(),"Failed to create WebGL program"),this.ba=Nd(this,`
  attribute vec2 aVertex;
  attribute vec2 aTex;
  varying vec2 vTex;
  void main(void) {
    gl_Position = vec4(aVertex, 0.0, 1.0);
    vTex = aTex;
  }`,e.VERTEX_SHADER),this.aa=Nd(this,this.H(),e.FRAGMENT_SHADER),e.linkProgram(this.h),!e.getProgramParameter(this.h,e.LINK_STATUS))throw Error(`Error during program linking: ${e.getProgramInfoLog(this.h)}`);this.K=e.getAttribLocation(this.h,"aVertex"),this.J=e.getAttribLocation(this.h,"aTex")}D(){}l(){}close(){if(this.h){const e=this.g;e.deleteProgram(this.h),e.deleteShader(this.ba),e.deleteShader(this.aa)}this.u&&this.g.deleteFramebuffer(this.u),this.A&&this.A.close(),this.v&&this.v.close()}};function Li(e,t){switch(t){case 0:return e.g.find(n=>n instanceof Uint8Array);case 1:return e.g.find(n=>n instanceof Float32Array);case 2:return e.g.find(n=>typeof WebGLTexture<"u"&&n instanceof WebGLTexture);default:throw Error(`Type is not supported: ${t}`)}}function yh(e){var t=Li(e,1);if(!t){if(t=Li(e,0))t=new Float32Array(t).map(i=>i/255);else{t=new Float32Array(e.width*e.height);const i=bs(e);var n=Uu(e);if(mc(n,i,I0(e)),"iPad Simulator;iPhone Simulator;iPod Simulator;iPad;iPhone;iPod".split(";").includes(navigator.platform)||navigator.userAgent.includes("Mac")&&"ontouchend"in self.document){n=new Float32Array(e.width*e.height*4),i.readPixels(0,0,e.width,e.height,i.RGBA,i.FLOAT,n);for(let r=0,s=0;r<t.length;++r,s+=4)t[r]=n[s]}else i.readPixels(0,0,e.width,e.height,i.RED,i.FLOAT,t)}e.g.push(t)}return t}function I0(e){let t=Li(e,2);if(!t){const n=bs(e);t=N0(e);const i=yh(e),r=U0(e);n.texImage2D(n.TEXTURE_2D,0,r,e.width,e.height,0,n.RED,n.FLOAT,i),Sh(e)}return t}function bs(e){if(!e.canvas)throw Error("Conversion to different image formats require that a canvas is passed when initializing the image.");return e.h||(e.h=Bi(e.canvas.getContext("webgl2"),"You cannot use a canvas that is already bound to a different type of rendering context.")),e.h}function U0(e){if(e=bs(e),!ua)if(e.getExtension("EXT_color_buffer_float")&&e.getExtension("OES_texture_float_linear")&&e.getExtension("EXT_float_blend"))ua=e.R32F;else{if(!e.getExtension("EXT_color_buffer_half_float"))throw Error("GPU does not fully support 4-channel float32 or float16 formats");ua=e.R16F}return ua}function Uu(e){return e.l||(e.l=new Iu),e.l}function N0(e){const t=bs(e);t.viewport(0,0,e.width,e.height),t.activeTexture(t.TEXTURE0);let n=Li(e,2);return n||(n=pc(Uu(e),t,e.m?t.LINEAR:t.NEAREST),e.g.push(n),e.j=!0),t.bindTexture(t.TEXTURE_2D,n),n}function Sh(e){e.h.bindTexture(e.h.TEXTURE_2D,null)}var ua,Ke=class{constructor(e,t,n,i,r,s,o){this.g=e,this.m=t,this.j=n,this.canvas=i,this.l=r,this.width=s,this.height=o,this.j&&--Od===0&&console.error("You seem to be creating MPMask instances without invoking .close(). This leaks resources.")}Ha(){return!!Li(this,0)}la(){return!!Li(this,1)}R(){return!!Li(this,2)}ka(){return(t=Li(e=this,0))||(t=yh(e),t=new Uint8Array(t.map(n=>255*n)),e.g.push(t)),t;var e,t}ja(){return yh(this)}O(){return I0(this)}clone(){const e=[];for(const t of this.g){let n;if(t instanceof Uint8Array)n=new Uint8Array(t);else if(t instanceof Float32Array)n=new Float32Array(t);else{if(!(t instanceof WebGLTexture))throw Error(`Type is not supported: ${t}`);{const i=bs(this),r=Uu(this);i.activeTexture(i.TEXTURE1),n=pc(r,i,this.m?i.LINEAR:i.NEAREST),i.bindTexture(i.TEXTURE_2D,n);const s=U0(this);i.texImage2D(i.TEXTURE_2D,0,s,this.width,this.height,0,i.RED,i.FLOAT,null),i.bindTexture(i.TEXTURE_2D,null),mc(r,i,n),Lu(r,i,!1,()=>{N0(this),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.drawArrays(i.TRIANGLE_FAN,0,4),Sh(this)}),Du(r),Sh(this)}}e.push(n)}return new Ke(e,this.m,this.R(),this.canvas,this.l,this.width,this.height)}close(){this.j&&bs(this).deleteTexture(Li(this,2)),Od=-1}};Ke.prototype.close=Ke.prototype.close,Ke.prototype.clone=Ke.prototype.clone,Ke.prototype.getAsWebGLTexture=Ke.prototype.O,Ke.prototype.getAsFloat32Array=Ke.prototype.ja,Ke.prototype.getAsUint8Array=Ke.prototype.ka,Ke.prototype.hasWebGLTexture=Ke.prototype.R,Ke.prototype.hasFloat32Array=Ke.prototype.la,Ke.prototype.hasUint8Array=Ke.prototype.Ha;var Od=250;function hi(e,t){switch(t){case 0:return e.g.find(n=>n instanceof ImageData);case 1:return e.g.find(n=>typeof ImageBitmap<"u"&&n instanceof ImageBitmap);case 2:return e.g.find(n=>typeof WebGLTexture<"u"&&n instanceof WebGLTexture);default:throw Error(`Type is not supported: ${t}`)}}function F0(e){var t=hi(e,0);if(!t){t=ws(e);const n=gc(e),i=new Uint8Array(e.width*e.height*4);mc(n,t,wa(e)),t.readPixels(0,0,e.width,e.height,t.RGBA,t.UNSIGNED_BYTE,i),Du(n),t=new ImageData(new Uint8ClampedArray(i.buffer),e.width,e.height),e.g.push(t)}return t}function wa(e){let t=hi(e,2);if(!t){const n=ws(e);t=Ra(e);const i=hi(e,1)||F0(e);n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,i),ro(e)}return t}function ws(e){if(!e.canvas)throw Error("Conversion to different image formats require that a canvas is passed when iniitializing the image.");return e.h||(e.h=Bi(e.canvas.getContext("webgl2"),"You cannot use a canvas that is already bound to a different type of rendering context.")),e.h}function gc(e){return e.l||(e.l=new Iu),e.l}function Ra(e){const t=ws(e);t.viewport(0,0,e.width,e.height),t.activeTexture(t.TEXTURE0);let n=hi(e,2);return n||(n=pc(gc(e),t),e.g.push(n),e.m=!0),t.bindTexture(t.TEXTURE_2D,n),n}function ro(e){e.h.bindTexture(e.h.TEXTURE_2D,null)}function Bd(e){const t=ws(e);return Lu(gc(e),t,!0,()=>function(n,i){const r=n.canvas;if(r.width===n.width&&r.height===n.height)return i();const s=r.width,o=r.height;return r.width=n.width,r.height=n.height,n=i(),r.width=s,r.height=o,n}(e,()=>{if(t.bindFramebuffer(t.FRAMEBUFFER,null),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.drawArrays(t.TRIANGLE_FAN,0,4),!(e.canvas instanceof OffscreenCanvas))throw Error("Conversion to ImageBitmap requires that the MediaPipe Tasks is initialized with an OffscreenCanvas");return e.canvas.transferToImageBitmap()}))}var $e=class{constructor(e,t,n,i,r,s,o){this.g=e,this.j=t,this.m=n,this.canvas=i,this.l=r,this.width=s,this.height=o,(this.j||this.m)&&--kd===0&&console.error("You seem to be creating MPImage instances without invoking .close(). This leaks resources.")}Ga(){return!!hi(this,0)}ma(){return!!hi(this,1)}R(){return!!hi(this,2)}Ea(){return F0(this)}Da(){var e=hi(this,1);return e||(wa(this),Ra(this),e=Bd(this),ro(this),this.g.push(e),this.j=!0),e}O(){return wa(this)}clone(){const e=[];for(const t of this.g){let n;if(t instanceof ImageData)n=new ImageData(t.data,this.width,this.height);else if(t instanceof WebGLTexture){const i=ws(this),r=gc(this);i.activeTexture(i.TEXTURE1),n=pc(r,i),i.bindTexture(i.TEXTURE_2D,n),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,this.width,this.height,0,i.RGBA,i.UNSIGNED_BYTE,null),i.bindTexture(i.TEXTURE_2D,null),mc(r,i,n),Lu(r,i,!1,()=>{Ra(this),i.clearColor(0,0,0,0),i.clear(i.COLOR_BUFFER_BIT),i.drawArrays(i.TRIANGLE_FAN,0,4),ro(this)}),Du(r),ro(this)}else{if(!(t instanceof ImageBitmap))throw Error(`Type is not supported: ${t}`);wa(this),Ra(this),n=Bd(this),ro(this)}e.push(n)}return new $e(e,this.ma(),this.R(),this.canvas,this.l,this.width,this.height)}close(){this.j&&hi(this,1).close(),this.m&&ws(this).deleteTexture(hi(this,2)),kd=-1}};$e.prototype.close=$e.prototype.close,$e.prototype.clone=$e.prototype.clone,$e.prototype.getAsWebGLTexture=$e.prototype.O,$e.prototype.getAsImageBitmap=$e.prototype.Da,$e.prototype.getAsImageData=$e.prototype.Ea,$e.prototype.hasWebGLTexture=$e.prototype.R,$e.prototype.hasImageBitmap=$e.prototype.ma,$e.prototype.hasImageData=$e.prototype.Ga;var kd=250;function ii(...e){return e.map(([t,n])=>({start:t,end:n}))}const dy=function(e){return class extends e{Ma(){this.i._registerModelResourcesGraphService()}}}((zd=class{constructor(e,t){this.l=!0,this.i=e,this.g=null,this.h=0,this.m=typeof this.i._addIntToInputStream=="function",t!==void 0?this.i.canvas=t:L0()?this.i.canvas=new OffscreenCanvas(1,1):(console.warn("OffscreenCanvas not supported and GraphRunner constructor glCanvas parameter is undefined. Creating backup canvas."),this.i.canvas=document.createElement("canvas"))}async initializeGraph(e){const t=await(await fetch(e)).arrayBuffer();e=!(e.endsWith(".pbtxt")||e.endsWith(".textproto")),this.setGraph(new Uint8Array(t),e)}setGraphFromString(e){this.setGraph(new TextEncoder().encode(e),!1)}setGraph(e,t){const n=e.length,i=this.i._malloc(n);this.i.HEAPU8.set(e,i),t?this.i._changeBinaryGraph(n,i):this.i._changeTextGraph(n,i),this.i._free(i)}configureAudio(e,t,n,i,r){this.i._configureAudio||console.warn('Attempting to use configureAudio without support for input audio. Is build dep ":gl_graph_runner_audio" missing?'),St(this,i||"input_audio",s=>{St(this,r=r||"audio_header",o=>{this.i._configureAudio(s,o,e,t,n)})})}setAutoResizeCanvas(e){this.l=e}setAutoRenderToScreen(e){this.i._setAutoRenderToScreen(e)}setGpuBufferVerticalFlip(e){this.i.gpuOriginForWebTexturesIsBottomLeft=e}fa(e){oi(this,"__graph_config__",t=>{e(t)}),St(this,"__graph_config__",t=>{this.i._getGraphConfig(t,void 0)}),delete this.i.simpleListeners.__graph_config__}attachErrorListener(e){this.i.errorListener=e}attachEmptyPacketListener(e,t){this.i.emptyPacketListeners=this.i.emptyPacketListeners||{},this.i.emptyPacketListeners[e]=t}addAudioToStream(e,t,n){this.addAudioToStreamWithShape(e,0,0,t,n)}addAudioToStreamWithShape(e,t,n,i,r){const s=4*e.length;this.h!==s&&(this.g&&this.i._free(this.g),this.g=this.i._malloc(s),this.h=s),this.i.HEAPF32.set(e,this.g/4),St(this,i,o=>{this.i._addAudioToInputStream(this.g,t,n,o,r)})}addGpuBufferToStream(e,t,n){St(this,t,i=>{const[r,s]=Dd(this,e,i);this.i._addBoundTextureToStream(i,r,s,n)})}addBoolToStream(e,t,n){St(this,t,i=>{this.i._addBoolToInputStream(e,i,n)})}addDoubleToStream(e,t,n){St(this,t,i=>{this.i._addDoubleToInputStream(e,i,n)})}addFloatToStream(e,t,n){St(this,t,i=>{this.i._addFloatToInputStream(e,i,n)})}addIntToStream(e,t,n){St(this,t,i=>{this.i._addIntToInputStream(e,i,n)})}addUintToStream(e,t,n){St(this,t,i=>{this.i._addUintToInputStream(e,i,n)})}addStringToStream(e,t,n){St(this,t,i=>{St(this,e,r=>{this.i._addStringToInputStream(r,i,n)})})}addStringRecordToStream(e,t,n){St(this,t,i=>{Id(this,Object.keys(e),r=>{Id(this,Object.values(e),s=>{this.i._addFlatHashMapToInputStream(r,s,Object.keys(e).length,i,n)})})})}addProtoToStream(e,t,n,i){St(this,n,r=>{St(this,t,s=>{const o=this.i._malloc(e.length);this.i.HEAPU8.set(e,o),this.i._addProtoToInputStream(o,e.length,s,r,i),this.i._free(o)})})}addEmptyPacketToStream(e,t){St(this,e,n=>{this.i._addEmptyPacketToInputStream(n,t)})}addBoolVectorToStream(e,t,n){St(this,t,i=>{const r=this.i._allocateBoolVector(e.length);if(!r)throw Error("Unable to allocate new bool vector on heap.");for(const s of e)this.i._addBoolVectorEntry(r,s);this.i._addBoolVectorToInputStream(r,i,n)})}addDoubleVectorToStream(e,t,n){St(this,t,i=>{const r=this.i._allocateDoubleVector(e.length);if(!r)throw Error("Unable to allocate new double vector on heap.");for(const s of e)this.i._addDoubleVectorEntry(r,s);this.i._addDoubleVectorToInputStream(r,i,n)})}addFloatVectorToStream(e,t,n){St(this,t,i=>{const r=this.i._allocateFloatVector(e.length);if(!r)throw Error("Unable to allocate new float vector on heap.");for(const s of e)this.i._addFloatVectorEntry(r,s);this.i._addFloatVectorToInputStream(r,i,n)})}addIntVectorToStream(e,t,n){St(this,t,i=>{const r=this.i._allocateIntVector(e.length);if(!r)throw Error("Unable to allocate new int vector on heap.");for(const s of e)this.i._addIntVectorEntry(r,s);this.i._addIntVectorToInputStream(r,i,n)})}addUintVectorToStream(e,t,n){St(this,t,i=>{const r=this.i._allocateUintVector(e.length);if(!r)throw Error("Unable to allocate new unsigned int vector on heap.");for(const s of e)this.i._addUintVectorEntry(r,s);this.i._addUintVectorToInputStream(r,i,n)})}addStringVectorToStream(e,t,n){St(this,t,i=>{const r=this.i._allocateStringVector(e.length);if(!r)throw Error("Unable to allocate new string vector on heap.");for(const s of e)St(this,s,o=>{this.i._addStringVectorEntry(r,o)});this.i._addStringVectorToInputStream(r,i,n)})}addBoolToInputSidePacket(e,t){St(this,t,n=>{this.i._addBoolToInputSidePacket(e,n)})}addDoubleToInputSidePacket(e,t){St(this,t,n=>{this.i._addDoubleToInputSidePacket(e,n)})}addFloatToInputSidePacket(e,t){St(this,t,n=>{this.i._addFloatToInputSidePacket(e,n)})}addIntToInputSidePacket(e,t){St(this,t,n=>{this.i._addIntToInputSidePacket(e,n)})}addUintToInputSidePacket(e,t){St(this,t,n=>{this.i._addUintToInputSidePacket(e,n)})}addStringToInputSidePacket(e,t){St(this,t,n=>{St(this,e,i=>{this.i._addStringToInputSidePacket(i,n)})})}addProtoToInputSidePacket(e,t,n){St(this,n,i=>{St(this,t,r=>{const s=this.i._malloc(e.length);this.i.HEAPU8.set(e,s),this.i._addProtoToInputSidePacket(s,e.length,r,i),this.i._free(s)})})}addBoolVectorToInputSidePacket(e,t){St(this,t,n=>{const i=this.i._allocateBoolVector(e.length);if(!i)throw Error("Unable to allocate new bool vector on heap.");for(const r of e)this.i._addBoolVectorEntry(i,r);this.i._addBoolVectorToInputSidePacket(i,n)})}addDoubleVectorToInputSidePacket(e,t){St(this,t,n=>{const i=this.i._allocateDoubleVector(e.length);if(!i)throw Error("Unable to allocate new double vector on heap.");for(const r of e)this.i._addDoubleVectorEntry(i,r);this.i._addDoubleVectorToInputSidePacket(i,n)})}addFloatVectorToInputSidePacket(e,t){St(this,t,n=>{const i=this.i._allocateFloatVector(e.length);if(!i)throw Error("Unable to allocate new float vector on heap.");for(const r of e)this.i._addFloatVectorEntry(i,r);this.i._addFloatVectorToInputSidePacket(i,n)})}addIntVectorToInputSidePacket(e,t){St(this,t,n=>{const i=this.i._allocateIntVector(e.length);if(!i)throw Error("Unable to allocate new int vector on heap.");for(const r of e)this.i._addIntVectorEntry(i,r);this.i._addIntVectorToInputSidePacket(i,n)})}addUintVectorToInputSidePacket(e,t){St(this,t,n=>{const i=this.i._allocateUintVector(e.length);if(!i)throw Error("Unable to allocate new unsigned int vector on heap.");for(const r of e)this.i._addUintVectorEntry(i,r);this.i._addUintVectorToInputSidePacket(i,n)})}addStringVectorToInputSidePacket(e,t){St(this,t,n=>{const i=this.i._allocateStringVector(e.length);if(!i)throw Error("Unable to allocate new string vector on heap.");for(const r of e)St(this,r,s=>{this.i._addStringVectorEntry(i,s)});this.i._addStringVectorToInputSidePacket(i,n)})}attachBoolListener(e,t){oi(this,e,t),St(this,e,n=>{this.i._attachBoolListener(n)})}attachBoolVectorListener(e,t){Qi(this,e,t),St(this,e,n=>{this.i._attachBoolVectorListener(n)})}attachIntListener(e,t){oi(this,e,t),St(this,e,n=>{this.i._attachIntListener(n)})}attachIntVectorListener(e,t){Qi(this,e,t),St(this,e,n=>{this.i._attachIntVectorListener(n)})}attachUintListener(e,t){oi(this,e,t),St(this,e,n=>{this.i._attachUintListener(n)})}attachUintVectorListener(e,t){Qi(this,e,t),St(this,e,n=>{this.i._attachUintVectorListener(n)})}attachDoubleListener(e,t){oi(this,e,t),St(this,e,n=>{this.i._attachDoubleListener(n)})}attachDoubleVectorListener(e,t){Qi(this,e,t),St(this,e,n=>{this.i._attachDoubleVectorListener(n)})}attachFloatListener(e,t){oi(this,e,t),St(this,e,n=>{this.i._attachFloatListener(n)})}attachFloatVectorListener(e,t){Qi(this,e,t),St(this,e,n=>{this.i._attachFloatVectorListener(n)})}attachStringListener(e,t){oi(this,e,t),St(this,e,n=>{this.i._attachStringListener(n)})}attachStringVectorListener(e,t){Qi(this,e,t),St(this,e,n=>{this.i._attachStringVectorListener(n)})}attachProtoListener(e,t,n){oi(this,e,t),St(this,e,i=>{this.i._attachProtoListener(i,n||!1)})}attachProtoVectorListener(e,t,n){Qi(this,e,t),St(this,e,i=>{this.i._attachProtoVectorListener(i,n||!1)})}attachAudioListener(e,t,n){this.i._attachAudioListener||console.warn('Attempting to use attachAudioListener without support for output audio. Is build dep ":gl_graph_runner_audio_out" missing?'),oi(this,e,(i,r)=>{i=new Float32Array(i.buffer,i.byteOffset,i.length/4),t(i,r)}),St(this,e,i=>{this.i._attachAudioListener(i,n||!1)})}finishProcessing(){this.i._waitUntilIdle()}closeGraph(){this.i._closeGraph(),this.i.simpleListeners=void 0,this.i.emptyPacketListeners=void 0}},class extends zd{get ha(){return this.i}sa(e,t,n){St(this,t,i=>{const[r,s]=Dd(this,e,i);this.ha._addBoundTextureAsImageToStream(i,r,s,n)})}W(e,t){oi(this,e,t),St(this,e,n=>{this.ha._attachImageListener(n)})}da(e,t){Qi(this,e,t),St(this,e,n=>{this.ha._attachImageVectorListener(n)})}}));var zd,Hn=class extends dy{};async function Ht(e,t,n){return async function(i,r,s,o){return uy(i,r,s,o)}(e,n.canvas??(L0()?void 0:document.createElement("canvas")),t,n)}function O0(e,t,n,i){if(e.V){const s=new t0;if(n!=null&&n.regionOfInterest){if(!e.ra)throw Error("This task doesn't support region-of-interest.");var r=n.regionOfInterest;if(r.left>=r.right||r.top>=r.bottom)throw Error("Expected RectF with left < right and top < bottom.");if(0>r.left||0>r.top||1<r.right||1<r.bottom)throw Error("Expected RectF values to be in [0,1].");_t(s,1,(r.left+r.right)/2),_t(s,2,(r.top+r.bottom)/2),_t(s,4,r.right-r.left),_t(s,3,r.bottom-r.top)}else _t(s,1,.5),_t(s,2,.5),_t(s,4,1),_t(s,3,1);if(n!=null&&n.rotationDegrees){if((n==null?void 0:n.rotationDegrees)%90!=0)throw Error("Expected rotation to be a multiple of 90°.");if(_t(s,5,-Math.PI*n.rotationDegrees/180),(n==null?void 0:n.rotationDegrees)%180!=0){const[o,a]=D0(t);n=Fe(s,3)*a/o,r=Fe(s,4)*o/a,_t(s,4,n),_t(s,3,r)}}e.g.addProtoToStream(s.g(),"mediapipe.NormalizedRect",e.V,i)}e.g.sa(t,e.ba,i??performance.now()),e.finishProcessing()}function Wn(e,t,n){var i;if((i=e.baseOptions)!=null&&i.g())throw Error("Task is not initialized with image mode. 'runningMode' must be set to 'IMAGE'.");O0(e,t,n,e.J+1)}function yi(e,t,n,i){var r;if(!((r=e.baseOptions)!=null&&r.g()))throw Error("Task is not initialized with video mode. 'runningMode' must be set to 'VIDEO'.");O0(e,t,n,i)}function Rs(e,t,n,i){var r=t.data;const s=t.width,o=s*(t=t.height);if((r instanceof Uint8Array||r instanceof Float32Array)&&r.length!==o)throw Error("Unsupported channel count: "+r.length/o);return e=new Ke([r],n,!1,e.g.i.canvas,e.M,s,t),i?e.clone():e}var _n=class extends ba{constructor(e,t,n,i){super(e),this.g=e,this.ba=t,this.V=n,this.ra=i,this.M=new Iu}l(e,t=!0){if("runningMode"in e&&vo(this.baseOptions,2,!!e.runningMode&&e.runningMode!=="IMAGE"),e.canvas!==void 0&&this.g.i.canvas!==e.canvas)throw Error("You must create a new task to reset the canvas.");return super.l(e,t)}close(){this.M.close(),super.close()}};_n.prototype.close=_n.prototype.close;var Un=class extends _n{constructor(e,t){super(new Hn(e,t),"image_in","norm_rect_in",!1),this.j={detections:[]},bt(e=this.h=new hc,0,1,t=new Te),_t(this.h,2,.5),_t(this.h,3,.3)}get baseOptions(){return Zt(this.h,Te,1)}set baseOptions(e){bt(this.h,0,1,e)}o(e){return"minDetectionConfidence"in e&&_t(this.h,2,e.minDetectionConfidence??.5),"minSuppressionThreshold"in e&&_t(this.h,3,e.minSuppressionThreshold??.3),this.l(e)}F(e,t){return this.j={detections:[]},Wn(this,e,t),this.j}G(e,t,n){return this.j={detections:[]},yi(this,e,n,t),this.j}m(){var e=new ln;ye(e,"image_in"),ye(e,"norm_rect_in"),te(e,"detections");const t=new Rn;ei(t,KM,this.h);const n=new on;Cn(n,"mediapipe.tasks.vision.face_detector.FaceDetectorGraph"),pe(n,"IMAGE:image_in"),pe(n,"NORM_RECT:norm_rect_in"),Wt(n,"DETECTIONS:detections"),n.o(t),Pn(e,n),this.g.attachProtoVectorListener("detections",(i,r)=>{for(const s of i)i=jm(s),this.j.detections.push(C0(i));ft(this,r)}),this.g.attachEmptyPacketListener("detections",i=>{ft(this,i)}),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};Un.prototype.detectForVideo=Un.prototype.G,Un.prototype.detect=Un.prototype.F,Un.prototype.setOptions=Un.prototype.o,Un.createFromModelPath=async function(e,t){return Ht(Un,e,{baseOptions:{modelAssetPath:t}})},Un.createFromModelBuffer=function(e,t){return Ht(Un,e,{baseOptions:{modelAssetBuffer:t}})},Un.createFromOptions=function(e,t){return Ht(Un,e,t)};var Nu=ii([61,146],[146,91],[91,181],[181,84],[84,17],[17,314],[314,405],[405,321],[321,375],[375,291],[61,185],[185,40],[40,39],[39,37],[37,0],[0,267],[267,269],[269,270],[270,409],[409,291],[78,95],[95,88],[88,178],[178,87],[87,14],[14,317],[317,402],[402,318],[318,324],[324,308],[78,191],[191,80],[80,81],[81,82],[82,13],[13,312],[312,311],[311,310],[310,415],[415,308]),Fu=ii([263,249],[249,390],[390,373],[373,374],[374,380],[380,381],[381,382],[382,362],[263,466],[466,388],[388,387],[387,386],[386,385],[385,384],[384,398],[398,362]),Ou=ii([276,283],[283,282],[282,295],[295,285],[300,293],[293,334],[334,296],[296,336]),B0=ii([474,475],[475,476],[476,477],[477,474]),Bu=ii([33,7],[7,163],[163,144],[144,145],[145,153],[153,154],[154,155],[155,133],[33,246],[246,161],[161,160],[160,159],[159,158],[158,157],[157,173],[173,133]),ku=ii([46,53],[53,52],[52,65],[65,55],[70,63],[63,105],[105,66],[66,107]),k0=ii([469,470],[470,471],[471,472],[472,469]),zu=ii([10,338],[338,297],[297,332],[332,284],[284,251],[251,389],[389,356],[356,454],[454,323],[323,361],[361,288],[288,397],[397,365],[365,379],[379,378],[378,400],[400,377],[377,152],[152,148],[148,176],[176,149],[149,150],[150,136],[136,172],[172,58],[58,132],[132,93],[93,234],[234,127],[127,162],[162,21],[21,54],[54,103],[103,67],[67,109],[109,10]),z0=[...Nu,...Fu,...Ou,...Bu,...ku,...zu],V0=ii([127,34],[34,139],[139,127],[11,0],[0,37],[37,11],[232,231],[231,120],[120,232],[72,37],[37,39],[39,72],[128,121],[121,47],[47,128],[232,121],[121,128],[128,232],[104,69],[69,67],[67,104],[175,171],[171,148],[148,175],[118,50],[50,101],[101,118],[73,39],[39,40],[40,73],[9,151],[151,108],[108,9],[48,115],[115,131],[131,48],[194,204],[204,211],[211,194],[74,40],[40,185],[185,74],[80,42],[42,183],[183,80],[40,92],[92,186],[186,40],[230,229],[229,118],[118,230],[202,212],[212,214],[214,202],[83,18],[18,17],[17,83],[76,61],[61,146],[146,76],[160,29],[29,30],[30,160],[56,157],[157,173],[173,56],[106,204],[204,194],[194,106],[135,214],[214,192],[192,135],[203,165],[165,98],[98,203],[21,71],[71,68],[68,21],[51,45],[45,4],[4,51],[144,24],[24,23],[23,144],[77,146],[146,91],[91,77],[205,50],[50,187],[187,205],[201,200],[200,18],[18,201],[91,106],[106,182],[182,91],[90,91],[91,181],[181,90],[85,84],[84,17],[17,85],[206,203],[203,36],[36,206],[148,171],[171,140],[140,148],[92,40],[40,39],[39,92],[193,189],[189,244],[244,193],[159,158],[158,28],[28,159],[247,246],[246,161],[161,247],[236,3],[3,196],[196,236],[54,68],[68,104],[104,54],[193,168],[168,8],[8,193],[117,228],[228,31],[31,117],[189,193],[193,55],[55,189],[98,97],[97,99],[99,98],[126,47],[47,100],[100,126],[166,79],[79,218],[218,166],[155,154],[154,26],[26,155],[209,49],[49,131],[131,209],[135,136],[136,150],[150,135],[47,126],[126,217],[217,47],[223,52],[52,53],[53,223],[45,51],[51,134],[134,45],[211,170],[170,140],[140,211],[67,69],[69,108],[108,67],[43,106],[106,91],[91,43],[230,119],[119,120],[120,230],[226,130],[130,247],[247,226],[63,53],[53,52],[52,63],[238,20],[20,242],[242,238],[46,70],[70,156],[156,46],[78,62],[62,96],[96,78],[46,53],[53,63],[63,46],[143,34],[34,227],[227,143],[123,117],[117,111],[111,123],[44,125],[125,19],[19,44],[236,134],[134,51],[51,236],[216,206],[206,205],[205,216],[154,153],[153,22],[22,154],[39,37],[37,167],[167,39],[200,201],[201,208],[208,200],[36,142],[142,100],[100,36],[57,212],[212,202],[202,57],[20,60],[60,99],[99,20],[28,158],[158,157],[157,28],[35,226],[226,113],[113,35],[160,159],[159,27],[27,160],[204,202],[202,210],[210,204],[113,225],[225,46],[46,113],[43,202],[202,204],[204,43],[62,76],[76,77],[77,62],[137,123],[123,116],[116,137],[41,38],[38,72],[72,41],[203,129],[129,142],[142,203],[64,98],[98,240],[240,64],[49,102],[102,64],[64,49],[41,73],[73,74],[74,41],[212,216],[216,207],[207,212],[42,74],[74,184],[184,42],[169,170],[170,211],[211,169],[170,149],[149,176],[176,170],[105,66],[66,69],[69,105],[122,6],[6,168],[168,122],[123,147],[147,187],[187,123],[96,77],[77,90],[90,96],[65,55],[55,107],[107,65],[89,90],[90,180],[180,89],[101,100],[100,120],[120,101],[63,105],[105,104],[104,63],[93,137],[137,227],[227,93],[15,86],[86,85],[85,15],[129,102],[102,49],[49,129],[14,87],[87,86],[86,14],[55,8],[8,9],[9,55],[100,47],[47,121],[121,100],[145,23],[23,22],[22,145],[88,89],[89,179],[179,88],[6,122],[122,196],[196,6],[88,95],[95,96],[96,88],[138,172],[172,136],[136,138],[215,58],[58,172],[172,215],[115,48],[48,219],[219,115],[42,80],[80,81],[81,42],[195,3],[3,51],[51,195],[43,146],[146,61],[61,43],[171,175],[175,199],[199,171],[81,82],[82,38],[38,81],[53,46],[46,225],[225,53],[144,163],[163,110],[110,144],[52,65],[65,66],[66,52],[229,228],[228,117],[117,229],[34,127],[127,234],[234,34],[107,108],[108,69],[69,107],[109,108],[108,151],[151,109],[48,64],[64,235],[235,48],[62,78],[78,191],[191,62],[129,209],[209,126],[126,129],[111,35],[35,143],[143,111],[117,123],[123,50],[50,117],[222,65],[65,52],[52,222],[19,125],[125,141],[141,19],[221,55],[55,65],[65,221],[3,195],[195,197],[197,3],[25,7],[7,33],[33,25],[220,237],[237,44],[44,220],[70,71],[71,139],[139,70],[122,193],[193,245],[245,122],[247,130],[130,33],[33,247],[71,21],[21,162],[162,71],[170,169],[169,150],[150,170],[188,174],[174,196],[196,188],[216,186],[186,92],[92,216],[2,97],[97,167],[167,2],[141,125],[125,241],[241,141],[164,167],[167,37],[37,164],[72,38],[38,12],[12,72],[38,82],[82,13],[13,38],[63,68],[68,71],[71,63],[226,35],[35,111],[111,226],[101,50],[50,205],[205,101],[206,92],[92,165],[165,206],[209,198],[198,217],[217,209],[165,167],[167,97],[97,165],[220,115],[115,218],[218,220],[133,112],[112,243],[243,133],[239,238],[238,241],[241,239],[214,135],[135,169],[169,214],[190,173],[173,133],[133,190],[171,208],[208,32],[32,171],[125,44],[44,237],[237,125],[86,87],[87,178],[178,86],[85,86],[86,179],[179,85],[84,85],[85,180],[180,84],[83,84],[84,181],[181,83],[201,83],[83,182],[182,201],[137,93],[93,132],[132,137],[76,62],[62,183],[183,76],[61,76],[76,184],[184,61],[57,61],[61,185],[185,57],[212,57],[57,186],[186,212],[214,207],[207,187],[187,214],[34,143],[143,156],[156,34],[79,239],[239,237],[237,79],[123,137],[137,177],[177,123],[44,1],[1,4],[4,44],[201,194],[194,32],[32,201],[64,102],[102,129],[129,64],[213,215],[215,138],[138,213],[59,166],[166,219],[219,59],[242,99],[99,97],[97,242],[2,94],[94,141],[141,2],[75,59],[59,235],[235,75],[24,110],[110,228],[228,24],[25,130],[130,226],[226,25],[23,24],[24,229],[229,23],[22,23],[23,230],[230,22],[26,22],[22,231],[231,26],[112,26],[26,232],[232,112],[189,190],[190,243],[243,189],[221,56],[56,190],[190,221],[28,56],[56,221],[221,28],[27,28],[28,222],[222,27],[29,27],[27,223],[223,29],[30,29],[29,224],[224,30],[247,30],[30,225],[225,247],[238,79],[79,20],[20,238],[166,59],[59,75],[75,166],[60,75],[75,240],[240,60],[147,177],[177,215],[215,147],[20,79],[79,166],[166,20],[187,147],[147,213],[213,187],[112,233],[233,244],[244,112],[233,128],[128,245],[245,233],[128,114],[114,188],[188,128],[114,217],[217,174],[174,114],[131,115],[115,220],[220,131],[217,198],[198,236],[236,217],[198,131],[131,134],[134,198],[177,132],[132,58],[58,177],[143,35],[35,124],[124,143],[110,163],[163,7],[7,110],[228,110],[110,25],[25,228],[356,389],[389,368],[368,356],[11,302],[302,267],[267,11],[452,350],[350,349],[349,452],[302,303],[303,269],[269,302],[357,343],[343,277],[277,357],[452,453],[453,357],[357,452],[333,332],[332,297],[297,333],[175,152],[152,377],[377,175],[347,348],[348,330],[330,347],[303,304],[304,270],[270,303],[9,336],[336,337],[337,9],[278,279],[279,360],[360,278],[418,262],[262,431],[431,418],[304,408],[408,409],[409,304],[310,415],[415,407],[407,310],[270,409],[409,410],[410,270],[450,348],[348,347],[347,450],[422,430],[430,434],[434,422],[313,314],[314,17],[17,313],[306,307],[307,375],[375,306],[387,388],[388,260],[260,387],[286,414],[414,398],[398,286],[335,406],[406,418],[418,335],[364,367],[367,416],[416,364],[423,358],[358,327],[327,423],[251,284],[284,298],[298,251],[281,5],[5,4],[4,281],[373,374],[374,253],[253,373],[307,320],[320,321],[321,307],[425,427],[427,411],[411,425],[421,313],[313,18],[18,421],[321,405],[405,406],[406,321],[320,404],[404,405],[405,320],[315,16],[16,17],[17,315],[426,425],[425,266],[266,426],[377,400],[400,369],[369,377],[322,391],[391,269],[269,322],[417,465],[465,464],[464,417],[386,257],[257,258],[258,386],[466,260],[260,388],[388,466],[456,399],[399,419],[419,456],[284,332],[332,333],[333,284],[417,285],[285,8],[8,417],[346,340],[340,261],[261,346],[413,441],[441,285],[285,413],[327,460],[460,328],[328,327],[355,371],[371,329],[329,355],[392,439],[439,438],[438,392],[382,341],[341,256],[256,382],[429,420],[420,360],[360,429],[364,394],[394,379],[379,364],[277,343],[343,437],[437,277],[443,444],[444,283],[283,443],[275,440],[440,363],[363,275],[431,262],[262,369],[369,431],[297,338],[338,337],[337,297],[273,375],[375,321],[321,273],[450,451],[451,349],[349,450],[446,342],[342,467],[467,446],[293,334],[334,282],[282,293],[458,461],[461,462],[462,458],[276,353],[353,383],[383,276],[308,324],[324,325],[325,308],[276,300],[300,293],[293,276],[372,345],[345,447],[447,372],[352,345],[345,340],[340,352],[274,1],[1,19],[19,274],[456,248],[248,281],[281,456],[436,427],[427,425],[425,436],[381,256],[256,252],[252,381],[269,391],[391,393],[393,269],[200,199],[199,428],[428,200],[266,330],[330,329],[329,266],[287,273],[273,422],[422,287],[250,462],[462,328],[328,250],[258,286],[286,384],[384,258],[265,353],[353,342],[342,265],[387,259],[259,257],[257,387],[424,431],[431,430],[430,424],[342,353],[353,276],[276,342],[273,335],[335,424],[424,273],[292,325],[325,307],[307,292],[366,447],[447,345],[345,366],[271,303],[303,302],[302,271],[423,266],[266,371],[371,423],[294,455],[455,460],[460,294],[279,278],[278,294],[294,279],[271,272],[272,304],[304,271],[432,434],[434,427],[427,432],[272,407],[407,408],[408,272],[394,430],[430,431],[431,394],[395,369],[369,400],[400,395],[334,333],[333,299],[299,334],[351,417],[417,168],[168,351],[352,280],[280,411],[411,352],[325,319],[319,320],[320,325],[295,296],[296,336],[336,295],[319,403],[403,404],[404,319],[330,348],[348,349],[349,330],[293,298],[298,333],[333,293],[323,454],[454,447],[447,323],[15,16],[16,315],[315,15],[358,429],[429,279],[279,358],[14,15],[15,316],[316,14],[285,336],[336,9],[9,285],[329,349],[349,350],[350,329],[374,380],[380,252],[252,374],[318,402],[402,403],[403,318],[6,197],[197,419],[419,6],[318,319],[319,325],[325,318],[367,364],[364,365],[365,367],[435,367],[367,397],[397,435],[344,438],[438,439],[439,344],[272,271],[271,311],[311,272],[195,5],[5,281],[281,195],[273,287],[287,291],[291,273],[396,428],[428,199],[199,396],[311,271],[271,268],[268,311],[283,444],[444,445],[445,283],[373,254],[254,339],[339,373],[282,334],[334,296],[296,282],[449,347],[347,346],[346,449],[264,447],[447,454],[454,264],[336,296],[296,299],[299,336],[338,10],[10,151],[151,338],[278,439],[439,455],[455,278],[292,407],[407,415],[415,292],[358,371],[371,355],[355,358],[340,345],[345,372],[372,340],[346,347],[347,280],[280,346],[442,443],[443,282],[282,442],[19,94],[94,370],[370,19],[441,442],[442,295],[295,441],[248,419],[419,197],[197,248],[263,255],[255,359],[359,263],[440,275],[275,274],[274,440],[300,383],[383,368],[368,300],[351,412],[412,465],[465,351],[263,467],[467,466],[466,263],[301,368],[368,389],[389,301],[395,378],[378,379],[379,395],[412,351],[351,419],[419,412],[436,426],[426,322],[322,436],[2,164],[164,393],[393,2],[370,462],[462,461],[461,370],[164,0],[0,267],[267,164],[302,11],[11,12],[12,302],[268,12],[12,13],[13,268],[293,300],[300,301],[301,293],[446,261],[261,340],[340,446],[330,266],[266,425],[425,330],[426,423],[423,391],[391,426],[429,355],[355,437],[437,429],[391,327],[327,326],[326,391],[440,457],[457,438],[438,440],[341,382],[382,362],[362,341],[459,457],[457,461],[461,459],[434,430],[430,394],[394,434],[414,463],[463,362],[362,414],[396,369],[369,262],[262,396],[354,461],[461,457],[457,354],[316,403],[403,402],[402,316],[315,404],[404,403],[403,315],[314,405],[405,404],[404,314],[313,406],[406,405],[405,313],[421,418],[418,406],[406,421],[366,401],[401,361],[361,366],[306,408],[408,407],[407,306],[291,409],[409,408],[408,291],[287,410],[410,409],[409,287],[432,436],[436,410],[410,432],[434,416],[416,411],[411,434],[264,368],[368,383],[383,264],[309,438],[438,457],[457,309],[352,376],[376,401],[401,352],[274,275],[275,4],[4,274],[421,428],[428,262],[262,421],[294,327],[327,358],[358,294],[433,416],[416,367],[367,433],[289,455],[455,439],[439,289],[462,370],[370,326],[326,462],[2,326],[326,370],[370,2],[305,460],[460,455],[455,305],[254,449],[449,448],[448,254],[255,261],[261,446],[446,255],[253,450],[450,449],[449,253],[252,451],[451,450],[450,252],[256,452],[452,451],[451,256],[341,453],[453,452],[452,341],[413,464],[464,463],[463,413],[441,413],[413,414],[414,441],[258,442],[442,441],[441,258],[257,443],[443,442],[442,257],[259,444],[444,443],[443,259],[260,445],[445,444],[444,260],[467,342],[342,445],[445,467],[459,458],[458,250],[250,459],[289,392],[392,290],[290,289],[290,328],[328,460],[460,290],[376,433],[433,435],[435,376],[250,290],[290,392],[392,250],[411,416],[416,433],[433,411],[341,463],[463,464],[464,341],[453,464],[464,465],[465,453],[357,465],[465,412],[412,357],[343,412],[412,399],[399,343],[360,363],[363,440],[440,360],[437,399],[399,456],[456,437],[420,456],[456,363],[363,420],[401,435],[435,288],[288,401],[372,383],[383,353],[353,372],[339,255],[255,249],[249,339],[448,261],[261,255],[255,448],[133,243],[243,190],[190,133],[133,155],[155,112],[112,133],[33,246],[246,247],[247,33],[33,130],[130,25],[25,33],[398,384],[384,286],[286,398],[362,398],[398,414],[414,362],[362,463],[463,341],[341,362],[263,359],[359,467],[467,263],[263,249],[249,255],[255,263],[466,467],[467,260],[260,466],[75,60],[60,166],[166,75],[238,239],[239,79],[79,238],[162,127],[127,139],[139,162],[72,11],[11,37],[37,72],[121,232],[232,120],[120,121],[73,72],[72,39],[39,73],[114,128],[128,47],[47,114],[233,232],[232,128],[128,233],[103,104],[104,67],[67,103],[152,175],[175,148],[148,152],[119,118],[118,101],[101,119],[74,73],[73,40],[40,74],[107,9],[9,108],[108,107],[49,48],[48,131],[131,49],[32,194],[194,211],[211,32],[184,74],[74,185],[185,184],[191,80],[80,183],[183,191],[185,40],[40,186],[186,185],[119,230],[230,118],[118,119],[210,202],[202,214],[214,210],[84,83],[83,17],[17,84],[77,76],[76,146],[146,77],[161,160],[160,30],[30,161],[190,56],[56,173],[173,190],[182,106],[106,194],[194,182],[138,135],[135,192],[192,138],[129,203],[203,98],[98,129],[54,21],[21,68],[68,54],[5,51],[51,4],[4,5],[145,144],[144,23],[23,145],[90,77],[77,91],[91,90],[207,205],[205,187],[187,207],[83,201],[201,18],[18,83],[181,91],[91,182],[182,181],[180,90],[90,181],[181,180],[16,85],[85,17],[17,16],[205,206],[206,36],[36,205],[176,148],[148,140],[140,176],[165,92],[92,39],[39,165],[245,193],[193,244],[244,245],[27,159],[159,28],[28,27],[30,247],[247,161],[161,30],[174,236],[236,196],[196,174],[103,54],[54,104],[104,103],[55,193],[193,8],[8,55],[111,117],[117,31],[31,111],[221,189],[189,55],[55,221],[240,98],[98,99],[99,240],[142,126],[126,100],[100,142],[219,166],[166,218],[218,219],[112,155],[155,26],[26,112],[198,209],[209,131],[131,198],[169,135],[135,150],[150,169],[114,47],[47,217],[217,114],[224,223],[223,53],[53,224],[220,45],[45,134],[134,220],[32,211],[211,140],[140,32],[109,67],[67,108],[108,109],[146,43],[43,91],[91,146],[231,230],[230,120],[120,231],[113,226],[226,247],[247,113],[105,63],[63,52],[52,105],[241,238],[238,242],[242,241],[124,46],[46,156],[156,124],[95,78],[78,96],[96,95],[70,46],[46,63],[63,70],[116,143],[143,227],[227,116],[116,123],[123,111],[111,116],[1,44],[44,19],[19,1],[3,236],[236,51],[51,3],[207,216],[216,205],[205,207],[26,154],[154,22],[22,26],[165,39],[39,167],[167,165],[199,200],[200,208],[208,199],[101,36],[36,100],[100,101],[43,57],[57,202],[202,43],[242,20],[20,99],[99,242],[56,28],[28,157],[157,56],[124,35],[35,113],[113,124],[29,160],[160,27],[27,29],[211,204],[204,210],[210,211],[124,113],[113,46],[46,124],[106,43],[43,204],[204,106],[96,62],[62,77],[77,96],[227,137],[137,116],[116,227],[73,41],[41,72],[72,73],[36,203],[203,142],[142,36],[235,64],[64,240],[240,235],[48,49],[49,64],[64,48],[42,41],[41,74],[74,42],[214,212],[212,207],[207,214],[183,42],[42,184],[184,183],[210,169],[169,211],[211,210],[140,170],[170,176],[176,140],[104,105],[105,69],[69,104],[193,122],[122,168],[168,193],[50,123],[123,187],[187,50],[89,96],[96,90],[90,89],[66,65],[65,107],[107,66],[179,89],[89,180],[180,179],[119,101],[101,120],[120,119],[68,63],[63,104],[104,68],[234,93],[93,227],[227,234],[16,15],[15,85],[85,16],[209,129],[129,49],[49,209],[15,14],[14,86],[86,15],[107,55],[55,9],[9,107],[120,100],[100,121],[121,120],[153,145],[145,22],[22,153],[178,88],[88,179],[179,178],[197,6],[6,196],[196,197],[89,88],[88,96],[96,89],[135,138],[138,136],[136,135],[138,215],[215,172],[172,138],[218,115],[115,219],[219,218],[41,42],[42,81],[81,41],[5,195],[195,51],[51,5],[57,43],[43,61],[61,57],[208,171],[171,199],[199,208],[41,81],[81,38],[38,41],[224,53],[53,225],[225,224],[24,144],[144,110],[110,24],[105,52],[52,66],[66,105],[118,229],[229,117],[117,118],[227,34],[34,234],[234,227],[66,107],[107,69],[69,66],[10,109],[109,151],[151,10],[219,48],[48,235],[235,219],[183,62],[62,191],[191,183],[142,129],[129,126],[126,142],[116,111],[111,143],[143,116],[118,117],[117,50],[50,118],[223,222],[222,52],[52,223],[94,19],[19,141],[141,94],[222,221],[221,65],[65,222],[196,3],[3,197],[197,196],[45,220],[220,44],[44,45],[156,70],[70,139],[139,156],[188,122],[122,245],[245,188],[139,71],[71,162],[162,139],[149,170],[170,150],[150,149],[122,188],[188,196],[196,122],[206,216],[216,92],[92,206],[164,2],[2,167],[167,164],[242,141],[141,241],[241,242],[0,164],[164,37],[37,0],[11,72],[72,12],[12,11],[12,38],[38,13],[13,12],[70,63],[63,71],[71,70],[31,226],[226,111],[111,31],[36,101],[101,205],[205,36],[203,206],[206,165],[165,203],[126,209],[209,217],[217,126],[98,165],[165,97],[97,98],[237,220],[220,218],[218,237],[237,239],[239,241],[241,237],[210,214],[214,169],[169,210],[140,171],[171,32],[32,140],[241,125],[125,237],[237,241],[179,86],[86,178],[178,179],[180,85],[85,179],[179,180],[181,84],[84,180],[180,181],[182,83],[83,181],[181,182],[194,201],[201,182],[182,194],[177,137],[137,132],[132,177],[184,76],[76,183],[183,184],[185,61],[61,184],[184,185],[186,57],[57,185],[185,186],[216,212],[212,186],[186,216],[192,214],[214,187],[187,192],[139,34],[34,156],[156,139],[218,79],[79,237],[237,218],[147,123],[123,177],[177,147],[45,44],[44,4],[4,45],[208,201],[201,32],[32,208],[98,64],[64,129],[129,98],[192,213],[213,138],[138,192],[235,59],[59,219],[219,235],[141,242],[242,97],[97,141],[97,2],[2,141],[141,97],[240,75],[75,235],[235,240],[229,24],[24,228],[228,229],[31,25],[25,226],[226,31],[230,23],[23,229],[229,230],[231,22],[22,230],[230,231],[232,26],[26,231],[231,232],[233,112],[112,232],[232,233],[244,189],[189,243],[243,244],[189,221],[221,190],[190,189],[222,28],[28,221],[221,222],[223,27],[27,222],[222,223],[224,29],[29,223],[223,224],[225,30],[30,224],[224,225],[113,247],[247,225],[225,113],[99,60],[60,240],[240,99],[213,147],[147,215],[215,213],[60,20],[20,166],[166,60],[192,187],[187,213],[213,192],[243,112],[112,244],[244,243],[244,233],[233,245],[245,244],[245,128],[128,188],[188,245],[188,114],[114,174],[174,188],[134,131],[131,220],[220,134],[174,217],[217,236],[236,174],[236,198],[198,134],[134,236],[215,177],[177,58],[58,215],[156,143],[143,124],[124,156],[25,110],[110,7],[7,25],[31,228],[228,25],[25,31],[264,356],[356,368],[368,264],[0,11],[11,267],[267,0],[451,452],[452,349],[349,451],[267,302],[302,269],[269,267],[350,357],[357,277],[277,350],[350,452],[452,357],[357,350],[299,333],[333,297],[297,299],[396,175],[175,377],[377,396],[280,347],[347,330],[330,280],[269,303],[303,270],[270,269],[151,9],[9,337],[337,151],[344,278],[278,360],[360,344],[424,418],[418,431],[431,424],[270,304],[304,409],[409,270],[272,310],[310,407],[407,272],[322,270],[270,410],[410,322],[449,450],[450,347],[347,449],[432,422],[422,434],[434,432],[18,313],[313,17],[17,18],[291,306],[306,375],[375,291],[259,387],[387,260],[260,259],[424,335],[335,418],[418,424],[434,364],[364,416],[416,434],[391,423],[423,327],[327,391],[301,251],[251,298],[298,301],[275,281],[281,4],[4,275],[254,373],[373,253],[253,254],[375,307],[307,321],[321,375],[280,425],[425,411],[411,280],[200,421],[421,18],[18,200],[335,321],[321,406],[406,335],[321,320],[320,405],[405,321],[314,315],[315,17],[17,314],[423,426],[426,266],[266,423],[396,377],[377,369],[369,396],[270,322],[322,269],[269,270],[413,417],[417,464],[464,413],[385,386],[386,258],[258,385],[248,456],[456,419],[419,248],[298,284],[284,333],[333,298],[168,417],[417,8],[8,168],[448,346],[346,261],[261,448],[417,413],[413,285],[285,417],[326,327],[327,328],[328,326],[277,355],[355,329],[329,277],[309,392],[392,438],[438,309],[381,382],[382,256],[256,381],[279,429],[429,360],[360,279],[365,364],[364,379],[379,365],[355,277],[277,437],[437,355],[282,443],[443,283],[283,282],[281,275],[275,363],[363,281],[395,431],[431,369],[369,395],[299,297],[297,337],[337,299],[335,273],[273,321],[321,335],[348,450],[450,349],[349,348],[359,446],[446,467],[467,359],[283,293],[293,282],[282,283],[250,458],[458,462],[462,250],[300,276],[276,383],[383,300],[292,308],[308,325],[325,292],[283,276],[276,293],[293,283],[264,372],[372,447],[447,264],[346,352],[352,340],[340,346],[354,274],[274,19],[19,354],[363,456],[456,281],[281,363],[426,436],[436,425],[425,426],[380,381],[381,252],[252,380],[267,269],[269,393],[393,267],[421,200],[200,428],[428,421],[371,266],[266,329],[329,371],[432,287],[287,422],[422,432],[290,250],[250,328],[328,290],[385,258],[258,384],[384,385],[446,265],[265,342],[342,446],[386,387],[387,257],[257,386],[422,424],[424,430],[430,422],[445,342],[342,276],[276,445],[422,273],[273,424],[424,422],[306,292],[292,307],[307,306],[352,366],[366,345],[345,352],[268,271],[271,302],[302,268],[358,423],[423,371],[371,358],[327,294],[294,460],[460,327],[331,279],[279,294],[294,331],[303,271],[271,304],[304,303],[436,432],[432,427],[427,436],[304,272],[272,408],[408,304],[395,394],[394,431],[431,395],[378,395],[395,400],[400,378],[296,334],[334,299],[299,296],[6,351],[351,168],[168,6],[376,352],[352,411],[411,376],[307,325],[325,320],[320,307],[285,295],[295,336],[336,285],[320,319],[319,404],[404,320],[329,330],[330,349],[349,329],[334,293],[293,333],[333,334],[366,323],[323,447],[447,366],[316,15],[15,315],[315,316],[331,358],[358,279],[279,331],[317,14],[14,316],[316,317],[8,285],[285,9],[9,8],[277,329],[329,350],[350,277],[253,374],[374,252],[252,253],[319,318],[318,403],[403,319],[351,6],[6,419],[419,351],[324,318],[318,325],[325,324],[397,367],[367,365],[365,397],[288,435],[435,397],[397,288],[278,344],[344,439],[439,278],[310,272],[272,311],[311,310],[248,195],[195,281],[281,248],[375,273],[273,291],[291,375],[175,396],[396,199],[199,175],[312,311],[311,268],[268,312],[276,283],[283,445],[445,276],[390,373],[373,339],[339,390],[295,282],[282,296],[296,295],[448,449],[449,346],[346,448],[356,264],[264,454],[454,356],[337,336],[336,299],[299,337],[337,338],[338,151],[151,337],[294,278],[278,455],[455,294],[308,292],[292,415],[415,308],[429,358],[358,355],[355,429],[265,340],[340,372],[372,265],[352,346],[346,280],[280,352],[295,442],[442,282],[282,295],[354,19],[19,370],[370,354],[285,441],[441,295],[295,285],[195,248],[248,197],[197,195],[457,440],[440,274],[274,457],[301,300],[300,368],[368,301],[417,351],[351,465],[465,417],[251,301],[301,389],[389,251],[394,395],[395,379],[379,394],[399,412],[412,419],[419,399],[410,436],[436,322],[322,410],[326,2],[2,393],[393,326],[354,370],[370,461],[461,354],[393,164],[164,267],[267,393],[268,302],[302,12],[12,268],[312,268],[268,13],[13,312],[298,293],[293,301],[301,298],[265,446],[446,340],[340,265],[280,330],[330,425],[425,280],[322,426],[426,391],[391,322],[420,429],[429,437],[437,420],[393,391],[391,326],[326,393],[344,440],[440,438],[438,344],[458,459],[459,461],[461,458],[364,434],[434,394],[394,364],[428,396],[396,262],[262,428],[274,354],[354,457],[457,274],[317,316],[316,402],[402,317],[316,315],[315,403],[403,316],[315,314],[314,404],[404,315],[314,313],[313,405],[405,314],[313,421],[421,406],[406,313],[323,366],[366,361],[361,323],[292,306],[306,407],[407,292],[306,291],[291,408],[408,306],[291,287],[287,409],[409,291],[287,432],[432,410],[410,287],[427,434],[434,411],[411,427],[372,264],[264,383],[383,372],[459,309],[309,457],[457,459],[366,352],[352,401],[401,366],[1,274],[274,4],[4,1],[418,421],[421,262],[262,418],[331,294],[294,358],[358,331],[435,433],[433,367],[367,435],[392,289],[289,439],[439,392],[328,462],[462,326],[326,328],[94,2],[2,370],[370,94],[289,305],[305,455],[455,289],[339,254],[254,448],[448,339],[359,255],[255,446],[446,359],[254,253],[253,449],[449,254],[253,252],[252,450],[450,253],[252,256],[256,451],[451,252],[256,341],[341,452],[452,256],[414,413],[413,463],[463,414],[286,441],[441,414],[414,286],[286,258],[258,441],[441,286],[258,257],[257,442],[442,258],[257,259],[259,443],[443,257],[259,260],[260,444],[444,259],[260,467],[467,445],[445,260],[309,459],[459,250],[250,309],[305,289],[289,290],[290,305],[305,290],[290,460],[460,305],[401,376],[376,435],[435,401],[309,250],[250,392],[392,309],[376,411],[411,433],[433,376],[453,341],[341,464],[464,453],[357,453],[453,465],[465,357],[343,357],[357,412],[412,343],[437,343],[343,399],[399,437],[344,360],[360,440],[440,344],[420,437],[437,456],[456,420],[360,420],[420,363],[363,360],[361,401],[401,288],[288,361],[265,372],[372,353],[353,265],[390,339],[339,249],[249,390],[339,448],[448,255],[255,339]);function Vd(e){e.u={faceLandmarks:[],faceBlendshapes:[],facialTransformationMatrixes:[]}}var we=class extends _n{constructor(e,t){super(new Hn(e,t),"image_in","norm_rect",!1),this.u={faceLandmarks:[],faceBlendshapes:[],facialTransformationMatrixes:[]},this.outputFacialTransformationMatrixes=this.outputFaceBlendshapes=!1,bt(e=this.h=new h0,0,1,t=new Te),this.H=new l0,bt(this.h,0,3,this.H),this.j=new hc,bt(this.h,0,2,this.j),_i(this.j,4,1),_t(this.j,2,.5),_t(this.H,2,.5),_t(this.h,4,.5)}get baseOptions(){return Zt(this.h,Te,1)}set baseOptions(e){bt(this.h,0,1,e)}o(e){return"numFaces"in e&&_i(this.j,4,e.numFaces??1),"minFaceDetectionConfidence"in e&&_t(this.j,2,e.minFaceDetectionConfidence??.5),"minTrackingConfidence"in e&&_t(this.h,4,e.minTrackingConfidence??.5),"minFacePresenceConfidence"in e&&_t(this.H,2,e.minFacePresenceConfidence??.5),"outputFaceBlendshapes"in e&&(this.outputFaceBlendshapes=!!e.outputFaceBlendshapes),"outputFacialTransformationMatrixes"in e&&(this.outputFacialTransformationMatrixes=!!e.outputFacialTransformationMatrixes),this.l(e)}F(e,t){return Vd(this),Wn(this,e,t),this.u}G(e,t,n){return Vd(this),yi(this,e,n,t),this.u}m(){var e=new ln;ye(e,"image_in"),ye(e,"norm_rect"),te(e,"face_landmarks");const t=new Rn;ei(t,ZM,this.h);const n=new on;Cn(n,"mediapipe.tasks.vision.face_landmarker.FaceLandmarkerGraph"),pe(n,"IMAGE:image_in"),pe(n,"NORM_RECT:norm_rect"),Wt(n,"NORM_LANDMARKS:face_landmarks"),n.o(t),Pn(e,n),this.g.attachProtoVectorListener("face_landmarks",(i,r)=>{for(const s of i)i=Uo(s),this.u.faceLandmarks.push(uc(i));ft(this,r)}),this.g.attachEmptyPacketListener("face_landmarks",i=>{ft(this,i)}),this.outputFaceBlendshapes&&(te(e,"blendshapes"),Wt(n,"BLENDSHAPES:blendshapes"),this.g.attachProtoVectorListener("blendshapes",(i,r)=>{if(this.outputFaceBlendshapes)for(const s of i)i=cc(s),this.u.faceBlendshapes.push(Cu(i.g()??[]));ft(this,r)}),this.g.attachEmptyPacketListener("blendshapes",i=>{ft(this,i)})),this.outputFacialTransformationMatrixes&&(te(e,"face_geometry"),Wt(n,"FACE_GEOMETRY:face_geometry"),this.g.attachProtoVectorListener("face_geometry",(i,r)=>{if(this.outputFacialTransformationMatrixes)for(const s of i)(i=Zt($M(s),Qm,2))&&this.u.facialTransformationMatrixes.push({rows:ti(zn(i,1),0)??0,columns:ti(zn(i,2),0)??0,data:ls(i,3,dr).slice()??[]});ft(this,r)}),this.g.attachEmptyPacketListener("face_geometry",i=>{ft(this,i)})),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};we.prototype.detectForVideo=we.prototype.G,we.prototype.detect=we.prototype.F,we.prototype.setOptions=we.prototype.o,we.createFromModelPath=function(e,t){return Ht(we,e,{baseOptions:{modelAssetPath:t}})},we.createFromModelBuffer=function(e,t){return Ht(we,e,{baseOptions:{modelAssetBuffer:t}})},we.createFromOptions=function(e,t){return Ht(we,e,t)},we.FACE_LANDMARKS_LIPS=Nu,we.FACE_LANDMARKS_LEFT_EYE=Fu,we.FACE_LANDMARKS_LEFT_EYEBROW=Ou,we.FACE_LANDMARKS_LEFT_IRIS=B0,we.FACE_LANDMARKS_RIGHT_EYE=Bu,we.FACE_LANDMARKS_RIGHT_EYEBROW=ku,we.FACE_LANDMARKS_RIGHT_IRIS=k0,we.FACE_LANDMARKS_FACE_OVAL=zu,we.FACE_LANDMARKS_CONTOURS=z0,we.FACE_LANDMARKS_TESSELATION=V0;var ai=class extends _n{constructor(e,t){super(new Hn(e,t),"image_in","norm_rect",!0),bt(e=this.j=new f0,0,1,t=new Te)}get baseOptions(){return Zt(this.j,Te,1)}set baseOptions(e){bt(this.j,0,1,e)}o(e){return super.l(e)}Pa(e,t,n){const i=typeof t!="function"?t:{};if(this.h=typeof t=="function"?t:n,Wn(this,e,i??{}),!this.h)return this.u}m(){var e=new ln;ye(e,"image_in"),ye(e,"norm_rect"),te(e,"stylized_image");const t=new Rn;ei(t,JM,this.j);const n=new on;Cn(n,"mediapipe.tasks.vision.face_stylizer.FaceStylizerGraph"),pe(n,"IMAGE:image_in"),pe(n,"NORM_RECT:norm_rect"),Wt(n,"STYLIZED_IMAGE:stylized_image"),n.o(t),Pn(e,n),this.g.W("stylized_image",(i,r)=>{var s=!this.h,o=i.data,a=i.width;const c=a*(i=i.height);if(o instanceof Uint8Array)if(o.length===3*c){const l=new Uint8ClampedArray(4*c);for(let h=0;h<c;++h)l[4*h]=o[3*h],l[4*h+1]=o[3*h+1],l[4*h+2]=o[3*h+2],l[4*h+3]=255;o=new ImageData(l,a,i)}else{if(o.length!==4*c)throw Error("Unsupported channel count: "+o.length/c);o=new ImageData(new Uint8ClampedArray(o.buffer,o.byteOffset,o.length),a,i)}else if(!(o instanceof WebGLTexture))throw Error(`Unsupported format: ${o.constructor.name}`);a=new $e([o],!1,!1,this.g.i.canvas,this.M,a,i),this.u=s=s?a.clone():a,this.h&&this.h(s),ft(this,r)}),this.g.attachEmptyPacketListener("stylized_image",i=>{this.u=null,this.h&&this.h(null),ft(this,i)}),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};ai.prototype.stylize=ai.prototype.Pa,ai.prototype.setOptions=ai.prototype.o,ai.createFromModelPath=function(e,t){return Ht(ai,e,{baseOptions:{modelAssetPath:t}})},ai.createFromModelBuffer=function(e,t){return Ht(ai,e,{baseOptions:{modelAssetBuffer:t}})},ai.createFromOptions=function(e,t){return Ht(ai,e,t)};var Vu=ii([0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]);function Gd(e){e.gestures=[],e.landmarks=[],e.worldLandmarks=[],e.handedness=[]}function Hd(e){return e.gestures.length===0?{gestures:[],landmarks:[],worldLandmarks:[],handedness:[],handednesses:[]}:{gestures:e.gestures,landmarks:e.landmarks,worldLandmarks:e.worldLandmarks,handedness:e.handedness,handednesses:e.handedness}}function Wd(e,t=!0){const n=[];for(const r of e){var i=cc(r);e=[];for(const s of i.g())i=t&&zn(s,1)!=null?ti(zn(s,1),0):-1,e.push({score:Fe(s,2)??0,index:i,categoryName:gi(s,3)??"",displayName:gi(s,4)??""});n.push(e)}return n}var En=class extends _n{constructor(e,t){super(new Hn(e,t),"image_in","norm_rect",!1),this.gestures=[],this.landmarks=[],this.worldLandmarks=[],this.handedness=[],bt(e=this.v=new x0,0,1,t=new Te),this.A=new Tu,bt(this.v,0,2,this.A),this.u=new Su,bt(this.A,0,3,this.u),this.h=new g0,bt(this.A,0,2,this.h),this.j=new QM,bt(this.v,0,3,this.j),_t(this.h,2,.5),_t(this.A,4,.5),_t(this.u,2,.5)}get baseOptions(){return Zt(this.v,Te,1)}set baseOptions(e){bt(this.v,0,1,e)}o(e){var r,s,o,a;if(_i(this.h,3,e.numHands??1),"minHandDetectionConfidence"in e&&_t(this.h,2,e.minHandDetectionConfidence??.5),"minTrackingConfidence"in e&&_t(this.A,4,e.minTrackingConfidence??.5),"minHandPresenceConfidence"in e&&_t(this.u,2,e.minHandPresenceConfidence??.5),e.cannedGesturesClassifierOptions){var t=new os,n=t,i=Mh(e.cannedGesturesClassifierOptions,(r=Zt(this.j,os,3))==null?void 0:r.h());bt(n,0,2,i),bt(this.j,0,3,t)}else e.cannedGesturesClassifierOptions===void 0&&((s=Zt(this.j,os,3))==null||s.g());return e.customGesturesClassifierOptions?(bt(n=t=new os,0,2,i=Mh(e.customGesturesClassifierOptions,(o=Zt(this.j,os,4))==null?void 0:o.h())),bt(this.j,0,4,t)):e.customGesturesClassifierOptions===void 0&&((a=Zt(this.j,os,4))==null||a.g()),this.l(e)}Ka(e,t){return Gd(this),Wn(this,e,t),Hd(this)}La(e,t,n){return Gd(this),yi(this,e,n,t),Hd(this)}m(){var e=new ln;ye(e,"image_in"),ye(e,"norm_rect"),te(e,"hand_gestures"),te(e,"hand_landmarks"),te(e,"world_hand_landmarks"),te(e,"handedness");const t=new Rn;ei(t,ny,this.v);const n=new on;Cn(n,"mediapipe.tasks.vision.gesture_recognizer.GestureRecognizerGraph"),pe(n,"IMAGE:image_in"),pe(n,"NORM_RECT:norm_rect"),Wt(n,"HAND_GESTURES:hand_gestures"),Wt(n,"LANDMARKS:hand_landmarks"),Wt(n,"WORLD_LANDMARKS:world_hand_landmarks"),Wt(n,"HANDEDNESS:handedness"),n.o(t),Pn(e,n),this.g.attachProtoVectorListener("hand_landmarks",(i,r)=>{for(const s of i){i=Uo(s);const o=[];for(const a of Gi(i,Zm,1))o.push({x:Fe(a,1)??0,y:Fe(a,2)??0,z:Fe(a,3)??0,visibility:Fe(a,4)??0});this.landmarks.push(o)}ft(this,r)}),this.g.attachEmptyPacketListener("hand_landmarks",i=>{ft(this,i)}),this.g.attachProtoVectorListener("world_hand_landmarks",(i,r)=>{for(const s of i){i=ps(s);const o=[];for(const a of Gi(i,Km,1))o.push({x:Fe(a,1)??0,y:Fe(a,2)??0,z:Fe(a,3)??0,visibility:Fe(a,4)??0});this.worldLandmarks.push(o)}ft(this,r)}),this.g.attachEmptyPacketListener("world_hand_landmarks",i=>{ft(this,i)}),this.g.attachProtoVectorListener("hand_gestures",(i,r)=>{this.gestures.push(...Wd(i,!1)),ft(this,r)}),this.g.attachEmptyPacketListener("hand_gestures",i=>{ft(this,i)}),this.g.attachProtoVectorListener("handedness",(i,r)=>{this.handedness.push(...Wd(i)),ft(this,r)}),this.g.attachEmptyPacketListener("handedness",i=>{ft(this,i)}),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};function Xd(e){return{landmarks:e.landmarks,worldLandmarks:e.worldLandmarks,handednesses:e.handedness,handedness:e.handedness}}En.prototype.recognizeForVideo=En.prototype.La,En.prototype.recognize=En.prototype.Ka,En.prototype.setOptions=En.prototype.o,En.createFromModelPath=function(e,t){return Ht(En,e,{baseOptions:{modelAssetPath:t}})},En.createFromModelBuffer=function(e,t){return Ht(En,e,{baseOptions:{modelAssetBuffer:t}})},En.createFromOptions=function(e,t){return Ht(En,e,t)},En.HAND_CONNECTIONS=Vu;var dn=class extends _n{constructor(e,t){super(new Hn(e,t),"image_in","norm_rect",!1),this.landmarks=[],this.worldLandmarks=[],this.handedness=[],bt(e=this.j=new Tu,0,1,t=new Te),this.u=new Su,bt(this.j,0,3,this.u),this.h=new g0,bt(this.j,0,2,this.h),_i(this.h,3,1),_t(this.h,2,.5),_t(this.u,2,.5),_t(this.j,4,.5)}get baseOptions(){return Zt(this.j,Te,1)}set baseOptions(e){bt(this.j,0,1,e)}o(e){return"numHands"in e&&_i(this.h,3,e.numHands??1),"minHandDetectionConfidence"in e&&_t(this.h,2,e.minHandDetectionConfidence??.5),"minTrackingConfidence"in e&&_t(this.j,4,e.minTrackingConfidence??.5),"minHandPresenceConfidence"in e&&_t(this.u,2,e.minHandPresenceConfidence??.5),this.l(e)}F(e,t){return this.landmarks=[],this.worldLandmarks=[],this.handedness=[],Wn(this,e,t),Xd(this)}G(e,t,n){return this.landmarks=[],this.worldLandmarks=[],this.handedness=[],yi(this,e,n,t),Xd(this)}m(){var e=new ln;ye(e,"image_in"),ye(e,"norm_rect"),te(e,"hand_landmarks"),te(e,"world_hand_landmarks"),te(e,"handedness");const t=new Rn;ei(t,ey,this.j);const n=new on;Cn(n,"mediapipe.tasks.vision.hand_landmarker.HandLandmarkerGraph"),pe(n,"IMAGE:image_in"),pe(n,"NORM_RECT:norm_rect"),Wt(n,"LANDMARKS:hand_landmarks"),Wt(n,"WORLD_LANDMARKS:world_hand_landmarks"),Wt(n,"HANDEDNESS:handedness"),n.o(t),Pn(e,n),this.g.attachProtoVectorListener("hand_landmarks",(i,r)=>{for(const s of i)i=Uo(s),this.landmarks.push(uc(i));ft(this,r)}),this.g.attachEmptyPacketListener("hand_landmarks",i=>{ft(this,i)}),this.g.attachProtoVectorListener("world_hand_landmarks",(i,r)=>{for(const s of i)i=ps(s),this.worldLandmarks.push(uo(i));ft(this,r)}),this.g.attachEmptyPacketListener("world_hand_landmarks",i=>{ft(this,i)}),this.g.attachProtoVectorListener("handedness",(i,r)=>{var s=this.handedness,o=s.push;const a=[];for(const c of i){i=cc(c);const l=[];for(const h of i.g())l.push({score:Fe(h,2)??0,index:ti(zn(h,1),0)??-1,categoryName:gi(h,3)??"",displayName:gi(h,4)??""});a.push(l)}o.call(s,...a),ft(this,r)}),this.g.attachEmptyPacketListener("handedness",i=>{ft(this,i)}),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};dn.prototype.detectForVideo=dn.prototype.G,dn.prototype.detect=dn.prototype.F,dn.prototype.setOptions=dn.prototype.o,dn.createFromModelPath=function(e,t){return Ht(dn,e,{baseOptions:{modelAssetPath:t}})},dn.createFromModelBuffer=function(e,t){return Ht(dn,e,{baseOptions:{modelAssetBuffer:t}})},dn.createFromOptions=function(e,t){return Ht(dn,e,t)},dn.HAND_CONNECTIONS=Vu;var G0=ii([0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],[9,10],[11,12],[11,13],[13,15],[15,17],[15,19],[15,21],[17,19],[12,14],[14,16],[16,18],[16,20],[16,22],[18,20],[11,23],[12,24],[23,24],[23,25],[24,26],[25,27],[26,28],[27,29],[28,30],[29,31],[30,32],[27,31],[28,32]);function qd(e){e.h={faceLandmarks:[],faceBlendshapes:[],poseLandmarks:[],poseWorldLandmarks:[],poseSegmentationMasks:[],leftHandLandmarks:[],leftHandWorldLandmarks:[],rightHandLandmarks:[],rightHandWorldLandmarks:[]}}function Yd(e){try{if(!e.I)return e.h;e.I(e.h)}finally{dc(e)}}function fa(e,t){e=Uo(e),t.push(uc(e))}var Se=class extends _n{constructor(e,t){super(new Hn(e,t),"input_frames_image",null,!1),this.h={faceLandmarks:[],faceBlendshapes:[],poseLandmarks:[],poseWorldLandmarks:[],poseSegmentationMasks:[],leftHandLandmarks:[],leftHandWorldLandmarks:[],rightHandLandmarks:[],rightHandWorldLandmarks:[]},this.outputPoseSegmentationMasks=this.outputFaceBlendshapes=!1,bt(e=this.A=new S0,0,1,t=new Te),this.u=new Su,bt(this.A,0,2,this.u),this.aa=new iy,bt(this.A,0,3,this.aa),this.j=new hc,bt(this.A,0,4,this.j),this.H=new l0,bt(this.A,0,5,this.H),this.v=new M0,bt(this.A,0,6,this.v),this.D=new y0,bt(this.A,0,7,this.D),_t(this.j,2,.5),_t(this.j,3,.3),_t(this.H,2,.5),_t(this.v,2,.5),_t(this.v,3,.3),_t(this.D,2,.5),_t(this.u,2,.5)}get baseOptions(){return Zt(this.A,Te,1)}set baseOptions(e){bt(this.A,0,1,e)}o(e){return"minFaceDetectionConfidence"in e&&_t(this.j,2,e.minFaceDetectionConfidence??.5),"minFaceSuppressionThreshold"in e&&_t(this.j,3,e.minFaceSuppressionThreshold??.3),"minFacePresenceConfidence"in e&&_t(this.H,2,e.minFacePresenceConfidence??.5),"outputFaceBlendshapes"in e&&(this.outputFaceBlendshapes=!!e.outputFaceBlendshapes),"minPoseDetectionConfidence"in e&&_t(this.v,2,e.minPoseDetectionConfidence??.5),"minPoseSuppressionThreshold"in e&&_t(this.v,3,e.minPoseSuppressionThreshold??.3),"minPosePresenceConfidence"in e&&_t(this.D,2,e.minPosePresenceConfidence??.5),"outputPoseSegmentationMasks"in e&&(this.outputPoseSegmentationMasks=!!e.outputPoseSegmentationMasks),"minHandLandmarksConfidence"in e&&_t(this.u,2,e.minHandLandmarksConfidence??.5),this.l(e)}F(e,t,n){const i=typeof t!="function"?t:{};return this.I=typeof t=="function"?t:n,qd(this),Wn(this,e,i),Yd(this)}G(e,t,n,i){const r=typeof n!="function"?n:{};return this.I=typeof n=="function"?n:i,qd(this),yi(this,e,r,t),Yd(this)}m(){var e=new ln;ye(e,"input_frames_image"),te(e,"pose_landmarks"),te(e,"pose_world_landmarks"),te(e,"face_landmarks"),te(e,"left_hand_landmarks"),te(e,"left_hand_world_landmarks"),te(e,"right_hand_landmarks"),te(e,"right_hand_world_landmarks");const t=new Rn,n=new Ad;mh(n,1,Bs("type.googleapis.com/mediapipe.tasks.vision.holistic_landmarker.proto.HolisticLandmarkerGraphOptions"),""),function(r,s){if(s!=null)if(Array.isArray(s))de(r,2,ec(s,uu,void 0,void 0,!1));else{if(!(typeof s=="string"||s instanceof Fi||wo(s)))throw Error("invalid value in Any.value field: "+s+" expected a ByteString, a base64 encoded string, a Uint8Array or a jspb array");mh(r,2,su(s,!1,!1),zr())}}(n,this.A.g());const i=new on;Cn(i,"mediapipe.tasks.vision.holistic_landmarker.HolisticLandmarkerGraph"),Va(i,8,Ad,n),pe(i,"IMAGE:input_frames_image"),Wt(i,"POSE_LANDMARKS:pose_landmarks"),Wt(i,"POSE_WORLD_LANDMARKS:pose_world_landmarks"),Wt(i,"FACE_LANDMARKS:face_landmarks"),Wt(i,"LEFT_HAND_LANDMARKS:left_hand_landmarks"),Wt(i,"LEFT_HAND_WORLD_LANDMARKS:left_hand_world_landmarks"),Wt(i,"RIGHT_HAND_LANDMARKS:right_hand_landmarks"),Wt(i,"RIGHT_HAND_WORLD_LANDMARKS:right_hand_world_landmarks"),i.o(t),Pn(e,i),fc(this,e),this.g.attachProtoListener("pose_landmarks",(r,s)=>{fa(r,this.h.poseLandmarks),ft(this,s)}),this.g.attachEmptyPacketListener("pose_landmarks",r=>{ft(this,r)}),this.g.attachProtoListener("pose_world_landmarks",(r,s)=>{var o=this.h.poseWorldLandmarks;r=ps(r),o.push(uo(r)),ft(this,s)}),this.g.attachEmptyPacketListener("pose_world_landmarks",r=>{ft(this,r)}),this.outputPoseSegmentationMasks&&(Wt(i,"POSE_SEGMENTATION_MASK:pose_segmentation_mask"),As(this,"pose_segmentation_mask"),this.g.W("pose_segmentation_mask",(r,s)=>{this.h.poseSegmentationMasks=[Rs(this,r,!0,!this.I)],ft(this,s)}),this.g.attachEmptyPacketListener("pose_segmentation_mask",r=>{this.h.poseSegmentationMasks=[],ft(this,r)})),this.g.attachProtoListener("face_landmarks",(r,s)=>{fa(r,this.h.faceLandmarks),ft(this,s)}),this.g.attachEmptyPacketListener("face_landmarks",r=>{ft(this,r)}),this.outputFaceBlendshapes&&(te(e,"extra_blendshapes"),Wt(i,"FACE_BLENDSHAPES:extra_blendshapes"),this.g.attachProtoListener("extra_blendshapes",(r,s)=>{var o=this.h.faceBlendshapes;this.outputFaceBlendshapes&&(r=cc(r),o.push(Cu(r.g()??[]))),ft(this,s)}),this.g.attachEmptyPacketListener("extra_blendshapes",r=>{ft(this,r)})),this.g.attachProtoListener("left_hand_landmarks",(r,s)=>{fa(r,this.h.leftHandLandmarks),ft(this,s)}),this.g.attachEmptyPacketListener("left_hand_landmarks",r=>{ft(this,r)}),this.g.attachProtoListener("left_hand_world_landmarks",(r,s)=>{var o=this.h.leftHandWorldLandmarks;r=ps(r),o.push(uo(r)),ft(this,s)}),this.g.attachEmptyPacketListener("left_hand_world_landmarks",r=>{ft(this,r)}),this.g.attachProtoListener("right_hand_landmarks",(r,s)=>{fa(r,this.h.rightHandLandmarks),ft(this,s)}),this.g.attachEmptyPacketListener("right_hand_landmarks",r=>{ft(this,r)}),this.g.attachProtoListener("right_hand_world_landmarks",(r,s)=>{var o=this.h.rightHandWorldLandmarks;r=ps(r),o.push(uo(r)),ft(this,s)}),this.g.attachEmptyPacketListener("right_hand_world_landmarks",r=>{ft(this,r)}),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};Se.prototype.detectForVideo=Se.prototype.G,Se.prototype.detect=Se.prototype.F,Se.prototype.setOptions=Se.prototype.o,Se.createFromModelPath=function(e,t){return Ht(Se,e,{baseOptions:{modelAssetPath:t}})},Se.createFromModelBuffer=function(e,t){return Ht(Se,e,{baseOptions:{modelAssetBuffer:t}})},Se.createFromOptions=function(e,t){return Ht(Se,e,t)},Se.HAND_CONNECTIONS=Vu,Se.POSE_CONNECTIONS=G0,Se.FACE_LANDMARKS_LIPS=Nu,Se.FACE_LANDMARKS_LEFT_EYE=Fu,Se.FACE_LANDMARKS_LEFT_EYEBROW=Ou,Se.FACE_LANDMARKS_LEFT_IRIS=B0,Se.FACE_LANDMARKS_RIGHT_EYE=Bu,Se.FACE_LANDMARKS_RIGHT_EYEBROW=ku,Se.FACE_LANDMARKS_RIGHT_IRIS=k0,Se.FACE_LANDMARKS_FACE_OVAL=zu,Se.FACE_LANDMARKS_CONTOURS=z0,Se.FACE_LANDMARKS_TESSELATION=V0;var Nn=class extends _n{constructor(e,t){super(new Hn(e,t),"input_image","norm_rect",!0),this.j={classifications:[]},bt(e=this.h=new E0,0,1,t=new Te)}get baseOptions(){return Zt(this.h,Te,1)}set baseOptions(e){bt(this.h,0,1,e)}o(e){return bt(this.h,0,2,Mh(e,Zt(this.h,lc,2))),this.l(e)}ua(e,t){return this.j={classifications:[]},Wn(this,e,t),this.j}va(e,t,n){return this.j={classifications:[]},yi(this,e,n,t),this.j}m(){var e=new ln;ye(e,"input_image"),ye(e,"norm_rect"),te(e,"classifications");const t=new Rn;ei(t,sy,this.h);const n=new on;Cn(n,"mediapipe.tasks.vision.image_classifier.ImageClassifierGraph"),pe(n,"IMAGE:input_image"),pe(n,"NORM_RECT:norm_rect"),Wt(n,"CLASSIFICATIONS:classifications"),n.o(t),Pn(e,n),this.g.attachProtoListener("classifications",(i,r)=>{this.j=function(s){const o={classifications:Gi(s,VM,1).map(a=>{var c;return Cu(((c=Zt(a,xu,4))==null?void 0:c.g())??[],ti(zn(a,2),0),gi(a,3))})};return Oa(hr(s,2))!=null&&(o.timestampMs=ti(Oa(hr(s,2)),0)),o}(HM(i)),ft(this,r)}),this.g.attachEmptyPacketListener("classifications",i=>{ft(this,i)}),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};Nn.prototype.classifyForVideo=Nn.prototype.va,Nn.prototype.classify=Nn.prototype.ua,Nn.prototype.setOptions=Nn.prototype.o,Nn.createFromModelPath=function(e,t){return Ht(Nn,e,{baseOptions:{modelAssetPath:t}})},Nn.createFromModelBuffer=function(e,t){return Ht(Nn,e,{baseOptions:{modelAssetBuffer:t}})},Nn.createFromOptions=function(e,t){return Ht(Nn,e,t)};var Tn=class extends _n{constructor(e,t){super(new Hn(e,t),"image_in","norm_rect",!0),this.h=new T0,this.embeddings={embeddings:[]},bt(e=this.h,0,1,t=new Te)}get baseOptions(){return Zt(this.h,Te,1)}set baseOptions(e){bt(this.h,0,1,e)}o(e){var t=this.h,n=Zt(this.h,wd,2);return n=n?n.clone():new wd,e.l2Normalize!==void 0?vo(n,1,e.l2Normalize):"l2Normalize"in e&&de(n,1),e.quantize!==void 0?vo(n,2,e.quantize):"quantize"in e&&de(n,2),bt(t,0,2,n),this.l(e)}Ba(e,t){return Wn(this,e,t),this.embeddings}Ca(e,t,n){return yi(this,e,n,t),this.embeddings}m(){var e=new ln;ye(e,"image_in"),ye(e,"norm_rect"),te(e,"embeddings_out");const t=new Rn;ei(t,oy,this.h);const n=new on;Cn(n,"mediapipe.tasks.vision.image_embedder.ImageEmbedderGraph"),pe(n,"IMAGE:image_in"),pe(n,"NORM_RECT:norm_rect"),Wt(n,"EMBEDDINGS:embeddings_out"),n.o(t),Pn(e,n),this.g.attachProtoListener("embeddings_out",(i,r)=>{i=YM(i),this.embeddings=function(s){return{embeddings:Gi(s,XM,1).map(o=>{var c,l;const a={headIndex:ti(zn(o,3),0)??-1,headName:gi(o,4)??""};if(xm(o,vh,ol(o,1))!==void 0)o=ls(o=Zt(o,vh,ol(o,1)),1,dr),a.floatEmbedding=o.slice();else{const h=new Uint8Array(0);a.quantizedEmbedding=((l=(c=Zt(o,WM,ol(o,2)))==null?void 0:c.qa())==null?void 0:l.h())??h}return a}),timestampMs:ti(Oa(hr(s,2)),0)}}(i),ft(this,r)}),this.g.attachEmptyPacketListener("embeddings_out",i=>{ft(this,i)}),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};Tn.cosineSimilarity=function(e,t){if(e.floatEmbedding&&t.floatEmbedding)e=Pd(e.floatEmbedding,t.floatEmbedding);else{if(!e.quantizedEmbedding||!t.quantizedEmbedding)throw Error("Cannot compute cosine similarity between quantized and float embeddings.");e=Pd(Cd(e.quantizedEmbedding),Cd(t.quantizedEmbedding))}return e},Tn.prototype.embedForVideo=Tn.prototype.Ca,Tn.prototype.embed=Tn.prototype.Ba,Tn.prototype.setOptions=Tn.prototype.o,Tn.createFromModelPath=function(e,t){return Ht(Tn,e,{baseOptions:{modelAssetPath:t}})},Tn.createFromModelBuffer=function(e,t){return Ht(Tn,e,{baseOptions:{modelAssetBuffer:t}})},Tn.createFromOptions=function(e,t){return Ht(Tn,e,t)};var Eh=class{constructor(e,t,n){this.confidenceMasks=e,this.categoryMask=t,this.qualityScores=n}close(){var e,t;(e=this.confidenceMasks)==null||e.forEach(n=>{n.close()}),(t=this.categoryMask)==null||t.close()}};function jd(e){e.categoryMask=void 0,e.confidenceMasks=void 0,e.qualityScores=void 0}function Kd(e){try{const t=new Eh(e.confidenceMasks,e.categoryMask,e.qualityScores);if(!e.j)return t;e.j(t)}finally{dc(e)}}Eh.prototype.close=Eh.prototype.close;var fn=class extends _n{constructor(e,t){super(new Hn(e,t),"image_in","norm_rect",!1),this.u=[],this.outputCategoryMask=!1,this.outputConfidenceMasks=!0,this.h=new wu,this.v=new A0,bt(this.h,0,3,this.v),bt(e=this.h,0,1,t=new Te)}get baseOptions(){return Zt(this.h,Te,1)}set baseOptions(e){bt(this.h,0,1,e)}o(e){return e.displayNamesLocale!==void 0?de(this.h,2,Bs(e.displayNamesLocale)):"displayNamesLocale"in e&&de(this.h,2),"outputCategoryMask"in e&&(this.outputCategoryMask=e.outputCategoryMask??!1),"outputConfidenceMasks"in e&&(this.outputConfidenceMasks=e.outputConfidenceMasks??!0),super.l(e)}L(){(function(e){var n,i;const t=Gi(e.fa(),on,1).filter(r=>gi(r,1).includes("mediapipe.tasks.TensorsToSegmentationCalculator"));if(e.u=[],1<t.length)throw Error("The graph has more than one mediapipe.tasks.TensorsToSegmentationCalculator.");t.length===1&&(((i=(n=Zt(t[0],Rn,7))==null?void 0:n.l())==null?void 0:i.g())??new Map).forEach((r,s)=>{e.u[Number(s)]=gi(r,1)})})(this)}ga(e,t,n){const i=typeof t!="function"?t:{};return this.j=typeof t=="function"?t:n,jd(this),Wn(this,e,i),Kd(this)}Na(e,t,n,i){const r=typeof n!="function"?n:{};return this.j=typeof n=="function"?n:i,jd(this),yi(this,e,r,t),Kd(this)}Fa(){return this.u}m(){var e=new ln;ye(e,"image_in"),ye(e,"norm_rect");const t=new Rn;ei(t,w0,this.h);const n=new on;Cn(n,"mediapipe.tasks.vision.image_segmenter.ImageSegmenterGraph"),pe(n,"IMAGE:image_in"),pe(n,"NORM_RECT:norm_rect"),n.o(t),Pn(e,n),fc(this,e),this.outputConfidenceMasks&&(te(e,"confidence_masks"),Wt(n,"CONFIDENCE_MASKS:confidence_masks"),As(this,"confidence_masks"),this.g.da("confidence_masks",(i,r)=>{this.confidenceMasks=i.map(s=>Rs(this,s,!0,!this.j)),ft(this,r)}),this.g.attachEmptyPacketListener("confidence_masks",i=>{this.confidenceMasks=[],ft(this,i)})),this.outputCategoryMask&&(te(e,"category_mask"),Wt(n,"CATEGORY_MASK:category_mask"),As(this,"category_mask"),this.g.W("category_mask",(i,r)=>{this.categoryMask=Rs(this,i,!1,!this.j),ft(this,r)}),this.g.attachEmptyPacketListener("category_mask",i=>{this.categoryMask=void 0,ft(this,i)})),te(e,"quality_scores"),Wt(n,"QUALITY_SCORES:quality_scores"),this.g.attachFloatVectorListener("quality_scores",(i,r)=>{this.qualityScores=i,ft(this,r)}),this.g.attachEmptyPacketListener("quality_scores",i=>{this.categoryMask=void 0,ft(this,i)}),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};fn.prototype.getLabels=fn.prototype.Fa,fn.prototype.segmentForVideo=fn.prototype.Na,fn.prototype.segment=fn.prototype.ga,fn.prototype.setOptions=fn.prototype.o,fn.createFromModelPath=function(e,t){return Ht(fn,e,{baseOptions:{modelAssetPath:t}})},fn.createFromModelBuffer=function(e,t){return Ht(fn,e,{baseOptions:{modelAssetBuffer:t}})},fn.createFromOptions=function(e,t){return Ht(fn,e,t)};var Th=class{constructor(e,t,n){this.confidenceMasks=e,this.categoryMask=t,this.qualityScores=n}close(){var e,t;(e=this.confidenceMasks)==null||e.forEach(n=>{n.close()}),(t=this.categoryMask)==null||t.close()}};Th.prototype.close=Th.prototype.close;var py=class extends gt{constructor(e){super(e)}},Cs=[0,Ue,-2],my=[0,Oi,-3,Be],_c=[0,Oi,-3,Be,Oi,-1],H0=[0,_c],gy=[0,H0,Cs],_y=[0,_c,Cs],W0=[0,_c,Ue,-1],vy=[0,W0,Cs],xy=[0,Oi,-3,Be,Cs,-1],My=[0,Oi,-3,Be,vi],hl=class extends gt{constructor(e){super(e)}},$d=[0,Oi,-1,Be],X0=class extends gt{constructor(){super()}};X0.B=[1];var Zd=class extends gt{constructor(e){super(e)}},Ah=[1,2,3,4,5,6,7,8,9,10,14,15],yy=[0,Ah,he,_c,he,_y,he,H0,he,gy,he,$d,he,My,he,my,he,[0,ce,Oi,-2,Be,Ue,Be,-1,2,Oi,Cs],he,W0,he,vy,Oi,Cs,ce,he,xy,he,[0,Ge,$d]],Sy=[0,ce,Ue,-1,Be],bh=class extends gt{constructor(){super()}};bh.B=[1],bh.prototype.g=ac([0,Ge,yy,ce,Sy]);var ci=class extends _n{constructor(e,t){super(new Hn(e,t),"image_in","norm_rect_in",!1),this.outputCategoryMask=!1,this.outputConfidenceMasks=!0,this.h=new wu,this.v=new A0,bt(this.h,0,3,this.v),bt(e=this.h,0,1,t=new Te)}get baseOptions(){return Zt(this.h,Te,1)}set baseOptions(e){bt(this.h,0,1,e)}o(e){return"outputCategoryMask"in e&&(this.outputCategoryMask=e.outputCategoryMask??!1),"outputConfidenceMasks"in e&&(this.outputConfidenceMasks=e.outputConfidenceMasks??!0),super.l(e)}ga(e,t,n,i){const r=typeof n!="function"?n:{};this.j=typeof n=="function"?n:i,this.qualityScores=this.categoryMask=this.confidenceMasks=void 0,n=this.J+1,i=new bh;const s=new Zd;var o=new py;if(_i(o,1,255),bt(s,0,12,o),t.keypoint&&t.scribble)throw Error("Cannot provide both keypoint and scribble.");if(t.keypoint){var a=new hl;vo(a,3,!0),_t(a,1,t.keypoint.x),_t(a,2,t.keypoint.y),co(s,5,Ah,a)}else{if(!t.scribble)throw Error("Must provide either a keypoint or a scribble.");for(a of(o=new X0,t.scribble))vo(t=new hl,3,!0),_t(t,1,a.x),_t(t,2,a.y),Va(o,1,hl,t);co(s,15,Ah,o)}Va(i,1,Zd,s),this.g.addProtoToStream(i.g(),"drishti.RenderData","roi_in",n),Wn(this,e,r);t:{try{const l=new Th(this.confidenceMasks,this.categoryMask,this.qualityScores);if(!this.j){var c=l;break t}this.j(l)}finally{dc(this)}c=void 0}return c}m(){var e=new ln;ye(e,"image_in"),ye(e,"roi_in"),ye(e,"norm_rect_in");const t=new Rn;ei(t,w0,this.h);const n=new on;Cn(n,"mediapipe.tasks.vision.interactive_segmenter.InteractiveSegmenterGraph"),pe(n,"IMAGE:image_in"),pe(n,"ROI:roi_in"),pe(n,"NORM_RECT:norm_rect_in"),n.o(t),Pn(e,n),fc(this,e),this.outputConfidenceMasks&&(te(e,"confidence_masks"),Wt(n,"CONFIDENCE_MASKS:confidence_masks"),As(this,"confidence_masks"),this.g.da("confidence_masks",(i,r)=>{this.confidenceMasks=i.map(s=>Rs(this,s,!0,!this.j)),ft(this,r)}),this.g.attachEmptyPacketListener("confidence_masks",i=>{this.confidenceMasks=[],ft(this,i)})),this.outputCategoryMask&&(te(e,"category_mask"),Wt(n,"CATEGORY_MASK:category_mask"),As(this,"category_mask"),this.g.W("category_mask",(i,r)=>{this.categoryMask=Rs(this,i,!1,!this.j),ft(this,r)}),this.g.attachEmptyPacketListener("category_mask",i=>{this.categoryMask=void 0,ft(this,i)})),te(e,"quality_scores"),Wt(n,"QUALITY_SCORES:quality_scores"),this.g.attachFloatVectorListener("quality_scores",(i,r)=>{this.qualityScores=i,ft(this,r)}),this.g.attachEmptyPacketListener("quality_scores",i=>{this.categoryMask=void 0,ft(this,i)}),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};ci.prototype.segment=ci.prototype.ga,ci.prototype.setOptions=ci.prototype.o,ci.createFromModelPath=function(e,t){return Ht(ci,e,{baseOptions:{modelAssetPath:t}})},ci.createFromModelBuffer=function(e,t){return Ht(ci,e,{baseOptions:{modelAssetBuffer:t}})},ci.createFromOptions=function(e,t){return Ht(ci,e,t)};var Fn=class extends _n{constructor(e,t){super(new Hn(e,t),"input_frame_gpu","norm_rect",!1),this.j={detections:[]},bt(e=this.h=new Ru,0,1,t=new Te)}get baseOptions(){return Zt(this.h,Te,1)}set baseOptions(e){bt(this.h,0,1,e)}o(e){return e.displayNamesLocale!==void 0?de(this.h,2,Bs(e.displayNamesLocale)):"displayNamesLocale"in e&&de(this.h,2),e.maxResults!==void 0?_i(this.h,3,e.maxResults):"maxResults"in e&&de(this.h,3),e.scoreThreshold!==void 0?_t(this.h,4,e.scoreThreshold):"scoreThreshold"in e&&de(this.h,4),e.categoryAllowlist!==void 0?za(this.h,5,e.categoryAllowlist):"categoryAllowlist"in e&&de(this.h,5),e.categoryDenylist!==void 0?za(this.h,6,e.categoryDenylist):"categoryDenylist"in e&&de(this.h,6),this.l(e)}F(e,t){return this.j={detections:[]},Wn(this,e,t),this.j}G(e,t,n){return this.j={detections:[]},yi(this,e,n,t),this.j}m(){var e=new ln;ye(e,"input_frame_gpu"),ye(e,"norm_rect"),te(e,"detections");const t=new Rn;ei(t,cy,this.h);const n=new on;Cn(n,"mediapipe.tasks.vision.ObjectDetectorGraph"),pe(n,"IMAGE:input_frame_gpu"),pe(n,"NORM_RECT:norm_rect"),Wt(n,"DETECTIONS:detections"),n.o(t),Pn(e,n),this.g.attachProtoVectorListener("detections",(i,r)=>{for(const s of i)i=jm(s),this.j.detections.push(C0(i));ft(this,r)}),this.g.attachEmptyPacketListener("detections",i=>{ft(this,i)}),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};Fn.prototype.detectForVideo=Fn.prototype.G,Fn.prototype.detect=Fn.prototype.F,Fn.prototype.setOptions=Fn.prototype.o,Fn.createFromModelPath=async function(e,t){return Ht(Fn,e,{baseOptions:{modelAssetPath:t}})},Fn.createFromModelBuffer=function(e,t){return Ht(Fn,e,{baseOptions:{modelAssetBuffer:t}})},Fn.createFromOptions=function(e,t){return Ht(Fn,e,t)};var wh=class{constructor(e,t,n){this.landmarks=e,this.worldLandmarks=t,this.segmentationMasks=n}close(){var e;(e=this.segmentationMasks)==null||e.forEach(t=>{t.close()})}};function Jd(e){e.landmarks=[],e.worldLandmarks=[],e.segmentationMasks=void 0}function Qd(e){try{const t=new wh(e.landmarks,e.worldLandmarks,e.segmentationMasks);if(!e.j)return t;e.j(t)}finally{dc(e)}}wh.prototype.close=wh.prototype.close;var An=class extends _n{constructor(e,t){super(new Hn(e,t),"image_in","norm_rect",!1),this.landmarks=[],this.worldLandmarks=[],this.outputSegmentationMasks=!1,bt(e=this.h=new R0,0,1,t=new Te),this.D=new y0,bt(this.h,0,3,this.D),this.v=new M0,bt(this.h,0,2,this.v),_i(this.v,4,1),_t(this.v,2,.5),_t(this.D,2,.5),_t(this.h,4,.5)}get baseOptions(){return Zt(this.h,Te,1)}set baseOptions(e){bt(this.h,0,1,e)}o(e){return"numPoses"in e&&_i(this.v,4,e.numPoses??1),"minPoseDetectionConfidence"in e&&_t(this.v,2,e.minPoseDetectionConfidence??.5),"minTrackingConfidence"in e&&_t(this.h,4,e.minTrackingConfidence??.5),"minPosePresenceConfidence"in e&&_t(this.D,2,e.minPosePresenceConfidence??.5),"outputSegmentationMasks"in e&&(this.outputSegmentationMasks=e.outputSegmentationMasks??!1),this.l(e)}F(e,t,n){const i=typeof t!="function"?t:{};return this.j=typeof t=="function"?t:n,Jd(this),Wn(this,e,i),Qd(this)}G(e,t,n,i){const r=typeof n!="function"?n:{};return this.j=typeof n=="function"?n:i,Jd(this),yi(this,e,r,t),Qd(this)}m(){var e=new ln;ye(e,"image_in"),ye(e,"norm_rect"),te(e,"normalized_landmarks"),te(e,"world_landmarks"),te(e,"segmentation_masks");const t=new Rn;ei(t,ly,this.h);const n=new on;Cn(n,"mediapipe.tasks.vision.pose_landmarker.PoseLandmarkerGraph"),pe(n,"IMAGE:image_in"),pe(n,"NORM_RECT:norm_rect"),Wt(n,"NORM_LANDMARKS:normalized_landmarks"),Wt(n,"WORLD_LANDMARKS:world_landmarks"),n.o(t),Pn(e,n),fc(this,e),this.g.attachProtoVectorListener("normalized_landmarks",(i,r)=>{this.landmarks=[];for(const s of i)i=Uo(s),this.landmarks.push(uc(i));ft(this,r)}),this.g.attachEmptyPacketListener("normalized_landmarks",i=>{this.landmarks=[],ft(this,i)}),this.g.attachProtoVectorListener("world_landmarks",(i,r)=>{this.worldLandmarks=[];for(const s of i)i=ps(s),this.worldLandmarks.push(uo(i));ft(this,r)}),this.g.attachEmptyPacketListener("world_landmarks",i=>{this.worldLandmarks=[],ft(this,i)}),this.outputSegmentationMasks&&(Wt(n,"SEGMENTATION_MASK:segmentation_masks"),As(this,"segmentation_masks"),this.g.da("segmentation_masks",(i,r)=>{this.segmentationMasks=i.map(s=>Rs(this,s,!0,!this.j)),ft(this,r)}),this.g.attachEmptyPacketListener("segmentation_masks",i=>{this.segmentationMasks=[],ft(this,i)})),e=e.g(),this.setGraph(new Uint8Array(e),!0)}};An.prototype.detectForVideo=An.prototype.G,An.prototype.detect=An.prototype.F,An.prototype.setOptions=An.prototype.o,An.createFromModelPath=function(e,t){return Ht(An,e,{baseOptions:{modelAssetPath:t}})},An.createFromModelBuffer=function(e,t){return Ht(An,e,{baseOptions:{modelAssetBuffer:t}})},An.createFromOptions=function(e,t){return Ht(An,e,t)},An.POSE_CONNECTIONS=G0;const Ey="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",Ty="https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";async function tp(e){try{const t=await fetch(e,{method:"HEAD"}),n=t.headers.get("content-type")||"";return t.ok&&!n.includes("text/html")}catch{return!1}}class Ay{constructor(){this.landmarker=null,this.ready=!1,this.info=""}async init(){let t=null;const n=[];await tp("/holohand/wasm/vision_wasm_internal.js")&&n.push({url:"/holohand/wasm",tag:"LOCAL"}),n.push({url:Ey,tag:"CDN"});const i=[];await tp("/holohand/models/hand_landmarker.task")&&i.push({url:"/holohand/models/hand_landmarker.task",tag:"LOCAL"}),i.push({url:Ty,tag:"CDN"});for(const r of n){let s;try{s=await br.forVisionTasks(r.url)}catch(o){t=o;continue}for(const o of i)for(const a of["GPU","CPU"])try{this.landmarker=await dn.createFromOptions(s,{baseOptions:{modelAssetPath:o.url,delegate:a},runningMode:"VIDEO",numHands:2,minHandDetectionConfidence:.55,minHandPresenceConfidence:.5,minTrackingConfidence:.5}),this.ready=!0,this.info=`${a} / ${o.tag}`;return}catch(c){t=c}}throw t||new Error("HandLandmarker failed to initialise")}detect(t,n){if(!this.ready)return[];let i;try{i=this.landmarker.detectForVideo(t,n)}catch{return[]}return!i||!i.landmarks||!i.landmarks.length?[]:i.landmarks.map((r,s)=>{var o,a,c,l,h,u;return{landmarks:r,score:((c=(a=(o=i.handedness)==null?void 0:o[s])==null?void 0:a[0])==null?void 0:c.score)??.9,label:((u=(h=(l=i.handedness)==null?void 0:l[s])==null?void 0:h[0])==null?void 0:u.categoryName)||(s?"Left":"Right")}})}}const by=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]],wy=[[8,5],[12,9],[16,13],[20,17]];class Ry{constructor(){this.stable="NONE",this.cand="NONE",this.streak=0,this.pinching=!1,this.palm=null,this.tip=null,this.pp=null,this.lastRoll=null,this.rollSm=0,this.open=.5,this.missing=0,this.last=null}}const ul=(e,t,n)=>{if(!e)return{...t};const i=Math.hypot(t.x-e.x,t.y-e.y)/n,r=Ze(.18+i*.6,.18,.85);return{x:e.x+(t.x-e.x)*r,y:e.y+(t.y-e.y)*r}};class Cy{constructor(){this.states=new Map,this.lastT=0}reset(){this.states.clear()}update(t,n,i,r=16/9){const s=Ze(n-this.lastT,.001,.1);this.lastT=n;const o=t.map(l=>({h:l,label:l.label}));o.length===2&&o[0].label===o[1].label&&(o[1].label=o[0].label==="Left"?"Right":"Left");const a=new Set,c=[];for(const{h:l,label:h}of o){a.add(h);let u=this.states.get(h);u||(u=new Ry,this.states.set(h,u)),c.push(this._process(u,h,l,s,i,r))}for(const[l,h]of[...this.states])a.has(l)||(h.missing++,h.missing>6||!h.last?this.states.delete(l):c.push({...h.last,held:!0,rollDelta:0}));return c.sort((l,h)=>l.id<h.id?-1:1),{hands:c}}_process(t,n,i,r,s,o){t.missing=0;const a=i.landmarks,c=a.map(y=>({x:(1-y.x)*o,y:y.y})),l=(y,x)=>Math.hypot(c[y].x-c[x].x,c[y].y-c[x].y),h=Math.max(1e-4,l(0,9)),u=wy.map(([y,x])=>l(y,0)/Math.max(1e-4,l(x,0))),f=u.map(y=>y>1.5),p=u.map(y=>y<1.32),g=(u[0]+u[1]+u[2]+u[3])/4,v=Ze((g-1.05)/(1.8-1.05),0,1);t.open+=(v-t.open)*.45;const m=l(4,8)/h,d=l(8,0)/Math.max(1e-4,l(6,0))>.88;!t.pinching&&m<.32&&d?t.pinching=!0:t.pinching&&(m>.5||!d)&&(t.pinching=!1);let A="NONE";t.pinching?A="PINCH":f[0]&&f[1]&&f[2]&&f[3]?A="OPEN":f[0]&&f[1]&&p[2]&&p[3]?A="PEACE":f[0]&&p[1]&&p[2]&&p[3]?A="POINT":p[0]&&p[1]&&p[2]&&p[3]&&(A="FIST"),A===t.cand?t.streak++:(t.cand=A,t.streak=1);const T=A==="PINCH"?2:A==="PEACE"?8:3;t.streak>=T&&t.stable!==t.cand&&(t.stable=t.cand);const S=a.map(s),N=y=>({x:y.reduce((x,w)=>x+S[w].x,0)/y.length,y:y.reduce((x,w)=>x+S[w].y,0)/y.length});t.palm=ul(t.palm,N([0,5,9,13,17]),r),t.tip=ul(t.tip,S[8],r),t.pp=ul(t.pp,N([4,8]),r);const R=Math.atan2(c[9].x-c[0].x,-(c[9].y-c[0].y));let b=0;t.lastRoll!==null&&(b=a3(t.lastRoll,R)),t.lastRoll=R,t.rollSm=t.rollSm*.6+b*.4;const D=Math.abs(t.rollSm)<.004?0:t.rollSm;return t.last={id:n,held:!1,score:i.score,gesture:t.stable,lm:S,palm:{...t.palm},tip:{...t.tip},pinchPt:{...t.pp},openness:t.open,pinching:t.pinching,rollDelta:D},t.last}}const Jt=e=>document.getElementById(e),ui=Jt("video"),Rh=Jt("fx"),tt=Rh.getContext("2d"),fl=Jt("banner");let He=innerWidth,We=innerHeight,fo=1;function q0(){He=innerWidth,We=innerHeight,fo=Math.min(devicePixelRatio||1,2),Rh.width=He*fo,Rh.height=We*fo}q0();addEventListener("resize",q0);function Ha(e,t=!1){fl.textContent=e,fl.className=t?"info":"",fl.style.display=e?"block":"none"}let ep=0;function Py(e){const t=Jt("toast");t.textContent=e,t.classList.add("show"),clearTimeout(ep),ep=setTimeout(()=>t.classList.remove("show"),1600)}let ut;try{ut=new d3(Jt("scene"),mo)}catch(e){throw console.error(e),Ha("WebGL is not available. Use a current Chrome, Edge or Firefox with hardware acceleration on."),e}const Or={skeleton:!0,labels:!0,feed:!1},Y0=Jt("chips");for(const e of[...new Set(mo.map(t=>t.category))]){const t=document.createElement("div");t.className="grp";const n=document.createElement("span");n.className="gl",n.textContent=e,t.appendChild(n),mo.forEach((i,r)=>{if(i.category!==e)return;const s=document.createElement("button");s.textContent=i.name,s.dataset.i=r,s.onclick=()=>ut.setModel(r),t.appendChild(s)}),Y0.appendChild(t)}ut.onModel=(e,t,n)=>{Jt("m-name").textContent=t.name,Jt("m-sub").textContent=t.subtitle,Jt("m-cat").textContent=t.category,Jt("m-count").textContent=`${n.meta.length} parts`,Y0.querySelectorAll("button").forEach(i=>i.classList.toggle("active",+i.dataset.i===e)),xo(-1),Py(t.name)};ut.onModel(ut.index,mo[ut.index],ut.cache.get(ut.index));function xo(e){const t=e>=0?ut.parts[e]:null;Jt("pc-name").textContent=t?t.name:"No part selected",Jt("pc-desc").textContent=t?t.desc:"Point at a part, or click one, to read what it does.",Jt("pc-dot").style.background=t?t.color:"#555a70"}const Wa=Jt("r-explode"),dl=Jt("r-int");let Gu=!1;Wa.addEventListener("pointerdown",()=>Gu=!0);addEventListener("pointerup",()=>Gu=!1);Wa.addEventListener("input",()=>ut.explodeTarget=Wa.value/100);dl.addEventListener("input",()=>{ut.intensity=dl.value/100,Jt("v-int").textContent=dl.value+"%"});Jt("b-explode").onclick=()=>ut.explodeTarget=ut.explodeTarget>.5?0:1;Jt("b-spin").onclick=()=>{ut.autoSpin=!ut.autoSpin,Jt("b-spin").classList.toggle("on",ut.autoSpin)};Jt("b-reset").onclick=()=>{ut.resetView(),xo(-1)};Jt("b-next").onclick=()=>ut.next();function Hu(e,t,n){Jt(e).onclick=()=>{Or[t]=!Or[t],Jt(e).classList.toggle("on",Or[t]),n==null||n()}}Hu("t-feed","feed",()=>document.body.classList.toggle("feed",Or.feed&&Wu));Hu("t-skel","skeleton");Hu("t-labels","labels");Jt("t-full").onclick=()=>{var e,t;return document.fullscreenElement?document.exitFullscreen():(t=(e=document.documentElement).requestFullscreen)==null?void 0:t.call(e)};const Ch=new Ay,Ly=new Cy;let Wu=!1,np=-1,Xu={hands:[]};async function Dy(){var e;if(Jt("start").classList.add("gone"),so("Starting…","warn"),!((e=navigator.mediaDevices)!=null&&e.getUserMedia)||!window.isSecureContext){Ph("Camera needs http://localhost or https.");return}try{const t=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720},facingMode:"user"},audio:!1});ui.srcObject=t,await ui.play(),Wu=!0,Or.feed=!0,Jt("t-feed").classList.add("on"),document.body.classList.add("feed")}catch(t){console.warn(t),Ph(t&&t.name==="NotAllowedError"?"Camera permission denied. Allow it in the address bar and reload.":"No camera found.");return}so("Loading hand model…","warn");try{await Ch.init(),so("Hands on","ok"),Ha("")}catch(t){console.error(t),so("Mouse only","warn"),Ha("Hand model failed to load (needs internet once). Mouse controls still work.")}}function Ph(e){so("Mouse only","warn"),e&&Ha(e+" Mouse controls are on.",!0)}function so(e,t){const n=Jt("s-track");n.textContent=e,n.className=t||""}Jt("btn-cam").onclick=Dy;Jt("btn-mouse").onclick=()=>{Jt("start").classList.add("gone"),Ph("")};function Iy(e){const t=ui.videoWidth||1280,n=ui.videoHeight||720,i=Math.max(He/t,We/n),r=(He-t*i)/2,s=(We-n*i)/2;return{x:((1-e.x)*t*i+r)/He,y:(e.y*n*i+s)/We}}let Zs=null,er=null,pl={i:-1,t:0},da={i:-1,t:0},ip=0;const pa=new Map;let rp="";function Js(e){e!==rp&&(rp=e,document.querySelectorAll("#gest li").forEach(t=>t.classList.toggle("active",t.dataset.g===e)))}function ml(){er&&ut.releaseAll(),er=null}function Uy(e,t){const n=Xu.hands.filter(o=>!o.held);if(Jt("s-hands").textContent=String(n.length),n.length>=2){const o=n[0].palm,a=n[1].palm,c=Math.hypot((o.x-a.x)*He,(o.y-a.y)*We);Zs||(Zs={d0:Math.max(60,c),s0:ut.scaleTarget}),ut.scaleTarget=Ze(Zs.s0*c/Zs.d0,.5,2.6),ut.holdVel=!0,ut.idle=0,ml(),ut.setHover(-1),pa.clear(),Js("TWO");return}Zs=null;const i=n[0];if(!i){ml(),ut.holdVel=Ps,Ps||ut.setHover(-1),pa.clear(),Js("");return}ut.holdVel=!0,ut.idle=0;const r=i.gesture,s={x:i.palm.x*He,y:i.palm.y*We};if(r==="OPEN"||r==="FIST"||r==="NONE"){ut.explodeTarget=r==="FIST"?0:Ze((i.openness-.12)/.78,0,1);const o=pa.get(i.id);if(o){const a=s.x-o.x,c=s.y-o.y;Math.hypot(a,c)>1.5&&ut.rotateBy(a*.0048,c*.0032,t)}i.rollDelta&&ut.rollBy(i.rollDelta*.7),ut.setHover(-1),Js(r==="NONE"?"MOVE":r),r==="OPEN"&&o&&Math.hypot(s.x-o.x,s.y-o.y)>6&&Js("MOVE")}else{if(r==="POINT"){const o=ut.pick(i.tip.x*He,i.tip.y*We,95);ut.setHover(o),o>=0&&(pl={i:o,t:e},xo(o)),o>=0&&o===da.i?(da.t+=t,da.t>.7&&ut.sel!==o&&ut.setSel(o)):da={i:o,t:0}}else if(r==="PINCH"){const o={x:i.pinchPt.x*He,y:i.pinchPt.y*We};if(er)ut.dragPart(er.part,o.x-er.last.x,o.y-er.last.y),er.last=o;else{let a=ut.pick(o.x,o.y,170);a<0&&e-pl.t<.9&&(a=pl.i),a>=0&&(er={part:a,last:o},ut.setSel(a),ut.setHover(a),xo(a))}}else r==="PEACE"&&e>ip&&(ip=e+1.6,ut.next());Js(r)}r!=="PINCH"&&ml(),pa.set(i.id,s)}let Ps=!1,Lh=null,Ca=null;const j0=e=>e.target.closest&&e.target.closest("#panel,#chips,#toolbar,#start");addEventListener("pointerdown",e=>{e.button!==0||j0(e)||(Ps=!0,Lh=Ca={x:e.clientX,y:e.clientY})});addEventListener("pointermove",e=>{Ps&&(ut.holdVel=!0,ut.rotateBy((e.clientX-Ca.x)*.006,(e.clientY-Ca.y)*.004,1/60),Ca={x:e.clientX,y:e.clientY})});addEventListener("pointerup",e=>{if(Ps&&(Ps=!1,ut.holdVel=!1,Math.hypot(e.clientX-Lh.x,e.clientY-Lh.y)<5)){const t=ut.pick(e.clientX,e.clientY,80);ut.setSel(t===ut.sel?-1:t),xo(ut.sel)}});addEventListener("wheel",e=>{j0(e)||ut.zoomBy(Math.exp(-e.deltaY*.0012))},{passive:!0});addEventListener("keydown",e=>{e.target.tagName==="INPUT"&&e.key!=="ArrowLeft"&&e.key!=="ArrowRight"||(e.key===" "?(e.preventDefault(),ut.explodeTarget=ut.explodeTarget>.5?0:1):e.key==="ArrowRight"?ut.next(1):e.key==="ArrowLeft"?ut.next(-1):e.key.toLowerCase()==="r"?ut.resetView():e.key>="1"&&e.key<=String(mo.length)&&ut.setModel(+e.key-1))});const sp=new Map;function Ny(e){const t=e.lm.map(n=>({x:n.x*He,y:n.y*We}));tt.save(),tt.lineWidth=1.5,tt.strokeStyle="rgba(236, 232, 255, 0.78)",tt.shadowColor="rgba(176, 164, 255, 0.95)",tt.shadowBlur=8,tt.beginPath();for(const[n,i]of by)tt.moveTo(t[n].x,t[n].y),tt.lineTo(t[i].x,t[i].y);tt.stroke(),tt.fillStyle="#fff";for(const n of t)tt.beginPath(),tt.arc(n.x,n.y,2.4,0,Math.PI*2),tt.fill();tt.restore()}function Fy(e){const t=e.lm,n=e.palm.x*He,i=e.palm.y*We,r=e.gesture;if(tt.save(),tt.lineCap="round",tt.shadowColor="rgba(242, 201, 76, 0.9)",tt.shadowBlur=14,r==="POINT"){const s=e.tip.x*He,o=e.tip.y*We;tt.strokeStyle="#f2c94c",tt.lineWidth=2.5,tt.beginPath(),tt.arc(s,o,20,0,Math.PI*2),tt.stroke(),tt.fillStyle="#fff",tt.beginPath(),tt.arc(s,o,3,0,Math.PI*2),tt.fill()}else if(r==="PINCH"){const s=e.pinchPt.x*He,o=e.pinchPt.y*We;tt.strokeStyle="#f2c94c",tt.fillStyle="rgba(242, 201, 76, 0.35)",tt.lineWidth=3,tt.beginPath(),tt.arc(s,o,16,0,Math.PI*2),tt.fill(),tt.stroke()}else{const o=Math.hypot((t[0].x-t[12].x)*He,(t[0].y-t[12].y)*We)*.95+22,a=(sp.get(e.id)??o)*.85+o*.15;sp.set(e.id,a),tt.strokeStyle="rgba(242, 201, 76, 0.95)",tt.lineWidth=3,tt.beginPath(),tt.arc(n,i,a,0,Math.PI*2),tt.stroke();const c=Ze(ut.explode,0,1);c>.01&&(tt.shadowColor="rgba(255,255,255,0.9)",tt.strokeStyle="#fff",tt.lineWidth=4.5,tt.beginPath(),tt.arc(n,i,a,-Math.PI/2,-Math.PI/2+Math.PI*2*c),tt.stroke())}tt.restore()}function Oy(e,t){const n=e.palm.x*He,i=e.palm.y*We,r=t.palm.x*He,s=t.palm.y*We;tt.save(),tt.strokeStyle="rgba(242, 201, 76, 0.85)",tt.setLineDash([6,6]),tt.lineWidth=2,tt.shadowColor="rgba(242, 201, 76, 0.8)",tt.shadowBlur=10,tt.beginPath(),tt.moveTo(n,i),tt.lineTo(r,s),tt.stroke(),tt.setLineDash([]),tt.fillStyle="#fff",tt.font="600 13px ui-sans-serif, system-ui, sans-serif",tt.textAlign="center",tt.shadowBlur=6,tt.fillText(`zoom ${ut.scale.toFixed(2)}x`,(n+r)/2,(i+s)/2-12),tt.restore()}function By(){const e=Ze((ut.shownExplode-.1)/.3,0,1);if(e<=.01||ut.uniforms.uScatter.value>.3)return;const t=ut.labelPoints(),n=ut.centerScreen(),i=He>900?310:0,r=[],s=[];for(const u of t)(u.x<n.x?r:s).push(u);const o=Math.max(...t.map(u=>u.x),n.x),a=Math.min(...t.map(u=>u.x),n.x),c=Ze(o+80,i+360,He-170),l=Ze(a-80,i+20,He-400);tt.save(),tt.globalAlpha=e,tt.font='500 12px ui-sans-serif, system-ui, "Segoe UI", sans-serif',tt.textBaseline="middle";const h=(u,f,p)=>{u.sort((m,d)=>m.y-d.y);const g=u.map(m=>m.y);for(let m=1;m<g.length;m++)g[m]<g[m-1]+20&&(g[m]=g[m-1]+20);const v=g.length?g[g.length-1]-(We-90):0;if(v>0)for(let m=0;m<g.length;m++)g[m]-=v;u.forEach((m,d)=>{const A=m.i===ut.hover||m.i===ut.sel,T=Ze(g[d],24,We-24);tt.strokeStyle=A?m.color:"rgba(255,255,255,0.38)",tt.lineWidth=A?1.6:1,tt.beginPath(),tt.moveTo(m.x,m.y),tt.lineTo(f-p*16,T),tt.lineTo(f,T),tt.stroke(),tt.fillStyle=m.color,tt.beginPath(),tt.arc(m.x,m.y,A?4:2.4,0,Math.PI*2),tt.fill(),tt.fillStyle=A?"#fff":"rgba(255,255,255,0.82)",tt.font=`${A?600:500} ${A?13:12}px ui-sans-serif, system-ui, "Segoe UI", sans-serif`,tt.textAlign=p>0?"left":"right",tt.fillText(m.name,f+p*6,T)})};h(s,c,1),h(r,l,-1),tt.restore()}function ky(){tt.setTransform(fo,0,0,fo,0,0),tt.clearRect(0,0,He,We),Or.labels&&By();const e=Xu.hands.filter(t=>!t.held);if(Or.skeleton)for(const t of e)Ny(t);for(const t of e)Fy(t);e.length>=2&&Oy(e[0],e[1])}let op=performance.now()/1e3;function K0(e){const t=e/1e3,n=Math.min(.05,Math.max(.001,t-op));if(op=t,Wu&&Ch.ready&&ui.readyState>=2&&ui.currentTime!==np){np=ui.currentTime;const i=Ch.detect(ui,e);Xu=Ly.update(i,t,Iy,(ui.videoWidth||16)/(ui.videoHeight||9))}Uy(t,n),Gu||(Wa.value=Math.round(Ze(ut.explode,0,1)*100)),Jt("v-explode").textContent=Math.round(Ze(ut.explode,0,1)*100)+"%",Jt("b-explode").textContent=ut.explodeTarget>.5?"Assemble":"Explode",ut.update(n,t),ky(),requestAnimationFrame(K0)}requestAnimationFrame(K0);
