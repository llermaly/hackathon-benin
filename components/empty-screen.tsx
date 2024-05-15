'use client';
import Link from 'next/link';
import { useState } from 'react';

const quickAnswers = [
  {
    title: 'Food',
    image: '🍲',
    items: [
      { name: '🍎 Fruit', audio: '/audio/apple.flac' },
      { name: '💧 Water', audio: '/audio/water.flac' },
      { name: '🍞 Bread', audio: '/audio/bread.flac' },
    ],
  },
  {
    title: 'Home',
    image: '🏨',
    items: [
      { name: '🛏️ Bed', audio: '/audio/bed.flac' },
      { name: '🚿 Shower', audio: '/audio/shower.flac' },
      { name: '🍳 Breakfast', audio: '/audio/breakfast.flac' },
    ],
  },
  {
    title: 'Market',
    image: '🛍️',
    items: [
      { name: '👗 Clothes', audio: '/audio/clothes.flac' },
      { name: '👟 Shoes', audio: '/audio/shoes.flac' },
      { name: '🕶️ Sunglasses', audio: '/audio/sunglasses.flac' },
    ],
  },
  {
    title: 'Emergency',
    image: '🚑',
    items: [
      { name: '🚨 Help', audio: '/audio/help.flac' },
      { name: '🚓 Police', audio: '/audio/ambulance.flac' },
      { name: '🚒 Fire', audio: '/audio/fire.flac' },
    ],
  },
];

const exampleMessages = [
  {
    heading: 'English to Fon',
    message: 'How do I say "Hello my friend" in Fon?',
    image: '/en_fon.png',
  },
  {
    heading: 'Fon to English',
    message: 'What is the translation of "Wǎ nú xɔ́ntɔn ce!" in English?',
    image: '/fon_en.png',
  },
  {
    heading: 'Places suggestions',
    message:
      'Can you recommend some places to visit in Benin about the Fon culture?',
    image: '/places.png',
  },
];

export function EmptyScreen({
  submitMessage,
}: {
  submitMessage: (message: string) => void;
}) {
  const [active, setActive] = useState('Food');

  const playAudio = (audio: string) => {
    const audioEl = new Audio(audio);
    audioEl.play();
  };

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex justify-center flex-col items-center">
        <h3 className="text-white text-3xl">
          What can I <span className="font-bold">do</span> ?
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 w-full lg:w-[1000px] gap-4 mt-4 px-4">
          {exampleMessages.map((example, index) => (
            <div
              key={index}
              className={`w-full font-semibold p-2 rounded-xl text-center hover:opacity-90 transition-all cursor-pointer ${(index + 1) % 2 === 0 ? 'bg-appOrange text-appGreen' : 'bg-appGreen text-appOrange'}`}
              onClick={() => submitMessage(example.message)}
            >
              <div className="border-dotted h-full border-2 border-black border-opacity-30 rounded-xl p-2 flex flex-col items-center justify-between">
                <img src={example.image} alt="img" className="h-12 mt-4" />
                <div className="leading-5 mt-2 text-base">
                  {example.heading}
                </div>
              </div>
            </div>
          ))}
          <Link
            href="/?stt=fon"
            className="bg-appOrange w-full  text-appGreen font-semibold p-2 rounded-xl text-center hover:opacity-90 transition-all cursor-pointer "
          >
            <div className="border-dotted h-full border-2 border-black border-opacity-30 rounded-xl p-2 flex flex-col justify-between">
              <div className="text-[44px]">🗣️</div>
              <div className="leading-5 mt-2">Talk in Fon</div>
            </div>
          </Link>
        </div>

        <span className="text-gray-500 text-sm text-center mt-4">
          Note: Translations are simulated for illustrative purposes. Please
          verify accuracy with a native speaker.
        </span>
        <div className="px-4 w-full lg:w-[1000px]">
          <div className="text-center bg-appBlue2 w-full mt-8 px-12 pb-12 pt-4 rounded-lg">
            <h3 className="text-white text-2xl">
              Quick <span className="font-bold">answers</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-5  gap-4 mt-8">
              {quickAnswers.map((answer, index) => (
                <div
                  onClick={() => setActive(answer.title)}
                  key={index}
                  className={`border-2 cursor-pointer hover:opacity-90 transition-all border-white px-6 py-1.5 rounded-full font-semibold flex gap-3 items-center ${active === answer.title ? 'bg-white text-black' : 'bg-transparent text-white'}`}
                >
                  <span>{answer.image}</span>
                  <span>{answer.title}</span>
                </div>
              ))}
            </div>
            {active && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {quickAnswers
                  .find(answer => answer.title === active)
                  ?.items.map((item, index) => (
                    <div
                      onClick={() => playAudio(item.audio)}
                      key={index}
                      className="bg-white transition-all cursor-pointer text-black pl-4 rounded-full flex gap-2 items-center w-full h-12 font-semibold text-center justify-center text-xl"
                    >
                      <span className="tracking-wide text-lg w-full">
                        {item.name}
                      </span>
                      <span className="text-3xl w-[50px] px-3 rounded-tr-3xl rounded-br-3xl bg-white h-full flex items-center justify-center hover:text-[34px] transition-all cursor-pointer">
                        👂
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
