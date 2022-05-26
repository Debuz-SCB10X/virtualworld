import { ExtendedObject3D, Scene3D, THREE } from "enable3d";

export class Map extends ExtendedObject3D
{
  public static async preload(scene: Scene3D)
  {
    const map = await scene.load.preload('map', './assets/model/map.glb');
    const water1 = await scene.load.preload('water-1', './assets/texture/water-normal-1.jpg');
    const water2 = await scene.load.preload('water-2', './assets/texture/water-normal-2.jpg');
    await Promise.all([map, water1, water2]);

  }

  public static async create(scene: Scene3D)
  {
    const object = await scene.load.gltf('map');
    return new Map(scene, object.scene);
  }

  private constructor(scene3D: Scene3D, group: THREE.Group)
  {
    super();
    this.add(group);
    scene3D.scene.add(this);

    this.traverse(child => {
      if (child.isMesh) {
        child.castShadow = child.receiveShadow = false
        //child.material.metalness = 0
        //child.material.roughness = 1

        scene3D.physics.add.existing(child, {
          shape: 'concave',
          mass: 0,
          collisionFlags: 1,
          autoCenter: false
        })
        child.body.setAngularFactor(0, 0, 0)
        child.body.setLinearFactor(0, 0, 0)
      }
    });

    this.createWater(scene3D);
  }

  private async createWater(scene3D: Scene3D)
  {
    const water1 = await scene3D.load.texture('water-1');
    const water2 = await scene3D.load.texture('water-2');
    water1.needsUpdate = true;
    water2.needsUpdate = true;
    scene3D.misc.water({
      y: 0,
      normalMap0: water1,
      normalMap1: water2,
      width: 1000,
      height: 1000,
    });
  }
}