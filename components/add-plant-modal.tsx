import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { createPlant, updatePlant } from "@/store/plantSlice";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Models, ID } from "appwrite";
import { Plant } from "@/types/plant.type";
import { storage } from "@/lib/appwrite";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plant?: Models.Document & Plant;
};

export default function AddPlantModal({ open, onOpenChange, plant }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { currUid } = useSelector((state: RootState) => state.app);

  const [name, setName] = useState("");
  const [lastWateredAt, setLastWateredAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [headerFile, setHeaderFile] = useState<File | null>(null);

  useEffect(() => {
    if (plant) {
      setName(plant.name);
      setLastWateredAt(
        new Date(plant.lastWateredAt).toISOString().slice(0, 16)
      );
    } else {
      setName("");
      setLastWateredAt(new Date().toISOString().slice(0, 16));
    }
    setHeaderFile(null);
  }, [plant]);

  const handleSubmit = async () => {
    if (!currUid || !name) return;

    let headerImageId: string | undefined;

    if (headerFile) {
      try {
        if (plant?.headerImage) {
          try {
            await storage.deleteFile("plant_header_images", plant.headerImage);
          } catch (err) {
            console.warn("Failed to delete old header image:", err);
          }
        }

        const uploaded = await storage.createFile(
          "plant_header_images",
          ID.unique(),
          headerFile
        );
        headerImageId = uploaded.$id;
      } catch (error) {
        console.error("Error uploading new header image:", error);
      }
    }

    if (plant) {
      await dispatch(
        updatePlant({
          id: plant.$id,
          data: {
            name,
            lastWateredAt: new Date(lastWateredAt),
            headerImage: headerImageId ? headerImageId : undefined,
          },
        })
      );
    } else {
      await dispatch(
        createPlant({
          uid: currUid,
          name,
          lastWateredAt: new Date(lastWateredAt),
          headerImage: headerImageId ? headerImageId : undefined,
        })
      );
    }

    onOpenChange(false);
  };

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {plant ? "Edit Plant" : "Add New Plant"}
            </ModalHeader>
            <ModalBody>
              <Input
                label="Plant Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter plant name"
              />
              <Input
                label="Last Watered At"
                type="datetime-local"
                value={lastWateredAt}
                onChange={(e) => setLastWateredAt(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Header Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setHeaderFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                {plant ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
