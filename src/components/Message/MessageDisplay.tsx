interface MessageDisplayProps {
  message: string;
}
// MessageDisplay Component
const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => (
  <span className="mt-1 text-xs text-gray-500 min-h-[20px]">{message}</span>
);

export default MessageDisplay;
