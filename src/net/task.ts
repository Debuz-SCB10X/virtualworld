export interface EventNotifier
{
  wait(): Promise<void>;
  notify(): void;
  notifyAll(): void;
}

export function createEventNotifier(): EventNotifier
{
  return new InternalEventNotifier();
}

export async function sleep(ms: number): Promise<void>
{
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

class InternalEventNotifier
{
  private waiting: ((value?: void | PromiseLike<void> | undefined) => void)[];

  public constructor()
  {
    this.waiting = [];
  }

  public async wait()
  {
    return new Promise<void>((resolve) => {
      this.waiting.push(resolve);
    });
  }

  public notify()
  {
    const resolve = this.waiting.shift();
    /* istanbul ignore if */
    if (!resolve) return;
    resolve();
  }

  public notifyAll()
  {
    /* istanbul ignore if */
    if (this.waiting.length === 0) return;
    const w = this.waiting;
    this.waiting = [];
    w.forEach((resolve) => {
      resolve();
    });
  }
}