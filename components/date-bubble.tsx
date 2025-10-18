import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Models } from "appwrite";
import { PlantWithImages } from "@/types/plant.type";
import { AppDispatch } from "@/store";
import { updatePlant } from "@/store/plantSlice";

/** Calculate how many days have passed since the given date */
function getDaysDifference(date: string) {
  const today = new Date();
  const last = new Date(date);
  return Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

/** Watering bubble color logic */
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

type DateBubbleType = "water" | "fertilize" | "repot";

type DateBubbleProps = {
  plant: Models.Document & PlantWithImages;
  type: DateBubbleType;
  width?: number | string;
  height?: number | string;
};

export default function DateBubble({
  plant,
  type,
  width = 40,
  height = 32,
}: DateBubbleProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 16)
  );

  // define metadata for each bubble type
  const config = {
    water: {
      label: "watered",
      field: "lastWateredAt" as keyof PlantWithImages,
      color: (date: string) => getWaterColor(date),
      bordered: false,
    },
    fertilize: {
      label: "fertilized",
      field: "lastFertilizedAt" as keyof PlantWithImages,
      color: () => "transparent",
      bordered: true,
    },
    repot: {
      label: "repotted",
      field: "lastRepottedAt" as keyof PlantWithImages,
      color: () => "transparent",
      bordered: true,
    },
  }[type];

  const lastDate = plant[config.field]?.toString() ?? new Date().toISOString();
  const days = getDaysDifference(lastDate);
  const displayDays = days > 99 ? ">99" : days.toString();

  const handleSave = () => {
    dispatch(
      updatePlant({
        id: plant.$id,
        data: { [config.field]: new Date(selectedDate) },
      })
    );
    setIsOpen(false);
  };

  const buttonClasses = config.bordered
    ? "border-2 border-primary text-primary hover:bg-primary"
    : "text-white";

  return (
    <>
      <button
        className={`rounded-full shadow-md flex items-center justify-center font-bold transition-colors ${buttonClasses}`}
        style={{
          width,
          height,
          backgroundColor: config.bordered
            ? "transparent"
            : config.color(lastDate),
        }}
        onClick={() => setIsOpen(true)}
        title={`${days} day(s) since last ${config.label}`}
      >
        {displayDays}
      </button>

      <Modal isOpen={isOpen} onOpenChange={setIsOpen} placement="top-center">
        <ModalContent>
          <ModalHeader>
            {config.label} {plant.name}
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <Input
              label={`last ${config.label} at`}
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
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
