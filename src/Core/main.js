import Socket from '../Classes/Socket.js';

// const bidsPlaceholder = document.getElementById('bids_placeholder');
// const asksPlaceholder = document.getElementById('asks_placeholder');
const price = document.getElementById('medium_price');
/**
 * This constant is an example of subscription message. By changing its event property to: "bts:unsubscribe"
 * you can delete your subscription and stop receiving events.
 */
const subscribeMsg = {
  event: 'bts:subscribe',
  data: {
    channel: 'order_book_btceur',
  },
};

const unSubscribeMsg = {
  event: 'bts:unsubscribe',
  data: {
    channel: 'order_book_btceur',
  },
};

/**
 * Serializes data when it's received.
 */
const serializeData = (data) => {
  // bidsPlaceholder.innerHTML = '';
  // asksPlaceholder.innerHTML = '';
  let bids = 0;
  data.bids.forEach((value) => {
    bids += parseFloat(value[0]);
    // bidsPlaceholder.innerHTML += `${value[1]} BTC @ ${value[0]} € <br/>`;
  });
  let asks = 0;
  data.asks.forEach((value) => {
    asks += parseFloat(value[0]);
    // asksPlaceholder.innerHTML += `${value[1]} BTC @ ${value[0]} € <br/>`;
  });
  const med = ( asks + bids ) / ( data.asks.length + data.bids.length );
  requestAnimationFrame( () => price.innerHTML = `${ med.toFixed( 2 ) } €/BTC` );
  
};

/**
 * Execute a websocket handshake by sending an HTTP upgrade header.
 */
const ws = new Socket('wss://ws.bitstamp.net');
ws.setUnsubscribeMessage(unSubscribeMsg);
ws.setSubscribeMessage(subscribeMsg);
ws.subscribe(subscribeMsg, serializeData.bind(this));
