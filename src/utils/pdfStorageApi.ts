/**
 * PDF Storage & Cloud API Handler
 * Handles permanent cloud uploads via Cloudinary API, Google Drive direct link conversions,
 * and IndexedDB local binary caching.
 */

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

const STORAGE_SETTINGS_KEY = 'pdfmaster_storage_config';

export function getPdfStorageConfig(): CloudinaryConfig {
  try {
    const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return {
    cloudName: '',
    uploadPreset: ''
  };
}

export function savePdfStorageConfig(config: CloudinaryConfig): void {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(config));
  } catch {}
}

/**
 * Converts any Google Drive or Dropbox sharing link into an instant direct download link.
 * Examples:
 * https://drive.google.com/file/d/1A2B3C/view?usp=sharing -> https://drive.google.com/uc?export=download&id=1A2B3C
 * https://drive.google.com/open?id=1A2B3C -> https://drive.google.com/uc?export=download&id=1A2B3C
 */
export function formatCloudPdfUrl(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  // Google Drive format 1: /file/d/<id>/
  const driveMatch1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch1 && driveMatch1[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch1[1]}`;
  }

  // Google Drive format 2: id=<id>
  const driveMatch2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && driveMatch2 && driveMatch2[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch2[1]}`;
  }

  // Dropbox format: dl=0 -> dl=1
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    return trimmed.replace('dl=0', 'dl=1');
  }

  return trimmed;
}

/**
 * Checks if a URL is a valid permanent cloud download link (not empty, not blob:, not localhost)
 */
export function isValidCloudPdfUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('blob:')) return false;
  if (trimmed.startsWith('data:')) return false;
  if (trimmed.startsWith('/api/files/') || trimmed.startsWith('/uploads/')) return true;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Direct browser-to-Cloudinary raw/PDF upload API
 * Uploads large PDF files (up to 100MB) directly to Cloudinary without hitting server limits.
 */
export function uploadPdfToCloudinary(
  file: File | Blob,
  config?: CloudinaryConfig,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; url: string; fileName: string; size: number }> {
  return new Promise((resolve, reject) => {
    const activeConfig = config?.cloudName ? config : getPdfStorageConfig();
    const cloudName = activeConfig.cloudName.trim();
    const uploadPreset = activeConfig.uploadPreset.trim();

    if (!cloudName || !uploadPreset) {
      reject(new Error('Cloudinary Cloud Name ya Upload Preset configure nahi hai. Kripya Admin > API Keys tab me enter karein ya Google Drive link use karein.'));
      return;
    }

    const originalName = (file as File).name || 'document.pdf';
    const cleanPublicId = originalName.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('public_id', `${Date.now()}_${cleanPublicId}`);

    const xhr = new XMLHttpRequest();
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.min(Math.round((event.loaded / event.total) * 100), 99);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          const secureUrl = res.secure_url || res.url;
          if (secureUrl) {
            if (onProgress) onProgress(100);
            resolve({
              success: true,
              url: secureUrl,
              fileName: originalName,
              size: (file as File).size || res.bytes || 0
            });
            return;
          }
        } catch (e) {
          reject(new Error('Cloudinary response parsing failed'));
        }
      }
      reject(new Error(`Cloudinary upload failed: ${xhr.statusText || xhr.responseText}`));
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading to Cloudinary'));
    };

    xhr.open('POST', endpoint, true);
    xhr.send(formData);
  });
}

/**
 * IndexedDB Binary Cache for persistent in-browser storage of original uploaded PDF files.
 * Works offline and preserves the exact binary file even if offline or between refreshes.
 */
const DB_NAME = 'aldahr_pdf_storage';
const STORE_NAME = 'pdf_files';

function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'productId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function storeOriginalPdfLocally(productId: string, file: Blob, fileName: string): Promise<void> {
  try {
    const db = await openIndexedDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ productId, blob: file, fileName, timestamp: Date.now() });
  } catch (err) {
    console.warn('IndexedDB store notice:', err);
  }
}

export async function getOriginalPdfLocally(productId: string): Promise<{ blob: Blob; fileName: string } | null> {
  try {
    const db = await openIndexedDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(productId);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve({ blob: req.result.blob, fileName: req.result.fileName || 'document.pdf' });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
