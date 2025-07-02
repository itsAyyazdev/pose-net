import { LiaUploadSolid } from "react-icons/lia";
import Button from "../Button/Button";

interface FileInputProps {
  index: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// FileInput Component
const FileInput: React.FC<FileInputProps> = ({ index, onChange }) => (
  <label className="mt-2">
    <input
      type="file"
      accept="image/*"
      className="hidden"
      id={`file-input-${index}`}
      onChange={onChange}
    />
    <Button
      onClick={() => document.getElementById(`file-input-${index}`)?.click()}
      variant="secondary"
      className="w-full gap-2 items-center"
    >
      <LiaUploadSolid className="text-2xl" /> Upload
    </Button>
  </label>
);

export default FileInput;
