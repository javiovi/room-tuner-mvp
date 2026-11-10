import type {RoomProject} from "@/app/types/room"
import {absorptionCoefficients,calculateTotalAbsorption,estimateRT60SmartByBand} from "@/lib/acousticsCalculations"
export type SoftMaterial="none"|"rug"|"curtain"
/** Replace an existing surface patch; never add a second full room or assume measured product performance. */
export function reverbTrial(project:RoomProject,material:SoftMaterial,requestedArea:number) {
 const {widthM:w,lengthM:l,heightM:h,floorType,wallType}=project
 if(project.dimensionSource==="approximate"||!w||!l||!h||![w,l,h].every(n=>Number.isFinite(n)&&n>0)||!floorType||!wallType||!Number.isFinite(requestedArea))return null
 const floor=w*l,walls=2*(w*h+l*h),surface=2*floor+walls,volume=floor*h
 const absorption=calculateTotalAbsorption(project)
 const baseline=estimateRT60SmartByBand(volume,absorption,surface)
 const area=material==="none"?0:Math.min(Math.max(0,requestedArea),material==="rug"?floor:walls)
 const old=material==="rug"?absorptionCoefficients.floor[floorType]:absorptionCoefficients.wall[wallType]
 const added=material==="rug"?absorptionCoefficients.floor.alfombra:absorptionCoefficients.wall.cortinas
 const trial={low:absorption.low+area*Math.max(0,added.low-old.low),mid:absorption.mid+area*Math.max(0,added.mid-old.mid),high:absorption.high+area*Math.max(0,added.high-old.high)}
 return {baseline,trial:estimateRT60SmartByBand(volume,trial,surface),area,maxArea:material==="rug"?floor:walls}
}
