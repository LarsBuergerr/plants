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
import { addJourneyImage } from "@/store/plantSlice";
import { storage } from "@/lib/appwrite";
import { ID } from "appwrite";
import { Input } from "@heroui/input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantId: string;
};

export default function AddJourneyImageModal({
  open,
  onOpenChange,
  plantId,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageDate, setImageDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      const uploaded = await storage.createFile(
        "plant_journey_images",
        ID.unique(),
        selectedFile
      );

      await dispatch(
        addJourneyImage({
          plantId,
          imageId: uploaded.$id,
          date: new Date(imageDate),
        })
      );

      setSelectedFile(null);
      onOpenChange(false);
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>add image</ModalHeader>
            <ModalBody className="flex flex-col gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setSelectedFile(e.target.files ? e.target.files[0] : null)
                }
              />
              <label className="flex flex-col">
                date:
                <Input
                  type="datetime-local"
                  className="w-full"
                  value={imageDate}
                  onChange={(e) => setImageDate(e.target.value)}
                />
              </label>
            </ModalBody>
            <ModalFooter className="flex justify-end gap-2">
              <Button variant="light" onPress={onClose} className="text-white">
                cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                className="text-white"
                disabled={uploading || !selectedFile}
              >
                {uploading ? "uploading..." : "submit"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
