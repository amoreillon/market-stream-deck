import streamDeck from '@elgato/streamdeck';
import { TickerAction } from './actions/ticker';
import { InvertedTickerAction } from './actions/inverted-ticker';
import { FxTickerAction } from './actions/fx-ticker';

streamDeck.actions.registerAction(new TickerAction());
streamDeck.actions.registerAction(new InvertedTickerAction());
streamDeck.actions.registerAction(new FxTickerAction());
streamDeck.connect();
