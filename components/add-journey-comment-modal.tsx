import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import EmojiPickerModal, { emojiMap } from "./emoji-picker-modal";
import { addJourneyComment } from "@/store/plantSlice";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantId: string;
};

export default function AddJourneyCommentModal({
  open,
  onOpenChange,
  plantId,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [commentText, setCommentText] = useState("");
  const [commentDate, setCommentDate] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const [selectedEmoji, setSelectedEmoji] = useState<string>("leaf");
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);

  const handleSubmit = async () => {
    if (!commentText.trim()) return;

    await dispatch(
      addJourneyComment({
        plantId,
        comment: commentText,
        icon: selectedEmoji,
        date: new Date(commentDate),
      })
    );

    setCommentText("");
    onOpenChange(false);
  };

  const SelectedIcon = emojiMap[selectedEmoji];

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Add Comment</ModalHeader>
            <ModalBody className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  color="primary"
                  onPress={() => setIsEmojiModalOpen(true)}
                  className="text-white p-2 rounded-lg"
                >
                  {SelectedIcon && (
                    <SelectedIcon className="w-6 h-6 text-white" />
                  )}
                </Button>
                <Input
                  className="w-full"
                  placeholder="Your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </div>

              <Input
                type="datetime-local"
                className="w-full"
                value={commentDate}
                onChange={(e) => setCommentDate(e.target.value)}
              />
            </ModalBody>

            <ModalFooter className="flex justify-end gap-2">
              <Button
                color="secondary"
                onPress={onClose}
                className="text-white"
              >
                cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                className="text-white"
              >
                submit
              </Button>
            </ModalFooter>

            <EmojiPickerModal
              open={isEmojiModalOpen}
              onOpenChange={setIsEmojiModalOpen}
              onSelect={(emoji) => setSelectedEmoji(emoji)}
            />
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
