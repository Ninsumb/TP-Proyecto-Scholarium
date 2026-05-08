import { CRUDService } from "./CRUDService";
import type{ Portal } from "../types/Portal";

class PortalesService extends CRUDService<Portal> {
    constructor() {
        super('portales')
    }
}

export const portalesService = new PortalesService()