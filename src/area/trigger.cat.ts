import { CatService } from "../services/cat.service";
import { AreaTriggerResult } from "../types/area";

export async function catImageTrigger(): Promise<AreaTriggerResult> {
  const catImage = await CatService.generateImage();

  return {
    imageUrl: catImage.url,
  };
}
