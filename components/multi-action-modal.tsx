// src/components/bulk-action-modal.tsx
import { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalContent,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updatePlant, addJourneyEntry } from "@/store/plantSlice";

interface BulkActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  actionType: "water" | "fertilize" | "repot";
  onCloseComplete?: () => void;
}

export default function MultiActionModal({
  open,
  onOpenChange,
  selectedIds,
  actionType,
  onCloseComplete,
}: BulkActionModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [date, setDate] = useState<string>("");

  const handleSubmit = async () => {
    if (!date) return;

    const fieldMap: Record<typeof actionType, string> = {
      water: "lastWateredAt",
      fertilize: "lastFertilizedAt",
      repot: "lastRepottedAt",
    };

    for (const id of selectedIds) {
      await dispatch(
        updatePlant({
          id,
          data: { [fieldMap[actionType]]: new Date(date) },
        })
      );
    }

    onOpenChange(false);
    onCloseComplete?.(); // <-- call after save
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) onCloseComplete?.(); // <-- call after close
      }}
      placement="top-center"
    >
      <ModalContent>
        <ModalHeader>
          {actionType === "water"
            ? "Water Plants"
            : actionType === "fertilize"
              ? "Fertilize Plants"
              : "Repot Plants"}
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-500">
            Set a date for {selectedIds.length} selected plants:
          </p>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            variant="flat"
            onPress={() => {
              onOpenChange(false);
              onCloseComplete?.(); // <-- call after cancel
            }}
          >
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit} isDisabled={!date}>
            Apply
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
