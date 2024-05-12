import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@/components/ui/icons';
import Link from 'next/link';

const exampleMessages = [
  {
    heading: 'Translating English to Fon',
    message: 'How do I say "Hello my friend" in Fon?',
  },
  {
    heading: 'Asking about Fon translations',
    message: 'What is the translation of "Wǎ nú xɔ́ntɔn ce!" in English?',
  },
  {
    heading: 'Places suggestions',
    message:
      'Can you recommend some places to visit in Benin about the Fon culture?',
  },
];

export function EmptyScreen({
  submitMessage,
}: {
  submitMessage: (message: string) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8 mb-4">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to the Interactive Tourism Guide for Benin!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This demo showcases an AI-powered assistant that is tailored to help
          tourists prepare for their journey to Benin, immersing them in Fon
          culture and facilitating communication. Built using advanced AI
          technology, this assistant is a specialist in the Fon culture and
          provides expert translations between English and Fon. It also creates
          visual content that enriches the user's understanding of Benin.
        </p>

        <p className="leading-normal text-muted-foreground">Try:</p>
        <div className="mt-4 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={async () => {
                submitMessage(message.message);
              }}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}

          <Link href="?stt=fon">
            <Button variant="link" className="h-auto p-0 text-base">
              <IconArrowRight className="mr-2 text-muted-foreground" />
              Talk in Fon
            </Button>
          </Link>
        </div>
      </div>
      <p className="leading-normal text-muted-foreground text-[0.8rem] text-center max-w-96 ml-auto mr-auto">
        Note: Translations are simulated for illustrative purposes. Please
        verify accuracy with a native speaker.
      </p>
    </div>
  );
}
