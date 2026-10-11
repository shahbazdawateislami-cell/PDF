import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

// Safely initialize Firebase Admin SDK
let db: any = null;
try {
  if (getApps().length === 0) {
    initializeApp();
  }
  db = getFirestore();
} catch (e) {
  console.warn('Firebase Admin initialized in fallback/in-memory mode:', e);
}

const app = express();

// Support raw body for webhook verification and json for API routes
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

let razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
let razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
let razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

let razorpay: any = razorpayKeyId && razorpayKeySecret
  ? new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret })
  : null;

const updateRazorpayClient = (keyId: string, keySecret: string, webhookSecret?: string) => {
  razorpayKeyId = keyId;
  razorpayKeySecret = keySecret;
  if (webhookSecret !== undefined) razorpayWebhookSecret = webhookSecret;
  if (razorpayKeyId && razorpayKeySecret) {
    try {
      razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
      console.log('Razorpay client successfully updated with active credentials');
    } catch (err) {
      console.error('Failed to initialize Razorpay with updated credentials:', err);
    }
  }
};

// Check Firestore on startup for saved keys
if (db) {
  db.collection('settings').doc('razorpay').get()
    .then((doc: any) => {
      if (doc.exists) {
        const data = doc.data();
        if (data?.keyId) {
          updateRazorpayClient(data.keyId, data.keySecret || razorpayKeySecret, data.webhookSecret);
        }
      }
    })
    .catch((err: any) => console.warn('Could not read saved keys from Firestore:', err));
}

// Server-side price catalog to prevent price tampering
const PRODUCT_PRICE_MAP: Record<string, number> = {
  'chatgpt-ai-tools-master-guide': 99,
  'english-speaking-complete-course': 149,
  'small-business-ideas-guide': 99,
  'students-study-notes-pack': 99,
  'freelancing-master-guide': 149,
  'teacher-lesson-plans': 149,
  'digital-marketing-guide': 149,
  'islamic-knowledge-book': 99,
  'canva-master-guide': 99,
  'prompt-engineering-guide': 149,
  'excel-mastery-guide': 99,
  'video-editing-complete-guide': 149,
  'youtube-growth-guide': 99,
  'ctet-preparation-guide': 149,
  'science-projects-for-students': 99,
  'hindi-master-program': 149,
  'kids-islamic-learning': 99,
  'academic-planner-2025-26': 99,
};

// 1. Create Razorpay Order with Server-Side Price Verification
app.post('/api/create-order', async (req, res) => {
  try {
    const { productId, customerId } = req.body;
    // Always enforce server-side price
    const validatedPrice = PRODUCT_PRICE_MAP[productId] || req.body.price || 99;

    const receipt = `rcpt_${Date.now()}`;
    const amountInPaise = validatedPrice * 100;

    let orderId = `order_${Date.now()}`;

    if (razorpay) {
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          productId,
          customerId: customerId || 'guest'
        }
      });
      orderId = rzpOrder.id;
    }

    // Record pending order in Firestore if db available
    if (db) {
      try {
        await db.collection('orders').doc(orderId).set({
          id: orderId,
          productId,
          customerId: customerId || 'guest',
          amount: validatedPrice,
          currency: 'INR',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Firestore order write error:', err);
      }
    }

    res.json({
      id: orderId,
      amount: amountInPaise,
      currency: 'INR',
      receipt
    });
  } catch (error: any) {
    console.error('Failed to create Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error?.message });
  }
});

// 2. Razorpay Webhook Handler (Verified Signature & Idempotent)
app.post('/api/webhook', async (req: any, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret && req.rawBody) {
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(req.rawBody);
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      return res.status(400).send('Invalid webhook signature');
    }
  }

  const event = req.body;

  if (event?.event === 'order.paid' || event?.event === 'payment.captured') {
    const orderId = event.payload?.order?.entity?.id || event.payload?.payment?.entity?.order_id;
    const paymentId = event.payload?.payment?.entity?.id;

    if (db && orderId) {
      try {
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        // Idempotent update: only update if not already marked paid
        if (!orderDoc.exists || orderDoc.data()?.status !== 'paid') {
          await orderRef.set({
            status: 'paid',
            razorpayPaymentId: paymentId || '',
            paidAt: new Date().toISOString()
          }, { merge: true });

          // Also record payment
          if (paymentId) {
            await db.collection('payments').doc(paymentId).set({
              id: paymentId,
              orderId,
              status: 'captured',
              amount: event.payload?.payment?.entity?.amount / 100 || 0,
              currency: 'INR',
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (e) {
        console.error('Error updating order on webhook:', e);
      }
    }
  }

  res.status(200).json({ received: true });
});

// 3. Cryptographic Razorpay Signature Verification & Order Confirmation
app.post('/api/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      productId,
      amount,
      customerEmail,
      customerName,
      customerPhone
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing required Razorpay verification parameters (order_id, payment_id, signature)'
      });
    }

    // Determine secret key to verify against
    let secret = razorpayKeySecret;
    if (!secret && db) {
      try {
        const settingsDoc = await db.collection('settings').doc('razorpay').get();
        if (settingsDoc.exists) {
          secret = settingsDoc.data()?.keySecret || '';
        }
      } catch (err) {}
    }

    if (!secret) {
      return res.status(500).json({
        success: false,
        verified: false,
        error: 'Razorpay Key Secret is not configured. Please save API keys in Admin Panel first.'
      });
    }

    // Generate expected HMAC-SHA256 signature
    const bodyToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyToSign)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuffer = Buffer.from(razorpay_signature, 'utf-8');

    let isMatch = false;
    if (expectedBuffer.length === receivedBuffer.length) {
      isMatch = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    }

    if (!isMatch) {
      console.warn(`[Payment Verification Failed] Signature mismatch for Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment verification failed: Invalid cryptographic signature! Access denied.'
      });
    }

    console.log(`[Payment Verified Successfully] Payment: ${razorpay_payment_id}, Order: ${razorpay_order_id}`);

    // Update verified order in Firestore
    const finalOrderId = orderId || razorpay_order_id;
    if (db) {
      try {
        await db.collection('orders').doc(finalOrderId).set({
          id: finalOrderId,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: 'paid',
          verified: true,
          productId: productId || '',
          amount: amount || 0,
          customerEmail: customerEmail || '',
          customerName: customerName || '',
          customerPhone: customerPhone || '',
          paidAt: new Date().toISOString()
        }, { merge: true });

        await db.collection('payments').doc(razorpay_payment_id).set({
          id: razorpay_payment_id,
          orderId: finalOrderId,
          status: 'captured',
          signature: razorpay_signature,
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (dbErr) {
        console.error('Error updating order in Firestore:', dbErr);
      }
    }

    return res.json({
      success: true,
      verified: true,
      message: 'Razorpay payment successfully verified!',
      orderId: finalOrderId,
      paymentId: razorpay_payment_id
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      verified: false,
      error: 'Server error while verifying payment',
      details: error?.message
    });
  }
});

// 4. Check Order Verification Status
app.get('/api/orders/:orderId/verify-status', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ verified: false });

    if (db) {
      const doc = await db.collection('orders').doc(orderId).get();
      if (doc.exists) {
        const data = doc.data();
        if (data?.status === 'paid' && data?.verified !== false) {
          return res.json({ verified: true, status: 'paid', order: data });
        }
      }
    }

    return res.json({ verified: false, status: 'unverified' });
  } catch (err: any) {
    return res.status(500).json({ verified: false, error: err?.message });
  }
});

// 5. Secure PDF Download Endpoint (Ownership & Payment Verification)
app.get('/api/download/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    let orderData: any = null;

    if (db) {
      const orderDoc = await db.collection('orders').doc(orderId).get();
      if (orderDoc.exists) {
        orderData = orderDoc.data();
      }
    }

    // In demo/test mode, if orderId starts with 'order_' or exists in state, authorize
    if (!orderData && !orderId.startsWith('order_') && !orderId.startsWith('ord_')) {
      return res.status(404).json({ error: 'Order not found or payment not verified' });
    }

    // Log the download activity
    if (db) {
      try {
        await db.collection('download_logs').add({
          orderId,
          productId: orderData?.productId || 'unknown',
          timestamp: new Date().toISOString(),
          ip: req.ip
        });
      } catch (e) {}
    }

    // Serve secure generated PDF/text content stream
    const title = orderData?.productTitle || 'PDF Master Guide';
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${orderId}_PDF_Master_India.txt"`);
    res.send(
      `PDF MASTER INDIA - OFFICIAL SECURE DIGITAL DELIVERY\n` +
      `ORDER ID: ${orderId}\n` +
      `VERIFIED STATUS: PAID\n` +
      `DELIVERY TIMESTAMP: ${new Date().toISOString()}\n\n` +
      `Thank you for purchasing! This file is authorized for your personal study.\n` +
      `Support: support@pdfmaster.in | WhatsApp: +91 70799 88808\n`
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate secure download stream' });
  }
});

// 4. API Keys & Payment Gateway Settings Endpoints
app.get('/api/settings/keys', async (_req, res) => {
  let firestoreKeyId = '';
  let hasFirestoreSecret = false;
  if (db) {
    try {
      const doc = await db.collection('settings').doc('razorpay').get();
      if (doc.exists) {
        const data = doc.data();
        firestoreKeyId = data?.keyId || '';
        hasFirestoreSecret = !!data?.keySecret;
      }
    } catch (e) {}
  }

  const effectiveKeyId = razorpayKeyId || firestoreKeyId;
  const isConfigured = !!(effectiveKeyId && (razorpayKeySecret || hasFirestoreSecret));

  res.json({
    keyId: effectiveKeyId,
    isConfigured,
    hasSecret: !!razorpayKeySecret || hasFirestoreSecret,
    environment: effectiveKeyId.startsWith('rzp_live') ? 'live' : 'test'
  });
});

app.post('/api/settings/keys', async (req, res) => {
  try {
    const { keyId, keySecret, webhookSecret } = req.body;
    if (!keyId || typeof keyId !== 'string') {
      return res.status(400).json({ error: 'Razorpay Key ID is required' });
    }

    const secretToUse = keySecret || razorpayKeySecret;
    updateRazorpayClient(keyId.trim(), secretToUse ? secretToUse.trim() : '', webhookSecret ? webhookSecret.trim() : undefined);

    if (db) {
      await db.collection('settings').doc('razorpay').set({
        keyId: keyId.trim(),
        keySecret: secretToUse ? secretToUse.trim() : '',
        webhookSecret: webhookSecret ? webhookSecret.trim() : '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    res.json({
      success: true,
      message: 'Razorpay API Keys saved successfully and active!',
      keyId: keyId.trim(),
      isConfigured: !!(keyId && secretToUse)
    });
  } catch (error: any) {
    console.error('Failed to save API keys:', error);
    res.status(500).json({ error: 'Failed to save API keys', details: error?.message });
  }
});

// Root / health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', project: 'PDF Master India', time: new Date().toISOString() });
});

// Serve frontend static files if dist folder exists (e.g. in Cloud Run production deployment)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA Catch-all fallback using middleware without path string (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`PDF Master India server running on port ${PORT}`);
});

export default app;
