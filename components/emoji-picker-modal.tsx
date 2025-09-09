import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";

import {
  Feather,
  Leaf,
  Clover,
  Flower,
  Flower2,
  Sprout,
  Bug,
  Cherry,
  Grape,
  Rat,
  Rabbit,
  MoonStar,
} from "lucide-react";

type EmojiPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (emoji: string) => void;
};

export const emojiMap: { [key: string]: React.ElementType } = {
  feather: Feather,
  leaf: Leaf,
  clover: Clover,
  flower: Flower,
  flower2: Flower2,
  sprout: Sprout,
  bug: Bug,
  cherry: Cherry,
  grape: Grape,
  rat: Rat,
  rabbit: Rabbit,
  moonStar: MoonStar,
};

export default function EmojiPickerModal({
  open,
  onOpenChange,
  onSelect,
}: EmojiPickerProps) {
  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>pick an emoji :3</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(emojiMap).map(([name, Icon]) => (
                  <Button
                    color="primary"
                    key={name}
                    onClick={() => {
                      onSelect(name);
                      onClose();
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </Button>
                ))}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
