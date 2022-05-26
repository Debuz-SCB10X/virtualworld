import { Scene3D, THREE, ExtendedObject3D } from "enable3d";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { InputController } from "./input-controller";

export class PlayerController
{
  private orbitControls: OrbitControls;
  private scene: Scene3D;
  private player: ExtendedObject3D;
  private input: InputController;

  constructor(scene: Scene3D, player: ExtendedObject3D)
  {
    this.scene = scene;
    this.player = player;
    this.orbitControls = new OrbitControls(scene.camera, scene.canvas);
    this.orbitControls.enableDamping = true
    this.orbitControls.minDistance = 2
    this.orbitControls.maxDistance = 8
    this.orbitControls.enablePan = false;
    this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
    this.orbitControls.minPolarAngle = Math.PI / 10;
    this.updateCamera();

    this.input = new InputController();
  }

  public update(_time: number, _delta: number): void
  {
    //turn
    const speed = 4;
    const v3 = new THREE.Vector3();
    const rotation = this.scene.camera.getWorldDirection(v3);
    const theta = Math.atan2(rotation.x, rotation.z);
    const rotationPlayer = this.player.getWorldDirection(v3);
    const thetaPlayer = Math.atan2(rotationPlayer.x, rotationPlayer.z);
    this.player.body.setAngularVelocityY(0);

    const l = Math.abs(theta - thetaPlayer);
    let rotationSpeed = 4;
    const d = Math.PI / 24;

    if (l > d)
    {
      if (l > Math.PI - d) rotationSpeed *= -1;
      if (theta < thetaPlayer) rotationSpeed *= -1;
      this.player.body.setAngularVelocityY(rotationSpeed);
    }

    //move
    const move = this.input.getMoveAxis();
    if (move.length() > 0)
    {
      const thetaControll = Math.atan2(move.x * -1, move.y);
      const moveSpeed = speed * move.length();
      const x = Math.sin(theta + thetaControll) * moveSpeed;
      const y = this.player.body.velocity.y;
      const z = Math.cos(theta + thetaControll) * moveSpeed;
      this.player.body.setVelocity(x, y, z);

      if (move.length() > 0.5)
      {
        if (this.player.anims.current !== 'run') this.player.anims.play('run', 1, true);
      }
      else
      {
        if (this.player.anims.current !== 'walk') this.player.anims.play('walk', 1, true);
      }
    }
    else
    {
      if (this.player.anims.current !== 'idle') this.player.anims.play('idle', 1, true);
    }

    this.updateCamera();
  }

  private updateCamera()
  {
    this.orbitControls.target.set(this.player.position.x, this.player.position.y + 1, this.player.position.z);
    this.orbitControls.update();
  }
}