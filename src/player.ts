import { FLAT, ExtendedObject3D, Scene3D, THREE } from "enable3d";

export interface CreateOption
{
  position?: THREE.Vector3;
  rotation?: THREE.Vector3;
  my?: boolean;
}

export class Player extends ExtendedObject3D
{
  public static async preload(scene: Scene3D)
  {
    const female = await scene.load.preload('female', './assets/model/female_01.glb');
    const idle = await scene.load.preload('player-idle', './assets/animation/player/idle.glb');
    const walk = await scene.load.preload('player-walk', './assets/animation/player/walk.glb');
    const run = await scene.load.preload('player-run', './assets/animation/player/run.glb');
    return await Promise.all([female, idle, walk, run]);
  }

  public static async create(scene: Scene3D, option?: CreateOption)
  {
    const object = await scene.load.gltf('female');
    const player = new Player(scene, object.scene, option);
    player.setup(scene);
    return player;
  }

  private charChatObj?: FLAT.TextSprite;
  private charNameObj?: FLAT.TextSprite;

  private constructor(scene3D: Scene3D, group: THREE.Group, option?: CreateOption)
  {
    super();
    this.add(group);
    scene3D.scene.add(this);
    if (option !== undefined)
    {
      if (option.position !== undefined) this.position.set(option.position.x, option.position.y, option.position.z);
      if (option.rotation !== undefined) this.rotation.set(option.rotation.x, option.rotation.y, option.rotation.z);
    }
    if (option?.my)
    {
      scene3D.physics.add.existing(this, { shape: 'capsule', offset: { y: -0.5 }, height: 0.5, radius: 0.2 });
      this.body.setFriction(0.8);
      this.body.setAngularFactor(0, 0, 0);
      this.body.setCcdMotionThreshold(1e-7);
      this.body.setCcdSweptSphereRadius(-0.25);
    }
    //this.body.setCollisionFlags(1);
  }

  private async setup(scene: Scene3D)
  {
    const idle = await scene.load.gltf('player-idle');
    const walk = await scene.load.gltf('player-walk');
    const run = await scene.load.gltf('player-run');
    this.anims.add('idle', idle.animations[0]);
    this.anims.add('walk', walk.animations[0]);
    this.anims.add('run', run.animations[0]);
    scene.animationMixers.add(this.animationMixer);
    this.anims.play('idle');
  }

  public async charChat(message: string)
  {
    if (this.charChatObj) this.charChatObj.removeFromParent();

    const texture = new FLAT.TextTexture(message);
    this.charChatObj = new FLAT.TextSprite(texture);
    this.charChatObj.setScale(0.002)
    this.charChatObj.position.set(0, 1.90, 0);
    this.charChatObj.setStyles({ background: '#00000044', fillStyle: "#FFFFFF" });
    this.add(this.charChatObj);
    return this.charChatObj;
  }

  public async charName(name: string)
  {
    if (this.charNameObj === undefined)
    {
      const texture = new FLAT.TextTexture(name);
      this.charNameObj = new FLAT.TextSprite(texture);
      this.charNameObj.setScale(0.004)
      this.charNameObj.position.set(0, 1.7, 0);
      this.add(this.charNameObj);
    }
    return this.charNameObj;
  }
}