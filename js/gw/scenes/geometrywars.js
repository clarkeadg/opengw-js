
import { scene, RENDERPASS_PRIMARY } from "./../modules/scene"

const oglScene = new scene();

export const gw_init = () => {
  oglScene.init(); 
}

export const gw_update = () => {
  oglScene.run();
}

export const gw_render = () => {
  oglScene.draw(RENDERPASS_PRIMARY);
}

export const gw_release = () => {
}
