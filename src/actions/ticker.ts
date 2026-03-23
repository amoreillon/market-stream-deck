import {
  action,
  type DidReceiveSettingsEvent,
  type KeyAction,
  type KeyUpEvent,
  SingletonAction,
  type WillAppearEvent,
  type WillDisappearEvent,
} from '@elgato/streamdeck';
import type { JsonObject } from '@elgato/utils';
import { fetchQuote } from '../yahoo-finance';
import { renderButton, renderError, renderLoading } from '../render';

type Settings = JsonObject & {
  symbol?: string;
  pollInterval?: number; // minutes
};

const DEFAULTS = {
  symbol: '',
  pollInterval: 15,
};

// Each visible button instance gets its own independent poll cycle.
interface InstanceState {
  action: KeyAction<Settings>;
  timer?: ReturnType<typeof setInterval>;
  symbol: string;
  pollInterval: number;
}

@action({ UUID: 'com.alex.market-monitor.ticker' })
export class TickerAction extends SingletonAction<Settings> {
  private readonly instances = new Map<string, InstanceState>();

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  onWillAppear(ev: WillAppearEvent<Settings>): void {
    if (!ev.action.isKey()) return;

    const settings = this.resolved(ev.payload.settings);
    const state: InstanceState = {
      action: ev.action,
      symbol: settings.symbol,
      pollInterval: settings.pollInterval,
    };

    this.instances.set(ev.action.id, state);
    this.startPolling(state);
  }

  onWillDisappear(ev: WillDisappearEvent<Settings>): void {
    const state = this.instances.get(ev.action.id);
    if (state) {
      this.stopPolling(state);
      this.instances.delete(ev.action.id);
    }
  }

  onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): void {
    if (!ev.action.isKey()) return;

    const settings = this.resolved(ev.payload.settings);
    const state = this.instances.get(ev.action.id);

    if (state) {
      state.symbol = settings.symbol;
      state.pollInterval = settings.pollInterval;
      // Restart polling with new settings
      this.startPolling(state);
    }
  }

  // ─── Key press — open Yahoo Finance page for the ticker ──────────────────

  onKeyUp(ev: KeyUpEvent<Settings>): void {
    const state = this.instances.get(ev.action.id);
    const symbol = state?.symbol;
    if (symbol) {
      // Open the Yahoo Finance quote page in the default browser
      const { exec } = require('child_process') as typeof import('child_process');
      exec(`open "https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}"`);
    }
  }

  // ─── Polling ───────────────────────────────────────────────────────────────

  private startPolling(state: InstanceState): void {
    this.stopPolling(state);

    if (!state.symbol) {
      void renderLoading('');
      void state.action.setImage(renderLoading(''));
      void state.action.setTitle('');
      return;
    }

    // Fetch immediately, then on the interval
    void this.refresh(state);
    state.timer = setInterval(
      () => void this.refresh(state),
      state.pollInterval * 60 * 1000,
    );
  }

  private stopPolling(state: InstanceState): void {
    if (state.timer !== undefined) {
      clearInterval(state.timer);
      state.timer = undefined;
    }
  }

  private async refresh(state: InstanceState): Promise<void> {
    // Show loading state while fetching
    void state.action.setImage(renderLoading(state.symbol));
    void state.action.setTitle('');

    try {
      const quote = await fetchQuote(state.symbol);
      const image = renderButton(quote.symbol, quote.changePercent, quote.marketOpen);
      void state.action.setImage(image);
      void state.action.setTitle('');
    } catch {
      void state.action.setImage(renderError(state.symbol));
      void state.action.setTitle('');
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private resolved(settings: Settings): Required<typeof DEFAULTS> {
    return {
      symbol: ((settings.symbol as string | undefined) ?? DEFAULTS.symbol).toUpperCase().trim(),
      pollInterval: (settings.pollInterval as number | undefined) ?? DEFAULTS.pollInterval,
    };
  }
}
