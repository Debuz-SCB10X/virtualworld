import { FLAT, Scene3D } from "enable3d";
import { Map } from "./map";
import { Player } from "./player";
import { PlayerController } from "./player-controller";
import { SAVE_POINT } from "./client";
import Stats from 'three/examples/jsm/libs/stats.module';

export class StartScene extends Scene3D
{
  private static instance?: StartScene;

  private stats?: Stats;
  private player?: Player;
  private playerController?: PlayerController;
  private ui?: FLAT.FlatArea;
  
  public static getInstance() { return StartScene.instance; }

  constructor()
  {
    super({ key: 'Start' });

    StartScene.instance = this;
  }

  public async init()
  {
    //this.addStats();
  }

  public async preload()
  {
    Map.preload(this);
    Player.preload(this);
  }

  public async create()
  {
    await this.warpSpeed(
      'camera',
      'sky',
      'light',
    )

    this.ui = FLAT.init(this.renderer);

    await Map.create(this);
  }

  public async addPlayerController()
  {
    this.player = await Player.create(this, { position: SAVE_POINT, my: true });
    this.playerController = new PlayerController(this, this.player);
 
    return this.player;
  }

  public async update(time: number, delta: number)
  {
    this.playerController?.update(time, delta);
    this.stats?.update();
  }

  public async preRender()
  {
    FLAT.preRender(this.renderer)
  }

  public async postRender()
  {
    if (this.ui !== undefined)
    {
      FLAT.postRender(this.renderer, this.ui)
    }
  }

  private addStats()
  {
    this.stats = Stats();

    document.body.appendChild(this.stats.dom)
  }
}
