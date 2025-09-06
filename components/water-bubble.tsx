import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Models } from "appwrite";
import { PlantWithImages } from "@/types/plant.type";
import { AppDispatch } from "@/store";
import { updatePlant } from "@/store/plantSlice";

function getWaterColor(lastWateredAt: string) {
  const today = new Date();
  const last = new Date(lastWateredAt);
  const diffDays = Math.floor(
    (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 2) return "#819A91";
  if (diffDays <= 5) return "#D1D8BE";
  if (diffDays <= 8) return "#FEE2AD";
  if (diffDays <= 12) return "#FFC7A7";
  return "#F08787";
}

function getDaysWithoutWatering(lastWateredAt: string) {
  const today = new Date();
  const last = new Date(lastWateredAt);
  return Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

type WaterBubbleProps = {
  plant: Models.Document & PlantWithImages;
  width?: number | string; // accepts px or tailwind-like values
  height?: number | string;
};

export default function WaterBubble({
  plant,
  width = 40, // default 40px (same as w-10)
  height = 32, // default 32px (same as h-8)
}: WaterBubbleProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [lastWateredAt, setLastWateredAt] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const handleSave = () => {
    dispatch(
      updatePlant({
        id: plant.$id,
        data: { lastWateredAt: new Date(lastWateredAt) },
      })
    );
    setIsOpen(false);
  };

  const daysWithoutWatering = getDaysWithoutWatering(
    plant.lastWateredAt.toString()
  );

  return (
    <>
      {/* The bubble */}
      <button
        className="rounded-full shadow-md flex items-center justify-center text-white font-bold transition-colors"
        style={{
          width,
          height,
          backgroundColor: getWaterColor(plant.lastWateredAt.toString()),
        }}
        onClick={() => setIsOpen(true)}
        title={`${daysWithoutWatering} day(s) since last watering`}
      >
        {daysWithoutWatering}
      </button>

      {/* Modal */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen} placement="top-center">
        <ModalContent>
          <ModalHeader>water {plant.name}</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <Input
              label="last watered at"
              type="datetime-local"
              value={lastWateredAt}
              onChange={(e) => setLastWateredAt(e.target.value)}
            />
            <Button color="primary" onPress={handleSave} className="text-white">
              save
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
