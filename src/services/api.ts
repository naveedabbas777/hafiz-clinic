// API client helpers for Hafiz Clinic System & Cloudinary integrations

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: 'patient' | 'doctor' | 'admin';
    mrn?: string;
    phone?: string;
    specialization?: string;
  };
}

export interface CloudinaryUploadResponse {
  success: boolean;
  message?: string;
  url: string;
  videoUrl?: string;
  public_id?: string;
}

// Convert File to Base64 String
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Login API Call
export async function loginApi(usernameOrEmail: string, password: string, role?: 'patient' | 'doctor' | 'admin'): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameOrEmail, usernameOrEmail, password, role }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection error to authentication server' };
  }
}

// Patient Registration API Call
export async function registerPatientApi(data: {
  name: string;
  email?: string;
  password: string;
  phone?: string;
  username?: string;
}): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, role: 'patient' }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message || 'Registration failed' };
  }
}

export async function registerApi(username: string, password: string, role: 'patient' | 'doctor' | 'admin', name?: string, phone?: string): Promise<AuthResponse> {
  return registerPatientApi({
    username,
    password,
    name: name || username,
    phone,
    email: `${username}@hafizclinic.com`,
  });
}

// Upload Disease Image to Cloudinary via Express Server
export async function uploadDiseaseImageApi(fileOrBase64: File | string): Promise<CloudinaryUploadResponse> {
  let imageBase64 = '';
  if (typeof fileOrBase64 === 'string') {
    imageBase64 = fileOrBase64;
  } else {
    imageBase64 = await fileToBase64(fileOrBase64);
  }

  const res = await fetch('/api/upload/disease-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
  return await res.json();
}

// Upload Doctor Image to Cloudinary via Express Server
export async function uploadDoctorImageApi(fileOrBase64: File | string): Promise<CloudinaryUploadResponse> {
  let imageBase64 = '';
  if (typeof fileOrBase64 === 'string') {
    imageBase64 = fileOrBase64;
  } else {
    imageBase64 = await fileToBase64(fileOrBase64);
  }

  const res = await fetch('/api/upload/doctor-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
  return await res.json();
}

// Upload Product Image to Cloudinary via Express Server
export async function uploadProductImageApi(fileOrBase64: File | string): Promise<CloudinaryUploadResponse> {
  let imageBase64 = '';
  if (typeof fileOrBase64 === 'string') {
    imageBase64 = fileOrBase64;
  } else {
    imageBase64 = await fileToBase64(fileOrBase64);
  }

  const res = await fetch('/api/upload/product-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
  return await res.json();
}

// Upload Product Video to Cloudinary / Server via Express Server
export async function uploadProductVideoApi(fileOrBase64: File | string): Promise<CloudinaryUploadResponse> {
  let videoBase64 = '';
  if (typeof fileOrBase64 === 'string') {
    videoBase64 = fileOrBase64;
  } else {
    videoBase64 = await fileToBase64(fileOrBase64);
  }

  const res = await fetch('/api/upload/product-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoBase64 }),
  });
  return await res.json();
}

// Delete Media directly from Cloudinary
export async function deleteCloudinaryMediaApi(
  urlOrPublicId: string,
  resourceType?: 'image' | 'video' | 'raw' | 'auto'
): Promise<{ success: boolean; message?: string; publicId?: string; error?: string }> {
  try {
    if (!urlOrPublicId) return { success: false, message: 'No URL specified' };
    const res = await fetch('/api/upload/delete-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlOrPublicId, resourceType }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Delete Cloudinary Media API Error:', err);
    return { success: false, error: err?.message };
  }
}

// Batch Delete Media from Cloudinary
export async function deleteCloudinaryBatchApi(urls: string[]): Promise<{ success: boolean; results?: any[] }> {
  try {
    if (!urls || urls.length === 0) return { success: true };
    const res = await fetch('/api/upload/delete-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Batch Delete Cloudinary Media API Error:', err);
    return { success: false };
  }
}

// Create Doctor in Database API Call
export async function createDoctorApi(doctor: any): Promise<{ success: boolean; doctor?: any; message?: string }> {
  try {
    const res = await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctor),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Delete Doctor API Call (automatically purges doctor & Cloudinary image)
export async function deleteDoctorApi(id: string, imageUrl?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/doctors/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    const data = await res.json();
    // Extra safety: if frontend has Cloudinary image url, also trigger direct delete
    if (imageUrl && (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com'))) {
      deleteCloudinaryMediaApi(imageUrl, 'image').catch(() => {});
    }
    return data;
  } catch (err: any) {
    if (imageUrl) {
      deleteCloudinaryMediaApi(imageUrl, 'image').catch(() => {});
    }
    return { success: false, message: err.message };
  }
}

// Create Disease in Database API Call
export async function createDiseaseApi(disease: any): Promise<{ success: boolean; disease?: any; message?: string }> {
  try {
    const res = await fetch('/api/diseases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disease),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Delete Disease API Call (automatically purges disease & Cloudinary image)
export async function deleteDiseaseApi(id: string, imageUrl?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/diseases/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    const data = await res.json();
    if (imageUrl && (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com'))) {
      deleteCloudinaryMediaApi(imageUrl, 'image').catch(() => {});
    }
    return data;
  } catch (err: any) {
    if (imageUrl) {
      deleteCloudinaryMediaApi(imageUrl, 'image').catch(() => {});
    }
    return { success: false, message: err.message };
  }
}

// Create Product in Database API Call
export async function createProductApi(product: any): Promise<{ success: boolean; product?: any; message?: string }> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Delete Product API Call (automatically purges product, Cloudinary image, and Cloudinary video)
export async function deleteProductApi(
  id: string,
  imageUrl?: string,
  videoUrl?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, videoUrl }),
    });
    const data = await res.json();
    if (imageUrl && (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com'))) {
      deleteCloudinaryMediaApi(imageUrl, 'image').catch(() => {});
    }
    if (videoUrl && (videoUrl.includes('cloudinary.com') || videoUrl.includes('res.cloudinary.com'))) {
      deleteCloudinaryMediaApi(videoUrl, 'video').catch(() => {});
    }
    return data;
  } catch (err: any) {
    if (imageUrl) deleteCloudinaryMediaApi(imageUrl, 'image').catch(() => {});
    if (videoUrl) deleteCloudinaryMediaApi(videoUrl, 'video').catch(() => {});
    return { success: false, message: err.message };
  }
}

// Update Doctor API Call
export async function updateDoctorApi(doc: any): Promise<{ success: boolean; doctor?: any; message?: string }> {
  try {
    const res = await fetch(`/api/doctors/${doc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Check hospital database connection status
export async function checkDbStatusApi() {
  try {
    const res = await fetch('/api/db-status');
    return await res.json();
  } catch (e) {
    return { connected: false };
  }
}

// User Management API Helpers
export async function getUsersApi() {
  try {
    const res = await fetch('/api/users');
    return await res.json();
  } catch (err: any) {
    return { success: false, users: [], message: err.message };
  }
}

export async function updateUserApi(userId: string, data: any) {
  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Messaging API Helpers
export async function getMessagesApi(userId?: string, doctorId?: string) {
  try {
    const query = new URLSearchParams();
    if (userId) query.append('userId', userId);
    if (doctorId) query.append('doctorId', doctorId);
    const res = await fetch(`/api/messages?${query.toString()}`);
    return await res.json();
  } catch (err: any) {
    return { success: false, messages: [], message: err.message };
  }
}

export async function sendMessageApi(msgData: {
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor';
  receiverId: string;
  receiverName: string;
  receiverRole: 'patient' | 'doctor';
  text: string;
  attachmentUrl?: string;
  audioUrl?: string;
  audioDuration?: string;
  documentType?: string;
  reportId?: string;
  digitalSlip?: any;
}) {
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Telemedicine Realtime Call API Helpers
export async function getActiveCallApi(userId: string) {
  try {
    const res = await fetch(`/api/calls/active?userId=${encodeURIComponent(userId)}`);
    return await res.json();
  } catch (err: any) {
    return { success: false, call: null };
  }
}

export async function startCallApi(callData: {
  callerId: string;
  callerName: string;
  callerRole: 'patient' | 'doctor';
  receiverId: string;
  receiverName: string;
  receiverRole: 'patient' | 'doctor';
  type: 'audio' | 'video';
}) {
  try {
    const res = await fetch('/api/calls/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(callData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, call: null };
  }
}

export async function acceptCallApi(callId: string) {
  try {
    const res = await fetch('/api/calls/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, call: null };
  }
}

export async function declineCallApi(callId: string) {
  try {
    const res = await fetch('/api/calls/decline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, call: null };
  }
}

export async function endCallApi(callId: string) {
  try {
    const res = await fetch('/api/calls/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, call: null };
  }
}

// Reports API Helpers
export async function getReportsApi(patientId?: string, doctorId?: string) {
  try {
    const query = new URLSearchParams();
    if (patientId) query.append('patientId', patientId);
    if (doctorId) query.append('doctorId', doctorId);
    const res = await fetch(`/api/reports?${query.toString()}`);
    return await res.json();
  } catch (err: any) {
    return { success: false, reports: [], message: err.message };
  }
}

export async function createReportApi(reportData: any) {
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function updateReportApi(reportId: string, data: any) {
  try {
    const res = await fetch(`/api/reports/${reportId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Delete Report API Call (automatically purges medical report & Cloudinary document/image)
export async function deleteReportApi(id: string, fileUrl?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/reports/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl }),
    });
    const data = await res.json();
    if (fileUrl && (fileUrl.includes('cloudinary.com') || fileUrl.includes('res.cloudinary.com'))) {
      deleteCloudinaryMediaApi(fileUrl).catch(() => {});
    }
    return data;
  } catch (err: any) {
    if (fileUrl) {
      deleteCloudinaryMediaApi(fileUrl).catch(() => {});
    }
    return { success: false, message: err.message };
  }
}

// Delete Message API Call (automatically purges message & Cloudinary attachment/audio)
export async function deleteMessageApi(
  id: string,
  attachmentUrl?: string,
  audioUrl?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/messages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attachmentUrl, audioUrl }),
    });
    const data = await res.json();
    if (attachmentUrl && (attachmentUrl.includes('cloudinary.com') || attachmentUrl.includes('res.cloudinary.com'))) {
      deleteCloudinaryMediaApi(attachmentUrl).catch(() => {});
    }
    if (audioUrl && (audioUrl.includes('cloudinary.com') || audioUrl.includes('res.cloudinary.com'))) {
      deleteCloudinaryMediaApi(audioUrl, 'video').catch(() => {});
    }
    return data;
  } catch (err: any) {
    if (attachmentUrl) deleteCloudinaryMediaApi(attachmentUrl).catch(() => {});
    if (audioUrl) deleteCloudinaryMediaApi(audioUrl, 'video').catch(() => {});
    return { success: false, message: err.message };
  }
}

// Clear Conversation API Call (deletes all messages and purges all attached Cloudinary assets)
export async function clearConversationMessagesApi(
  user1: string,
  user2: string
): Promise<{ success: boolean; message?: string; purgedMediaCount?: number }> {
  try {
    const res = await fetch(`/api/messages/conversation?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Delete User API Call (purges user record and avatar from Cloudinary)
export async function deleteUserApi(id: string, imageUrl?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    const data = await res.json();
    if (imageUrl && (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com'))) {
      deleteCloudinaryMediaApi(imageUrl, 'image').catch(() => {});
    }
    return data;
  } catch (err: any) {
    if (imageUrl) deleteCloudinaryMediaApi(imageUrl, 'image').catch(() => {});
    return { success: false, message: err.message };
  }
}

// Delete Order API Call
export async function deleteOrderApi(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Delete Appointment API Call
export async function deleteAppointmentApi(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/appointments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Delete Money Slip API Call
export async function deleteSlipApi(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/slips/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Appointment API Helpers
export async function getAppointmentsApi() {
  try {
    const res = await fetch('/api/appointments');
    return await res.json();
  } catch (err: any) {
    return { success: false, appointments: [], message: err.message };
  }
}

export async function createAppointmentApi(data: any) {
  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function updateAppointmentApi(id: string, data: any) {
  try {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function sendCallSignalApi(callId: string, userId: string, signal: any) {
  try {
    const res = await fetch('/api/calls/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId, userId, signal }),
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export async function getCallSignalsApi(callId: string, userId: string) {
  try {
    const res = await fetch(`/api/calls/signals?callId=${encodeURIComponent(callId)}&userId=${encodeURIComponent(userId)}`);
    return await res.json();
  } catch (e) {
    return { success: false, signals: [] };
  }
}

