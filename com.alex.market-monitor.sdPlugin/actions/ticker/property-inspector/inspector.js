(function () {
  'use strict';

  let websocket = null;
  let uuid = null;

  window.connectElgatoStreamDeckSocket = function (port, piUUID, registerEvent, _info, actionInfo) {
    uuid = piUUID;
    websocket = new WebSocket('ws://127.0.0.1:' + port);

    websocket.onopen = function () {
      send({ event: registerEvent, uuid });
      send({ event: 'getSettings', context: uuid });
    };

    websocket.onmessage = function (evt) {
      const msg = JSON.parse(evt.data);
      if (msg.event === 'didReceiveSettings') {
        applySettings(msg.payload.settings || {});
      }
    };

    if (actionInfo) {
      const info = typeof actionInfo === 'string' ? JSON.parse(actionInfo) : actionInfo;
      if (info?.payload?.settings) applySettings(info.payload.settings);
    }
  };

  const symbolEl = document.getElementById('symbol');
  const pollIntervalEl = document.getElementById('pollInterval');

  let debounce = null;
  function schedule() {
    clearTimeout(debounce);
    debounce = setTimeout(sendSettings, 400);
  }

  symbolEl.addEventListener('input', schedule);
  pollIntervalEl.addEventListener('input', schedule);

  function applySettings(s) {
    if (s.symbol !== undefined) symbolEl.value = s.symbol;
    if (s.pollInterval !== undefined) pollIntervalEl.value = s.pollInterval;
  }

  function sendSettings() {
    send({
      event: 'setSettings',
      context: uuid,
      payload: {
        symbol: symbolEl.value.toUpperCase().trim(),
        pollInterval: parseInt(pollIntervalEl.value, 10) || 15,
      },
    });
  }

  function send(obj) {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(obj));
    }
  }
})();
