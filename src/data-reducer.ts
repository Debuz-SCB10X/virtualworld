import { sendAnimation, sendPosition, sendRotation } from "./net/packet";
import { Remote } from "./net/remote";

export class DataReducer
{
  private positionSaver?: SaveValue;
  private rotationSaver?: SaveValue;
  private animationSaver?: string;

  public constructor()
  {
    //
  }

  public async sendPosition(remote: Remote|undefined, px: number, py: number, pz: number)
  {
    if (this.positionSaver === undefined || (this.positionSaver.x !== px || this.positionSaver.y !== py || this.positionSaver.z !== pz))
    {
      this.positionSaver = { x: px, y: py, z: pz };

      sendPosition(remote, px, py, pz);
    }
  }

  public async sendRotation(remote: Remote|undefined, rx: number, ry: number, rz: number)
  {
    if (this.rotationSaver === undefined || (this.rotationSaver.x !== rx || this.rotationSaver.y !== ry || this.rotationSaver.z !== rz))
    {
      this.positionSaver = { x: rx, y: ry, z: rz };

      sendRotation(remote, rx, ry, rz);
    }
  }

  public async sendAnimation(remote: Remote|undefined, name: string)
  {
    if (this.animationSaver !== name)
    {
      this.animationSaver = name;

      sendAnimation(remote, name);
    }
  }
}

interface SaveValue
{
  x: number;
  y: number;
  z: number;
}