import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
}).single("avatar");

function uploadAvatarMiddleware(req, res, next) {
    upload(req, res, (error) => {
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        next();
    });
}

export default uploadAvatarMiddleware;
