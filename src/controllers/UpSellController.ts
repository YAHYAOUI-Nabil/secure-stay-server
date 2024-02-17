import { Request, Response } from "express";
import { UpSellServices } from "../services/UpSellService";

export class UpSellController {

    async createUpSell(request: Request, response: Response) {
        const saveUpSellService = new UpSellServices()
        const data = await saveUpSellService.saveUpSellInfo(request, response)
        return response.send(data)
    }

    async updateUpSell(request: Request, response: Response) {
        const updateUpSell = new UpSellServices()
        const data = await updateUpSell.updateUpSellInfo(request, response)
        return response.send(data)
    }

    async getUpSell(request: Request, response: Response) {
        const getUpSellService = new UpSellServices()
        const upSellInfo = await getUpSellService.getUpSellInfo(request, response)
        return response.send(upSellInfo)
    }

    async deleteUpSell(request: Request, response: Response) {
        const deleteUpSellServices = new UpSellServices()
        const data = await deleteUpSellServices.deleteUpSellInfo(request, response)
        return response.send(data)
    }
}