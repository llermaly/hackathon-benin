import { Button } from '@/components/ui/button';
import { ExternalLink } from '@/components/external-link';
import { IconArrowRight } from '@/components/ui/icons';

const exampleMessages = [
  {
    heading: 'Translate "Hello" into Fon',
    message: 'Hello',
  },
  {
    heading: 'Translate "How are you?" into Fon',
    message: 'How are you?',
  },
  {
    heading: 'Translate "Good morning" into Fon',
    message: 'Good morning',
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
          Welcome to the Language Translation UI demo!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          This is a demo of an interactive translation assistant. It can help
          you translate text from any language into Fon.
        </p>
        <p className="mb-2 leading-normal text-muted-foreground">
          The demo is built with{' '}
          <ExternalLink href="https://nextjs.org">Next.js</ExternalLink> and
          utilizes the{' '}
          <ExternalLink href="https://sdk.vercel.ai/docs">
            Vercel AI SDK
          </ExternalLink>
          .
        </p>
        <p className="mb-2 leading-normal text-muted-foreground">
          It leverages{' '}
          <ExternalLink href="https://vercel.com/blog/ai-sdk-3-generative-ui">
            React Server Components
          </ExternalLink>{' '}
          to dynamically generate UI elements that are aware of your
          interactions in real-time.
        </p>
        <p className="leading-normal text-muted-foreground">
          Try translating a phrase:
        </p>
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
        </div>
      </div>
      <p className="leading-normal text-muted-foreground text-[0.8rem] text-center max-w-96 ml-auto mr-auto">
        Note: Translations are simulated for illustrative purposes. Please
        verify accuracy with a native speaker.
      </p>
    </div>
  );
}
