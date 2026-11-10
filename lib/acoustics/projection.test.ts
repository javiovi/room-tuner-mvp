import {describe,expect,it} from "vitest"
import {wallProjection} from "./projection"
describe("confirmed wall/photo projection",()=>{
 it("maps all four known corners and the center of a rectangular photo area",()=>{
  const corners=[{x:.1,y:.2},{x:.9,y:.2},{x:.9,y:.8},{x:.1,y:.8}]
  const project=wallProjection(corners)!
  expect(project).not.toBeNull()
  ;[[0,0],[1,0],[1,1],[0,1]].forEach(([u,v],i)=>{expect(project(u,v)!.x).toBeCloseTo(corners[i].x);expect(project(u,v)!.y).toBeCloseTo(corners[i].y)})
  expect(project(.5,.5)!.x).toBeCloseTo(.5)
  expect(project(.5,.5)!.y).toBeCloseTo(.5)
 })
 it("handles perspective, maps a wall point continuously, and supports a mirrored camera view",()=>{
  const project=wallProjection([{x:.1,y:.1},{x:.8,y:.3},{x:.9,y:.9},{x:.2,y:.8}])!
  expect(project(1,1)!.x).toBeCloseTo(.9)
  expect(project(.4,.5)!.x).toBeLessThan(project(.6,.5)!.x)
  const reversed=wallProjection([{x:.9,y:.1},{x:.1,y:.1},{x:.1,y:.9},{x:.9,y:.9}])!
  expect(reversed(.25,.5)!.x).toBeCloseTo(.7)
 })
 it("rejects incomplete, crossed, tiny and degenerate wall outlines",()=>{
  expect(wallProjection([])).toBeNull()
  expect(wallProjection([{x:0,y:0},{x:1,y:1},{x:1,y:0},{x:0,y:1}])).toBeNull()
  expect(wallProjection([{x:0,y:0},{x:.01,y:0},{x:.01,y:.01},{x:0,y:.01}])).toBeNull()
  expect(wallProjection([{x:0,y:0},{x:1,y:0},{x:1,y:0},{x:0,y:0}])).toBeNull()
 })
})
