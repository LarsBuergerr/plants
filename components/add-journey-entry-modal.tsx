import { useEffect, useState } from "react";
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
import { addJourneyEntry, updateJourneyEntry } from "@/store/plantSlice";
import { storage } from "@/lib/appwrite";
import { ID } from "appwrite";
import EmojiPickerModal, { emojiMap } from "./emoji-picker-modal";
import { JourneyEntryWithUrl } from "@/types/journey_entry.type";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantId: string;
  existingEntry?: JourneyEntryWithUrl; // optional for editing
};

export default function AddJourneyEntryModal({
  open,
  onOpenChange,
  plantId,
  existingEntry,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageDate, setImageDate] = useState(
    existingEntry
      ? new Date(existingEntry.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [comment, setComment] = useState(existingEntry?.comment || "");
  const [selectedEmoji, setSelectedEmoji] = useState<string>(
    existingEntry?.icon || "leaf"
  );
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setComment(existingEntry?.comment || "");
      setImageDate(
        existingEntry
          ? new Date(existingEntry.date).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16)
      );
      setSelectedEmoji(existingEntry?.icon || "leaf");
    }
  }, [open, existingEntry]);

  const handleSubmit = async () => {
    setUploading(true);

    try {
      let uploaded;

      if (selectedFile) {
        if (existingEntry && existingEntry.imageId) {
          await storage.deleteFile(
            "plant_journey_images",
            existingEntry.imageId
          );
        }

        uploaded = await storage.createFile(
          "plant_journey_images",
          ID.unique(),
          selectedFile
        );
      }

      if (existingEntry) {
        await dispatch(
          updateJourneyEntry({
            id: existingEntry.$id,
            data: {
              comment: comment || undefined,
              icon: selectedEmoji,
              date: new Date(imageDate),
              imageId: uploaded ? uploaded.$id : existingEntry.imageId,
            },
            plantId: plantId,
          })
        );
      } else {
        // Add new entry
        await dispatch(
          addJourneyEntry({
            plant: plantId,
            comment: comment || undefined,
            icon: selectedEmoji,
            date: new Date(imageDate),
            imageId: uploaded ? uploaded.$id : undefined,
          })
        );
      }

      onOpenChange(false);
    } catch (err) {
      console.error("Error saving journey entry:", err);
    } finally {
      setUploading(false);
    }
  };

  const SelectedIcon = emojiMap[selectedEmoji];

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              {existingEntry ? "Edit Journey Entry" : "Add Journey Entry"}
            </ModalHeader>
            <ModalBody className="flex flex-col gap-4">
              <div className="flex justify-center gap-2">
                <Button
                  isIconOnly
                  color="primary"
                  onPress={() => setIsEmojiModalOpen(true)}
                  className="text-white"
                >
                  {SelectedIcon && (
                    <SelectedIcon className="w-6 h-6 text-white" />
                  )}
                </Button>

                <Input
                  type="text"
                  className="w-full"
                  placeholder="Add a comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>

              <Input
                type="datetime-local"
                className="w-full"
                value={imageDate}
                onChange={(e) => setImageDate(e.target.value)}
              />
            </ModalBody>

            <ModalFooter className="flex justify-end gap-2">
              <Button
                color="secondary"
                onPress={onClose}
                className="text-white"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                className="text-white"
                disabled={
                  uploading || (!selectedFile && !comment && !existingEntry)
                }
              >
                {uploading ? "Saving..." : existingEntry ? "Update" : "Submit"}
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
