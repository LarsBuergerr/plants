import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch, RootState } from "@/store";
import DefaultLayout from "@/layouts/default";
import { fetchPlantById, deletePlantById } from "@/store/plantSlice";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import AddPlantModal from "@/components/add-plant-modal";
import WaterBubble from "@/components/water-bubble";
import { EditIcon, SendIcon, TrashIcon } from "@/components/icons";

import {
  Droplets,
  FlaskConical,
  Archive,
  Route,
  Trash2,
  SquarePen,
} from "lucide-react";

export default function PlantPage() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { plants, loading } = useSelector((state: RootState) => state.plants);
  const plant = plants.find((p) => p.$id === id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string" && !plant) {
      try {
        dispatch(fetchPlantById({ id }));
      } catch (error) {
        console.error("Failed to fetch plant:", error);
      }
    }
  }, [id, plant, dispatch]);

  if (loading || !plant) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-96">
          <p>Loading plant...</p>
        </div>
      </DefaultLayout>
    );
  }

  const handleDelete = () => {
    dispatch(deletePlantById({ id: plant.$id }));
    setIsDeleteModalOpen(false);
    router.push("/");
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-3 max-w-3xl mx-auto py-8">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold font-serif">
            {plant.name}
          </h1>

          <div className="flex gap-2 items-center">
            <Button
              variant="flat"
              color="danger"
              isIconOnly
              onPress={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 width={20} />
            </Button>

            <Button
              variant="flat"
              onPress={() => setIsModalOpen(true)}
              isIconOnly
            >
              <SquarePen width={20} />
            </Button>

            <Button
              color="primary"
              className="text-white width-sm"
              onPress={() => router.push(`/journey/${plant.$id}`)}
            >
              <span className="hidden md:inline">journey</span>
              <Route width={20} />
            </Button>
          </div>
        </div>
        <p className="text-default-500">{plant.botanicalName}</p>
        <p className="text-default-500">
          last watered: {new Date(plant.lastWateredAt).toLocaleDateString()}
        </p>

        <div className="flex gap-4 justify-between">
          <div className="flex gap-2 items-center">
            <Droplets />
            <WaterBubble plant={plant} width={55} height={35} />
          </div>
          <div className="flex gap-2 items-center">
            <FlaskConical />
            <WaterBubble plant={plant} width={55} height={35} />
          </div>
          <div className="flex gap-2 items-center">
            <Archive />
            <WaterBubble plant={plant} width={55} height={35} />
          </div>
        </div>

        {plant.headerImageUrl && (
          <div className="w-full aspect-square rounded-xl overflow-hidden">
            <Image
              src={plant.headerImageUrl}
              alt={plant.name}
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </section>

      {/* Edit plant modal */}
      <AddPlantModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        plant={plant}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        placement="top-center"
      >
        <ModalContent>
          <ModalHeader>delete plant</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete "{plant.name}"? This action cannot
              be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
}
