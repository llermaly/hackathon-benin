'use client';
import Link from 'next/link';
import { useState } from 'react';

const quickAnswers = [
  {
    title: 'Food',
    image: '🍲',
    items: ['🍎 Apple', '💧 Water', '🌮 Lunch'],
  },
  {
    title: 'Hotel',
    image: '🏨',
    items: ['🛏️ Bed', '🚿 Shower', '🍳 Breakfast'],
  },
  {
    title: 'Transport',
    image: '🚗',
    items: ['🚕 Taxi', '🚆 Train', '🚌 Bus'],
  },
  {
    title: 'Shopping',
    image: '🛍️',
    items: ['👗 Dress', '👠 Shoes', '👜 Bag'],
  },
  {
    title: 'Emergency',
    image: '🚑',
    items: ['🩺 Doctor', '🚓 Police', '🔥 Fire'],
  },
];

const exampleMessages = [
  {
    heading: 'Translating English to Fon',
    message: 'How do I say "Hello my friend" in Fon?',
    image: '🇺🇸 -> 🇧🇯',
  },
  {
    heading: 'Asking about Fon translations',
    message: 'What is the translation of "Wǎ nú xɔ́ntɔn ce!" in English?',
    image: '🇧🇯 -> 🇺🇸',
  },
  {
    heading: 'Places suggestions',
    message:
      'Can you recommend some places to visit in Benin about the Fon culture?',
    image: '🏰',
  },
];

export function EmptyScreen({
  submitMessage,
}: {
  submitMessage: (message: string) => void;
}) {
  const [active, setActive] = useState('Food');
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex justify-center flex-col items-center">
        <h3 className="text-white text-2xl font-semibold">What can I do ?</h3>
        <div className="flex gap-4 mt-4">
          {exampleMessages.map((example, index) => (
            <div
              key={index}
              className="bg-appOrange w-[160px] text-black font-semibold px-4 py-4 rounded-3xl text-center hover:opacity-90 transition-all cursor-pointer "
              onClick={() => submitMessage(example.message)}
            >
              <div>{example?.image}</div>
              <div className="leading-5 mt-2">{example.heading}</div>
            </div>
          ))}
          <Link
            href="/?stt=fon"
            className="bg-appOrange w-[160px]  text-black font-semibold px-4 py-4 rounded-3xl text-center hover:opacity-90 transition-all cursor-pointer "
          >
            <div>🗣️</div>
            <div className="leading-5 mt-2">Write and speak in Fon</div>
          </Link>
        </div>

        <span className="text-gray-500 text-sm text-center my-4">
          Note: Translations are simulated for illustrative purposes. Please
          verify accuracy with a native speaker.
        </span>

        <div className="text-center">
          <h3 className="text-white text-xl font-semibold">Quick answers</h3>
          <div className="flex gap-4 mt-4">
            {quickAnswers.map((answer, index) => (
              <div
                onClick={() => setActive(answer.title)}
                key={index}
                className={`border cursor-pointer hover:opacity-90 transition-all border-white px-4 py-1 rounded-full font-semibold flex gap-3 items-center ${active === answer.title ? 'bg-white text-black' : 'bg-transparent text-white'}`}
              >
                <span>{answer.image}</span>
                <span>{answer.title}</span>
              </div>
            ))}
          </div>
          {active && (
            <div className="flex gap-8 mt-8">
              {quickAnswers
                .find(answer => answer.title === active)
                ?.items.map((item, index) => (
                  <div
                    onClick={() =>
                      submitMessage(`How do I say "${item}" in Fon?`)
                    }
                    key={index}
                    className="bg-slate-50 hover:bg-slate-200 transition-all cursor-pointer text-black px-4 py-2 rounded-3xl flex gap-2 items-center w-full h-16 font-semibold text-center justify-center text-xl"
                  >
                    <span className="tracking-wide">{item}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
