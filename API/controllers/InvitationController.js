import InvitationService from "../services/InvitationService.js";
import {sendErrorResponse} from "../utils/HttpError.js";

class InvitationController {
    static async invite(req, res) {
        try {
            const invitation = await InvitationService.invite(req.body);

            return res.status(201).json(invitation);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }

    static async accept(req, res) {
        try {
            const session = await InvitationService.accept(req.body);

            return res.status(201).json(session);
        } catch (error) {
            return sendErrorResponse(res, error);
        }
    }
}

export default InvitationController;
