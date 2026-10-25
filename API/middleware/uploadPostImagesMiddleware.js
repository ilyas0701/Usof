import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024, files: 5}
}).array("images", 5);

function uploadPostImagesMiddleware(req, res, next) {
    upload(req, res, error => {
        if (error) {
            return res.status(400).json({message: error.message});
        }

        next();
    });
}

export default uploadPostImagesMiddleware;
