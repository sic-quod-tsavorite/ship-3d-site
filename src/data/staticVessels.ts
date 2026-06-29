import type { Vessel } from "@/interfaces/vesselInterfaces";

const basePath = import.meta.env.BASE_URL;

export const staticVessels: Vessel[] = [
  {
    _id: "fireboat",
    name: "Fireboat",
    description: `This is a demo vessel used to showcase the 3D viewer functionality. The model and description are placeholder content and do not represent a real product or service.

3D model: [Fireboat Alexander Grantham B406241670901063A0](https://skfb.ly/pvtAL) by patrick.young is licensed under [Creative Commons Attribution](http://creativecommons.org/licenses/by/4.0/).`,
    image: `${basePath}static-assets/images/fireboat.png`,
    object: `${basePath}static-assets/objects/fireboat.glb`,
    category: "Vessels",
  },
  {
    _id: "parrot-camo-drone",
    name: "Parrot Camo Drone",
    description: `This is a demo drone used to showcase the 3D viewer functionality. The model and description are placeholder content and do not represent a real product or service.

3D model: [Source: fab.com](https://www.fab.com/listings/ea7468b1-8b81-46b5-aceb-52291c8076b3)`,
    image: `${basePath}static-assets/images/parrot-camo-drone.png`,
    object: `${basePath}static-assets/objects/parrot-camo-drone.glb`,
    category: "Drones",
  },
  {
    _id: "surveillance-drone",
    name: "Surveillance Drone",
    description: `This is a demo drone used to showcase the 3D viewer functionality. The model and description are placeholder content and do not represent a real product or service.

3D model: [Source: fab.com](https://www.fab.com/listings/49446951-669b-470f-9ae9-dcaa1fae7ca4)`,
    image: `${basePath}static-assets/images/surveillance-drone.png`,
    object: `${basePath}static-assets/objects/surveillance-drone.glb`,
    category: "Drones",
  },
  {
    _id: "wind-turbine",
    name: "Wind Turbine",
    description: `This is a demo asset used to showcase the 3D viewer functionality. The model and description are placeholder content and do not represent a real product or service.

3D model: [Wind Turbine](https://skfb.ly/oGC8P) by Sket_h is licensed under [Creative Commons Attribution](http://creativecommons.org/licenses/by/4.0/).`,
    image: `${basePath}static-assets/images/wind-turbine.png`,
    object: `${basePath}static-assets/objects/wind-turbine.glb`,
    category: "Equipment",
  },
];
