import streamDeck from '@elgato/streamdeck';
import { TickerAction } from './actions/ticker';

streamDeck.actions.registerAction(new TickerAction());
streamDeck.connect();
