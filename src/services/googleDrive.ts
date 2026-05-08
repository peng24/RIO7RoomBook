import axios from 'axios';

const PARENT_FOLDER_ID = import.meta.env.VITE_DRIVE_PARENT_FOLDER_ID;

export const getOrCreateSubfolder = async (accessToken: string) => {
  const now = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const folderName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  // Search for folder
  const searchResponse = await axios.get(
    `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and '${PARENT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (searchResponse.data.files.length > 0) {
    return searchResponse.data.files[0].id;
  }

  // Create folder
  const createResponse = await axios.post(
    'https://www.googleapis.com/drive/v3/files',
    {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [PARENT_FOLDER_ID],
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return createResponse.data.id;
};

export const uploadFile = async (accessToken: string, file: File) => {
  const folderId = await getOrCreateSubfolder(accessToken);

  const metadata = {
    name: file.name,
    parents: [folderId],
  };

  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  formData.append('file', file);

  const response = await axios.post(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    formData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const getFileLink = async (accessToken: string, fileId: string) => {
    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink`,
        {
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    );
    return response.data.webViewLink;
}
