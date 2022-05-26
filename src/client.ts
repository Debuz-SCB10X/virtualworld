import { StartScene } from "./start-scene";
import { PhysicsLoader, Project, THREE } from "enable3d";
import { Remote } from "./net/remote";
import { alertDialog, getQueryString } from "./helper";
import { sendChat, sendLogin } from "./net/packet";
import { Player } from "./player";
import { DataReducer } from "./data-reducer";

export const SAVE_POINT = new THREE.Vector3(-1.9999876022338867, 2.05552339553833, 1.0000406503677368);

export class Client
{
  private playerMap: Map<number, Player>;
  private ud: UserData;
  private remote?: Remote;
  private envEndpoint: EnvironmentEndpoint;
  private dataReducer: DataReducer;
  private updateTimer?: NodeJS.Timer;

  constructor(env: EnvironmentEndpoint)
  {
    this.envEndpoint = env;
    this.ud = { userId: 0, displayName: "" };
    this.playerMap = new Map<number, Player>();
    this.dataReducer = new DataReducer();
  }

  public async start()
  {
    PhysicsLoader('./ammo', () => {
      new Project({ scenes: [StartScene], antialias: true });
    });

    const displayName = await doLogin() || "guest";
    const remoteEvent = {
      onConnected: async () => { await this.onConnected(displayName); },
      onDisconnected: async () => { await this.onDisconnected(); },
      onConnectionError: async (err: string) => { await this.onConnectionError(err); },
    }

    this.remote = new Remote(remoteEvent);
    this.remote.connect(this.getEnvironmentEndpoint());
  }

  private async onConnected(displayName: string)
  {
    if (this.remote)
    {
      this.remote.setGameEvent({
        onError: async (errCode: string, errString: string) => { alertDialog(`${errCode}: ${errString}`); },
        onUserData: async (userId: number, displayName: string) => {  await this.onUserData(userId, displayName);  }, 
        onEnterUser: async (userId: number, displayName: string) => { await this.onEnterUser(userId, displayName); },
        onChatMessage: async (userId: number, displayName: string, message: string) => { await this.onChat(userId, displayName, message); },
        onRemoveUser: async (userId: number) => { await this.onRemoveUser(userId); },
        onPosition: async (userId: number, px: number, py: number, pz: number) => { await this.onPosition(userId, px, py, pz); },
        onRotation: async (userId: number, rx: number, ry: number, rz: number) => { await this.onRotation(userId, rx, ry, rz); },
        onAnimation: async (userId: number, name: string) => { await this.onAnimation(userId, name); },
      });

      sendLogin(this.remote, displayName);
    }
  }

  private async onDisconnected()
  {
    alertDialog("disconnected");
    this.updateTimer?.unref();
    window.location.reload();
  }

  private async onConnectionError(err: string)
  {
    alertDialog(`onConnectionError: ${err}`);
  }

  private async onUserData(userId: number, displayName: string)
  {
    const scene = StartScene.getInstance();
    if (scene)
    {
      this.ud = { userId, displayName };
      scene.addPlayerController().then((player) => {
        this.ud.player = player;
        this.playerMap.set(userId, player);
        this.updatePlayerValue();

        player.charName(displayName);
      }).catch((err) => { console.error(err); });

      doChat((message) => {
        sendChat(this.remote, message);
      });
    }
  }

  private updatePlayerValue()
  {
    this.updateTimer = setInterval(() => {
      const player = this.ud?.player;
      if (player)
      {
        const px = player.position.x;
        const py = player.position.y;
        const pz = player.position.z;
        const rx = player.rotation.x;
        const ry = player.rotation.y;
        const rz = player.rotation.z;
        const name = player.anims.current;

        this.dataReducer.sendPosition(this.remote, px, py, pz);
        this.dataReducer.sendRotation(this.remote, rx, ry, rz);
        this.dataReducer.sendAnimation(this.remote, name);
      }
    }, 5);
  }

  private async onEnterUser(userId: number, displayName: string)
  {
    if (this.ud.userId === userId) return;

    const scene = StartScene.getInstance();
    if (scene)
    {
      Player.create(scene, { position: SAVE_POINT, my: false }).then((player) => {
        this.playerMap.set(userId, player);
        player.charName(displayName);

      }).catch((err) => { console.error(err); })
    }
  }

  private async onPosition(userId: number, px: number, py: number, pz: number)
  {
    if (this.ud.userId === userId) return;

    const player = this.playerMap.get(userId);
    if (player)
    {
      player.position.set(px, py, pz);
    }
  }

  private async onRotation(userId: number, rx: number, ry: number, rz: number)
  {
    if (this.ud.userId === userId) return;

    const player = this.playerMap.get(userId);
    if (player)
    {
      player.rotation.set(rx, ry, rz);
    }
  }

  private async onAnimation(userId: number, name: string)
  {
    if (this.ud.userId === userId) return;

    const player = this.playerMap.get(userId);
    if (player && player.anims.current !== name)
    {
      player.anims.play(name, 1, true);
    }
  }

  private async onRemoveUser(userId: number)
  {
    const player = this.playerMap.get(userId);
    if (player)
    {
      player.removeFromParent();
    }
  }

  private async onChat(userId: number, displayName: string, message: string)
  {
    const chat = document.getElementById('chat-log');
    if (chat === undefined || chat === null) return;
    const m = document.createElement('div');
    m.innerText = `${displayName}: ${message}`;
    m.style.color = "#FFFFFFFF";
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;

    const player = this.playerMap.get(userId);
    if (player)
    {
      await player.charChat(message);
    }
  }

  private getEnvironmentEndpoint()
  {
    const env = getQueryString("env");
    if (env === undefined) return this.envEndpoint.dev;
    if (env === "prod") return this.envEndpoint.prod;
    return this.envEndpoint.dev;
  }
}

export interface UserData
{
  userId: number;
  displayName: string;
  player?: Player;
}

export interface EnvironmentEndpoint
{
  dev: string,
  prod: string,
}

async function doLogin()
{
  // loading
  const loading = document.getElementById('loading');
  if (loading !== undefined && loading !== null && loading.style !== undefined)
  {
    loading.style.visibility = 'hidden';
  }

  // visible join
  const joinContainer = document.getElementById('join');
  if (joinContainer === undefined || joinContainer === null) return;
  joinContainer.style.visibility = 'visible';

  return new Promise<string>((resolve, _reject) => {
    const buttonJoin = document.getElementById('button-join') as HTMLButtonElement;
    if (buttonJoin !== undefined && buttonJoin !== null)
    {
      buttonJoin.onclick = () => {
        const name = document.getElementById('input-name') as HTMLInputElement;
        if (name.value.length > 0)
        {
          resolve(name.value);
          joinContainer.style.visibility = 'hidden';
        }
        else
        {
          const error = document.getElementById('text-join-error');
          if (error !== undefined && error !== null) error.innerText = "invalie name";
        }
      }
    }
  })
}

function doChat(onMessage: (message: string) => void)
{
  const chatContainer = document.getElementById('chat');
  if (chatContainer === undefined || chatContainer === null) return;
  chatContainer.style.visibility = 'visible';
  const chatInput = document.getElementById('input-chat') as HTMLInputElement;
  if (chatInput === undefined || chatInput === null) return;
  chatInput.onkeydown = (ev)=>{
    if (ev.key.toLowerCase() !== "enter") return;
    if (chatInput.value.length === 0) return;
    onMessage(chatInput.value);
    chatInput.value = '';
  }
}