export const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const fetchHistory = async () => {
  const res = await fetch(`${API_BASE_URL}/history`);
  return res.json();
};

export const resetSession = async () => {
  const res = await fetch(`${API_BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};

export const deleteSession = async (idx: number) => {
  const res = await fetch(`${API_BASE_URL}/delete-session/${idx}`, { method: 'DELETE' });
  return res.json();
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
};

export const fetchDashboard = async () => {
  const res = await fetch(`${API_BASE_URL}/dashboard`);
  return res.json();
};

export const fetchEvaluate = async (dataset: string = 'primary') => {
  const res = await fetch(`${API_BASE_URL}/evaluate?dataset=${dataset}`);
  return res.json();
};

export const fetchResults = async () => {
  const res = await fetch(`${API_BASE_URL}/results`);
  return res.json();
};

export const updateData = async (updates: any[]) => {
  const res = await fetch(`${API_BASE_URL}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  });
  return res.json();
};

export const fetchCompareStatus = async () => {
  const res = await fetch(`${API_BASE_URL}/compare`);
  return res.json();
};

export const uploadCompareFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/compare/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
};

export const fetchCompareResults = async () => {
  const res = await fetch(`${API_BASE_URL}/compare/results`);
  return res.json();
};

export const clearCompare = async () => {
  const res = await fetch(`${API_BASE_URL}/compare/clear`, { method: 'POST' });
  return res.json();
};
