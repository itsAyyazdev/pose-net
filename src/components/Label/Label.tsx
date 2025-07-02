interface LabelProps {
  text: string;
}

// Label Component
const Label: React.FC<LabelProps> = ({ text }) => (
  <div className="text-black font-bold">{text}</div>
);

export default Label;
