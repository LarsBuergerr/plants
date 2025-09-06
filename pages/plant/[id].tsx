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
import { SendIcon } from "@/components/icons";

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
      <section className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-3xl font-bold font-serif">{plant.name}</h1>
          <div className="flex gap-2 items-center">
            <Button
              variant="flat"
              color="danger"
              onPress={() => setIsDeleteModalOpen(true)}
            >
              delete
            </Button>
            <Button variant="flat" onPress={() => setIsModalOpen(true)}>
              edit
            </Button>
            <Button
              color="primary"
              className="text-white"
              onPress={() => router.push(`/journey/${plant.$id}`)}
            >
              journey
              <SendIcon></SendIcon>
            </Button>
          </div>
        </div>
        <p className="text-gray-500">
          Last watered: {new Date(plant.lastWateredAt).toLocaleDateString()}
        </p>

        <div className="flex gap-4 justify-between">
          <div className="flex gap-2 items-center">
            last watered
            <WaterBubble plant={plant} width={55} height={40} />
          </div>
          <div className="flex gap-2 items-center">
            last fertilized
            <WaterBubble plant={plant} width={55} height={40} />
          </div>
          <div className="flex gap-2 items-center">
            last repotted
            <WaterBubble plant={plant} width={55} height={40} />
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

      <Modal isOpen={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
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
