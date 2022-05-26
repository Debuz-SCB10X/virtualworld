import { ConnectionState, IWebSocketClient, newWebSocketClient } from "./ws";
import { NetworkListener } from "./network-listener";
import { IPacket } from "./packet";

export interface RemoteEvent
{
  onConnected: () => void;
  onDisconnected: () => void;
  onConnectionError: (err: string) => void;
}

export interface GameEvent
{
  onError: (errCode: string, errString: string) => Promise<void>;
  onUserData: (userId: number, displayName: string) => Promise<void>; 
  onEnterUser: (userId: number, displayName: string) => Promise<void>;
  onChatMessage: (senderId: number, sender: string, message: string) => Promise<void>;
  onRemoveUser: (userId: number) => Promise<void>;
  onPosition: (userId: number, px: number, py: number, pz: number) => Promise<void>;
  onRotation: (userId: number, rx: number, ry: number, rz: number) => Promise<void>;
  onAnimation: (userId: number, name: string) => Promise<void>;
}

export class Remote implements IPacket
{
  private websocket: IWebSocketClient;
  private remoteEvent: RemoteEvent;

  private gameEvent?: GameEvent;

  public constructor(remoteEvent: RemoteEvent, gameEvent?: GameEvent)
  {
    this.websocket = newWebSocketClient("browser");
    this.websocket.setListener(new NetworkListener(this));
    this.remoteEvent = remoteEvent;
    this.gameEvent = gameEvent;
  }

  public async setGameEvent(gameEvent: GameEvent)
  {
    this.gameEvent = gameEvent;
  }

  public async recvUserData(userId: number, displayName: string): Promise<void>
  {
    await this.gameEvent?.onUserData(userId, displayName);
  }

  public async recvPosition(userId: number, px: number, py: number, pz: number): Promise<void>
  {
    await this.gameEvent?.onPosition(userId, px, py, pz);
  }

  public async recvRotation(userId: number, rx: number, ry: number, rz: number): Promise<void>
  {
    await this.gameEvent?.onRotation(userId, rx, ry, rz);
  }

  public async recvAnimation(userId: number, name: string): Promise<void>
  {
    await this.gameEvent?.onAnimation(userId, name);
  }

  public async recvError(errCode: string, errString: string): Promise<void>
  {
    await this.gameEvent?.onError(errCode, errString);
  }

  public async recvEnterUser(userId: number, displayName: string): Promise<void>
  {
    await this.gameEvent?.onEnterUser(userId, displayName);
  }

  public async recvChat(senderId: number, sender: string, message: string): Promise<void>
  {
    await this.gameEvent?.onChatMessage(senderId, sender, message);
  }

  public async recvRemoveUser(userId: number): Promise<void>
  {
    await this.gameEvent?.onRemoveUser(userId);
  }

  public onConnected()
  {
    this.remoteEvent.onConnected();
  }

  public onDisconnected()
  {
    this.remoteEvent.onDisconnected();
  }

  public onConnectError(err: string)
  {
    this.remoteEvent.onConnectionError(err);
  }

  public connect(url: string)
  {
    if (!this.connected())
    {
      this.websocket.connect(url);
    }
  }

  public send(data: string)
  {
    if (this.connected())
    {
      this.websocket.send(data);
    }
  }

  public disconnect()
  {
    if (this.connected())
    {
      this.websocket.close();
    }
  }

  public connected(): boolean
  {
    return this.websocket.getState() === ConnectionState.CONNECTED;
  }

  public close()
  {
    this.disconnect();
  }
}

