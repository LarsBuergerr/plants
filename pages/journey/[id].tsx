import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch, RootState } from "@/store";
import DefaultLayout from "@/layouts/default";
import { fetchPlantById } from "@/store/plantSlice";
import { Button } from "@heroui/button";

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
          <h1 className="text-3xl font-bold font-serif">
            {plant.name}'s jorney
          </h1>
          <div className="flex gap-2 items-center">
            <Button variant="flat" onPress={() => setIsModalOpen(true)}>
              add entry
            </Button>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
