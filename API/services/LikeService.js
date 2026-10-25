import LikeModel from "../models/LikeModel.js";
import UserModel from "../models/UserModel.js";
import HttpError from "../utils/HttpError.js";

class LikeService {
    static async findAll() {
        return LikeModel.findAll();
    }

    static async delete(id) {
        const likeId = Number(id);

        if (!Number.isSafeInteger(likeId) || likeId <= 0) {
            throw new HttpError(400, "Invalid like id");
        }

        if (!await LikeModel.delete(likeId)) {
            throw new HttpError(404, "Like does not exist");
        }

        await UserModel.refreshRatings();
    }
}

export default LikeService;
