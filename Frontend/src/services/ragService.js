import axios from 'axios';

const CLIENT_ID_KEY = 'divyayatra_rag_client_id';
const API_BASE_URL = import.meta.env.VITE_RAG_API_URL || 'http://localhost:8000/api/v1';

const apiRoot = API_BASE_URL
  .trim()
  .replace(/\/+$/, '')
  .replace(/(\/api\/v1)+$/, '');
const normalizedBaseURL = `${apiRoot}/api/v1`;

function getClientId() {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);
  if (!clientId) {
    clientId = crypto.randomUUID ? crypto.randomUUID() : `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }
  return clientId;
}

const ragApi = axios.create({
  baseURL: normalizedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

ragApi.interceptors.request.use((config) => {
  config.headers['X-Client-Id'] = getClientId();
  return config;
});

export const ragService = {
  // Check API health
  checkHealth: async () => {
    try {
      const response = await ragApi.get('/health', { timeout: 5000 });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Upload a PDF file
  uploadPDF: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('files', file);

    const response = await ragApi.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  // Process & chunk & embed uploaded documents
  processDocument: async (documentIds) => {
    const response = await ragApi.post('/process', { document_ids: documentIds });
    return response.data;
  },

  // List all uploaded and processed documents
  listDocuments: async () => {
    const response = await ragApi.get('/documents');
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const response = await ragApi.delete(`/document/${documentId}`);
    return response.data;
  },

  // Send message / question to RAG
  askQuestion: async (question, documentIds = [], sessionId = null, model = "gemini-2.5-flash", retrievalMode = "history_aware") => {
    const payload = {
      question,
      document_ids: documentIds,
      model,
      retrieval_mode: retrievalMode,
    };
    if (sessionId) {
      payload.session_id = sessionId;
    }
    const response = await ragApi.post('/chat', payload);
    return response.data;
  },

  // Chat sessions
  listChatSessions: async () => {
    const response = await ragApi.get('/chats');
    return response.data;
  },

  getChatSession: async (sessionId) => {
    const response = await ragApi.get(`/chats/${sessionId}`);
    return response.data;
  },

  deleteChatSession: async (sessionId) => {
    const response = await ragApi.delete(`/chats/${sessionId}`);
    return response.data;
  },
};

export default ragService;
