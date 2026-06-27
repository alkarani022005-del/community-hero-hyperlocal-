const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/auth');

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

router.post('/', protect, async (req, res) => {
  try {
    const { image } = req.body; // base64 string
    const result = await cloudinary.uploader.upload(image, {
      folder: 'community-hero',
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;