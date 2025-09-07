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
import { addJourneyComment } from "@/store/plantSlice";
import { Input } from "@heroui/input";

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

  const handleSubmit = async () => {
    if (!commentText.trim()) return;

    await dispatch(
      addJourneyComment({
        plantId,
        comment: commentText,
        date: new Date(commentDate),
      })
    );

    setCommentText("");
    onOpenChange(false);
  };

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>add comment</ModalHeader>
            <ModalBody className="flex flex-col gap-4">
              <Input
                className="w-full"
                placeholder="your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Input
                type="datetime-local"
                className="w-full"
                value={commentDate}
                onChange={(e) => setCommentDate(e.target.value)}
              />
            </ModalBody>
            <ModalFooter className="flex justify-end gap-2">
              <Button variant="light" onPress={onClose} className="text-white">
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                className="text-white"
              >
                Submit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
