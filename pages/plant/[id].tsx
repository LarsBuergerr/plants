import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch, RootState } from "@/store";
import DefaultLayout from "@/layouts/default";
import { fetchPlantById } from "@/store/plantSlice";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import AddPlantModal from "@/components/add-plant-modal";
import WaterBubble from "@/components/water-bubble";

export default function PlantPage() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { plants, loading } = useSelector((state: RootState) => state.plants);
  const plant = plants.find((p) => p.$id === id);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string" && !plant) {
      dispatch(fetchPlantById({ id }));
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

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 max-w-3xl mx-auto py-8">
        <div className="flex w-full justify-between items-center">
          <h1 className="text-3xl font-bold font-serif">{plant.name}</h1>
          <WaterBubble plant={plant} width={55} height={40} />
        </div>
        <p className="text-gray-500">
          Last watered: {new Date(plant.lastWateredAt).toLocaleDateString()}
        </p>

        {plant.headerImageUrl && (
          <div className="w-full aspect-square rounded-xl overflow-hidden">
            <Image
              src={plant.headerImageUrl}
              alt={plant.name}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="flat"
            onPress={() => {
              setIsModalOpen(true);
            }}
          >
            edit
          </Button>
        </div>
      </section>
      <AddPlantModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        plant={plant}
      />
    </DefaultLayout>
  );
}
