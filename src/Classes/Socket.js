const KEEPALIVE_TIMER = 10000;

export default class Socket {
  constructor(url, protocols = []) {
    this.url = url;
    this.protocols = protocols instanceof Array ? protocols : [protocols];
    this.subscribeMessage = null;
    this.unsubscribeMessage = null;
    this._cb = null;
    this._ws = null;
    this._keepAlive = null;

    this._initWebsocket();
  }

  subscribe(to, callback = () => {}) {
    if (typeof callback === 'function') {
      this._cb = callback;
    } else {
      this._cb = () => {};
    }

    const message = typeof to === 'string' ? to : JSON.stringify(to);
    const check = setInterval(() => {
      if (this._ws.OPEN) {
        this._ws.send(message);
        clearInterval(check);
      }
    }, 100);
  }

  setSubscribeMessage(message) {
    this.subscribeMessage =
      typeof message === 'string' ? message : JSON.stringify(message);
  }

  setUnsubscribeMessage(message) {
    this.unsubscribeMessage =
      typeof message === 'string' ? message : JSON.stringify(message);
  }

  restart(url = this.url, protocols = this.protocols) {
    if (this._ws.OPEN) {
      this._ws.close();
    }
    this.url = url;
    this.protocols = protocols instanceof Array ? protocols : [protocols];
  }

  _initWebsocket() {
    this._ws = new WebSocket(this.url, this.protocols);
    this._ws.onmessage = this._onMessage.bind(this);
    this._ws.onclose = this._onClose.bind(this);
    this._startKeepAlive();
  }

  _startKeepAlive() {
    this._keepAlive = setInterval(() => {
      console.log('intervalling...');
      if (this._ws.OPEN) {
        this._ws.send(this.unsubscribeMessage);
      }
    }, KEEPALIVE_TIMER);
  }

  _stopKeepAlive() {
    if (this._keepAlive) {
      clearInterval(this._keepAlive);
      this._keepAlive = null;
    }
  }

  _onClose() {
    this._stopKeepAlive();
    this._initWebsocket();
    this.subscribe(this.subscribeMessage, this._cb);
  }

  _onMessage(event) {
    const resp = JSON.parse(event.data);
    switch (resp.event) {
      case 'data': {
        this._cb(resp.data);
        break;
      }
      case 'bts:request_reconnect': {
        this.restart();
        break;
      }
      case 'bts:unsubscription_succeeded': {
        this.restart();
        break;
      }
      case 'bts:subscription_succeeded': {
        // noop;
        break;
      }
      default:
        console.log(resp);
    }
  }
}
