export type ImagePoint = { x: number; y: number }
export type Corners = [ImagePoint,ImagePoint,ImagePoint,ImagePoint]
/** Project wall coordinates onto four user-confirmed image corners (A top, B top, B bottom, A bottom). */
export function wallProjection(corners: ImagePoint[]) {
  if (corners.length!==4 || corners.some(p=>![p.x,p.y].every(n=>Number.isFinite(n)&&n>=0&&n<=1))) return null
  const cross=corners.map((a,i)=>{const b=corners[(i+1)%4],c=corners[(i+2)%4];return (b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x)})
  if (cross.some(n=>Math.abs(n)<.001) || !(cross.every(n=>n>0)||cross.every(n=>n<0))) return null
  const area=Math.abs(corners.reduce((sum,p,i)=>sum+p.x*corners[(i+1)%4].y-p.y*corners[(i+1)%4].x,0))/2
  if (area<.02) return null
  const square=[[0,0],[1,0],[1,1],[0,1]]
  const a:number[][]=[]
  square.forEach(([u,v],i)=>{const {x,y}=corners[i];a.push([u,v,1,0,0,0,-u*x,-v*x,x],[0,0,0,u,v,1,-u*y,-v*y,y])})
  for(let col=0;col<8;col++) {
    let pivot=col
    for(let row=col+1;row<8;row++) if(Math.abs(a[row][col])>Math.abs(a[pivot][col])) pivot=row
    if(Math.abs(a[pivot][col])<1e-10) return null
    ;[a[col],a[pivot]]=[a[pivot],a[col]]
    const divisor=a[col][col];for(let j=col;j<9;j++) a[col][j]/=divisor
    for(let row=0;row<8;row++) if(row!==col) {const factor=a[row][col];for(let j=col;j<9;j++) a[row][j]-=factor*a[col][j]}
  }
  const h=a.map(row=>row[8])
  return (u:number,v:number):ImagePoint|null=>{
    if (![u,v].every(Number.isFinite)) return null
    const d=h[6]*u+h[7]*v+1
    if(Math.abs(d)<1e-9) return null
    const p={x:(h[0]*u+h[1]*v+h[2])/d,y:(h[3]*u+h[4]*v+h[5])/d}
    return Number.isFinite(p.x)&&Number.isFinite(p.y) ? p : null
  }
}
