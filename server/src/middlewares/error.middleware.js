const notFound = (req, res, next) => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
    if (err.name === "MulterError" || ["LIMIT_FILE_SIZE", "LIMIT_UNEXPECTED_FILE"].includes(err.code)) {
        return res.status(400).json({ message: err.code === "LIMIT_FILE_SIZE" ? "Uploaded image exceeds the 5 MB limit" : "Invalid upload" });
    }
    console.error(err.stack);
    if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
    }
    if (err.name === "CastError") {
        return res.status(400).json({ message: `Invalid id: ${err.value}` });
    }
    res.status(500).json({ message: err.message || "Server error" });
};

module.exports = { notFound, errorHandler };
