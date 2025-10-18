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
  const [botanicalName, setBotanicalName] = useState("");
  const [lastWateredAt, setLastWateredAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [lastFertilizedAt, setLastFertilizedAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [lastRepottedAt, setLastRepottedAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plant) {
      setName(plant.name);
      setBotanicalName(plant.botanicalName || "");
      setLastWateredAt(
        new Date(plant.lastWateredAt).toISOString().slice(0, 16)
      );
      if (plant.lastFertilizedAt) {
        setLastFertilizedAt(
          new Date(plant.lastFertilizedAt).toISOString().slice(0, 16)
        );
      }
      if (plant.lastRepottedAt) {
        setLastRepottedAt(
          new Date(plant.lastRepottedAt).toISOString().slice(0, 16)
        );
      }
    } else {
      setName("");
      setLastWateredAt(new Date().toISOString().slice(0, 16));
    }
    setHeaderFile(null);
  }, [plant, open]);

  const handleCancel = () => {
    onOpenChange(false);
    setHeaderFile(null);
    setBotanicalName("");
    setName("");
    setLastWateredAt(new Date().toISOString().slice(0, 16));
    setLastFertilizedAt(new Date().toISOString().slice(0, 16));
    setLastRepottedAt(new Date().toISOString().slice(0, 16));
  };

  const handleSubmit = async () => {
    if (!currUid || !name) return;
    setLoading(true);

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

    try {
      if (plant) {
        await dispatch(
          updatePlant({
            id: plant.$id,
            data: {
              name,
              botanicalName,
              lastWateredAt: new Date(lastWateredAt),
              lastFertilizedAt: new Date(lastFertilizedAt),
              lastRepottedAt: new Date(lastRepottedAt),
              headerImage: headerImageId ? headerImageId : undefined,
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          createPlant({
            uid: currUid,
            name,
            botanicalName,
            lastWateredAt: new Date(lastWateredAt),
            lastFertilizedAt: new Date(lastFertilizedAt),
            lastRepottedAt: new Date(lastRepottedAt),
            headerImage: headerImageId ? headerImageId : undefined,
          })
        ).unwrap();
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating/updating plant:", error);
    } finally {
      setLoading(false);
      setHeaderFile(null);
      setBotanicalName("");
      setName("");
      setLastWateredAt(new Date().toISOString().slice(0, 16));
      setLastFertilizedAt(new Date().toISOString().slice(0, 16));
      setLastRepottedAt(new Date().toISOString().slice(0, 16));
    }
  };

  return (
    <Modal isOpen={open} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {plant ? "edit plant" : "add new plant"}
            </ModalHeader>
            <ModalBody>
              <Input
                label="plant name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="enter plant name"
              />
              <Input
                label="botanical name"
                value={botanicalName}
                onChange={(e) => setBotanicalName(e.target.value)}
                placeholder="enter botanical name"
              />
              <Input
                label="last watered at"
                type="datetime-local"
                value={lastWateredAt}
                onChange={(e) => setLastWateredAt(e.target.value)}
              />
              <Input
                label="last fertilized at"
                type="datetime-local"
                value={lastFertilizedAt}
                onChange={(e) => setLastFertilizedAt(e.target.value)}
              />
              <Input
                label="last repotted at"
                type="datetime-local"
                value={lastRepottedAt}
                onChange={(e) => setLastRepottedAt(e.target.value)}
              />

              <Input
                placeholder="upload header image"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setHeaderFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button
                onPress={handleCancel}
                color="secondary"
                className="text-white"
                disabled={loading}
              >
                cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                className="text-white"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? "saving..." : plant ? "update" : "save"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
