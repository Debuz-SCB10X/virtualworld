/* eslint-disable @typescript-eslint/no-explicit-any */
import { THREE } from "enable3d";

const RUN = [ 'ShiftLeft', 'ShiftRight' ];
const W = 'KeyW';
const A = 'KeyA';
const S = 'KeyS';
const D = 'KeyD';
const DIRECTIONS = [ W, A, S, D];

export class InputController
{
  private moveAxis: THREE.Vector2 = new THREE.Vector2();
  private keysPressed = { };
  constructor()
  {
    const keyHandle = (e: KeyboardEvent, isDown: boolean) => {
      (this.keysPressed as any)[e.code] = isDown;
    }
    document.addEventListener('keydown', (e)=>keyHandle(e, true) );
    document.addEventListener('keyup', (e)=>keyHandle(e, false) );
  }

  public getMoveAxis()
  {
    const directionPressed = DIRECTIONS.some(key => (this.keysPressed as any)[key]  == true)
    if (directionPressed)
    {
      return this.direction(this.keysPressed);
    }
    return this.moveAxis;
  }

  private runFilter(value: number)
  {
    const run = RUN.some(key => (this.keysPressed as any)[key]  == true)
    return run ? value : value / 2;
  }

  private direction(keysPressed: any)
  {
    let direction = new THREE.Vector2(0, this.runFilter(1)); // w
    if (keysPressed[W])
    {
      if (keysPressed[A])
      {
        direction = new THREE.Vector2(this.runFilter(-Math.sin(45)), this.runFilter(Math.cos(45))); // w+a
      }
      else if (keysPressed[D])
      {
        direction = new THREE.Vector2(this.runFilter(Math.sin(45)), this.runFilter(Math.cos(45))); // w+d
      }
    }
    else if (keysPressed[S])
    {
      if (keysPressed[A])
      {
        direction = new THREE.Vector2(this.runFilter(-Math.sin(45)), this.runFilter(-Math.cos(45))); // s+a
      }
      else if (keysPressed[D])
      {
        direction = new THREE.Vector2(this.runFilter(Math.sin(45)), this.runFilter(-Math.cos(45))); // s+d
      }
      else
      {
        direction = new THREE.Vector2(0, this.runFilter(-1)); // s
      }
    }
    else if (keysPressed[A])
    {
      direction = new THREE.Vector2(this.runFilter(-1), 0); // a
    }
    else if (keysPressed[D])
    {
      direction = new THREE.Vector2(this.runFilter(1), 0); // d
    }
    return direction
  }
}