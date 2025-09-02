import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlants } from "@/store/plantSlice";
import { RootState, AppDispatch } from "@/store";

import { useEffect } from "react";

export default function IndexPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { currUid } = useSelector((state: RootState) => state.app);
  const { plants } = useSelector((state: RootState) => state.plants);

  useEffect(() => {
    const fetchPlantsData = async () => {
      if (typeof currUid === "string") {
        dispatch(fetchPlants(currUid));
      }
    };
    fetchPlantsData();
  }, [currUid]);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <span className={title()}>Plants&nbsp;</span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <Snippet key={plant.uid} className="p-4 border rounded-md">
              <h3 className={subtitle()}>{plant.name}</h3>
            </Snippet>
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}
