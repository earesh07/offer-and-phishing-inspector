import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { runForensicScan, inspectUrlDirectly } from './server/inspect.js';
import { createExtensionZipBuffer, generateExtensionFiles } from './server/extensionBuilder.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Offer & Phishing Inspector Engine' });
  });

  // API: Full Forensic Offer & Rental Scanner
  app.post('/api/scan', async (req, res) => {
    try {
      const { text, url, senderEmail } = req.body;
      if (!text && !url) {
        return res.status(400).json({ error: 'Please provide either text or a URL to scan.' });
      }

      const result = await runForensicScan(text || '', url, senderEmail);
      res.json(result);
    } catch (err: any) {
      console.error('Scan error:', err);
      res.status(500).json({ error: err.message || 'Internal inspection error' });
    }
  });

  // API: Rapid URL Real-Time Analysis (for Browser Extension & Quick Lookups)
  app.post('/api/inspect-url', (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required.' });
      }

      const result = inspectUrlDirectly(url);
      res.json(result);
    } catch (err: any) {
      console.error('URL inspection error:', err);
      res.status(500).json({ error: err.message || 'URL inspection error' });
    }
  });

  // API: Extension Source Files (for in-app inspection)
  app.get('/api/extension/files', (req, res) => {
    try {
      const files = generateExtensionFiles();
      res.json(files);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate extension files' });
    }
  });

  // API: Download Chrome Extension ZIP package
  app.get('/api/extension/download', async (req, res) => {
    try {
      const zipBuffer = await createExtensionZipBuffer();
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="offer-phishing-inspector-extension.zip"');
      res.setHeader('Content-Length', zipBuffer.length);
      res.send(zipBuffer);
    } catch (err: any) {
      console.error('ZIP generation error:', err);
      res.status(500).json({ error: 'Failed to create extension zip archive' });
    }
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Security Inspector server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
