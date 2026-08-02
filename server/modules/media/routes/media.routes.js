const express = require('express');
const mediaController = require('../controllers/media.controller');

const router = express.Router();

router.post('/info', async (req, res, next) => {
  try {
    const result = await mediaController.getInfo(req.body?.url);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/download', async (req, res, next) => {
  try {
    const result = await mediaController.createDownload(req.body?.url, req.body?.quality);
    res.status(202).json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/status/:jobId', async (req, res, next) => {
  try {
    const result = await mediaController.getDownloadStatus(req.params.jobId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.get('/files/:jobId', async (req, res, next) => {
  try {
    const fileInfo = await mediaController.getFilePath(req.params.jobId);
    res.download(fileInfo.filePath, fileInfo.fileName);
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

module.exports = router;
