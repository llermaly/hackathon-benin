import { Separator } from '@/components/ui/separator';

export function ChatList({ messages }: { messages: any[] }) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-[1000px] px-4 text-white">
      {messages.map((message, index) => (
        <div key={index} className="px-2 pt-2 pb-3 bg-appBlue2 mb-4 rounded-md">
          {message.display}
        </div>
      ))}
    </div>
  );
}
