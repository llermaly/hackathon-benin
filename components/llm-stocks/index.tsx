'use client';

import dynamic from 'next/dynamic';
import { StockSkeleton } from './stock-skeleton';
import { StocksSkeleton } from './stocks-skeleton';
import { EventsSkeleton } from './events-skeleton';

export { spinner } from './spinner';
export { BotCard, BotMessage, SystemMessage } from './message';

const Stock = dynamic(() => import('./stock').then(mod => mod.Stock), {
  ssr: false,
  loading: () => <StockSkeleton />,
});

const Stocks = dynamic(() => import('./stocks').then(mod => mod.Stocks), {
  ssr: false,
  loading: () => <StocksSkeleton />,
});

const Events = dynamic(() => import('./event').then(mod => mod.Events), {
  ssr: false,
  loading: () => <EventsSkeleton />,
});

export { Stock, Stocks, Events };
