import { storage, ID } from "../appwrite";
import { enroll } from "../apis/fingerprint/enroll";

const LOCAL_BRIDGE_URL = 'http://127.0.0.1:8080/api/scanner';

export const ANGLES = [
  { label: "Place finger STRAIGHT (centered)", suffix: "straight" },
  { label: "Tilt finger slightly LEFT", suffix: "tilted_left" },
  { label: "Flatten finger (wider area)", suffix: "flat" },
];

export async function captureAngle(studentId: string, suffix: string) {
  const res = await fetch(`${LOCAL_BRIDGE_URL}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: studentId, angle: suffix }),
  });
  return res.json();
}

export async function uploadTemplate(template: string) {
  const file = new File([template], 'fingerprint-template.txt', { type: 'text/plain' });
  const uploaded = await storage.createFile(
    import.meta.env.VITE_APPWRITE_MEDIA_BUCKET_ID!,
    ID.unique(),
    file
  );
  return uploaded.$id;
}

// Capture ONE angle with retry (matching enroll.js lines 28-45)
// Returns fileId from Appwrite Storage on success
export async function captureAndUploadAngle(studentId: string, suffix: string): Promise<string> {
  let data = await captureAngle(studentId, suffix);

  if (!data.success) {
    data = await captureAngle(studentId, suffix);
    if (!data.success) {
      throw new Error(`Failed to capture ${suffix}: ${data.message}`);
    }
  }

  return uploadTemplate(data.template);
}

// Save all 3 uploaded file IDs to the database
export async function finalizeEnrollment(studentId: string, uploaded: string[]) {
  return enroll(studentId, {
    template: uploaded[0],
    template_tilted: uploaded[1],
    template_flat: uploaded[2],
  });
}

export async function identifyFingerprint(): Promise<any> {
  const bridgeResponse = await fetch(`${LOCAL_BRIDGE_URL}/identify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  return bridgeResponse.json();
}