const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { dbHelper, bucket } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'zentrio_jwt_secret_key_18273645';

// Authenticate Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbHelper.users.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Session expired or user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Upload auth error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

// Ensure uploads directory exists for fallback local storage
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Config (Memory storage so we can upload to Firebase bucket if initialized)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const extension = path.extname(originalName);
    const fileName = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${extension}`;
    const mimeType = req.file.mimetype;

    // Standard local fallback URL
    const localFilePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(localFilePath, fileBuffer);
    const localUrl = `/uploads/${fileName}`;

    let finalUrl = localUrl;
    let isFirebaseStored = false;

    // If Firebase Admin SDK storage is initialized, upload there
    if (bucket) {
      try {
        console.log(`🔥 Uploading file ${fileName} to Firebase Storage...`);
        const firebaseFile = bucket.file(`uploads/${fileName}`);
        
        await firebaseFile.save(fileBuffer, {
          metadata: {
            contentType: mimeType,
            metadata: {
              originalName: originalName,
              uploadedBy: req.user.username
            }
          }
        });

        // Make file public if possible, or fallback to signed URLs
        try {
          await firebaseFile.makePublic();
          finalUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${fileName}`;
        } catch (e) {
          // Fallback to a signed URL if public access is restricted on the bucket policy
          console.warn('⚠️ Bucket public policy restriction, generating signed URL instead.');
          const [signedUrl] = await firebaseFile.getSignedUrl({
            action: 'read',
            expires: '03-09-2491' // far future
          });
          finalUrl = signedUrl;
        }

        isFirebaseStored = true;
        console.log(`✅ Uploaded to Firebase Storage: ${finalUrl}`);
      } catch (firebaseErr) {
        console.error('❌ Failed to upload to Firebase Storage, using local fallback:', firebaseErr.message);
      }
    } else {
      console.warn('⚠️ Firebase Storage is not initialized. Saved locally at ' + localUrl);
    }

    return res.json({
      success: true,
      message: 'File processed successfully.',
      fileName: originalName,
      url: finalUrl,
      isFirebaseStored
    });
  } catch (error) {
    console.error('File upload handler error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
