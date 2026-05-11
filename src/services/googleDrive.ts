import axios from 'axios';

const PARENT_FOLDER_ID = import.meta.env.VITE_DRIVE_PARENT_FOLDER_ID;

export const getOrCreateSubfolder = async (accessToken: string) => {
  const now = new Date();
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const thaiYear = now.getFullYear() + 543;
  const yearFolderName = `${thaiYear}`;
  const monthFolderName = `${thaiMonths[now.getMonth()]} ${thaiYear}`;

  try {
    // Helper to find or create a folder
    const findOrCreate = async (name: string, parentId: string | null) => {
      let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }
      const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
      
      const searchResponse = await axios.get(searchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (searchResponse.data.files && searchResponse.data.files.length > 0) {
        return searchResponse.data.files[0].id;
      }

      const metadata: any = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
      };
      if (parentId) {
        metadata.parents = [parentId];
      }

      const createResponse = await axios.post(
        'https://www.googleapis.com/drive/v3/files',
        metadata,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return createResponse.data.id;
    };

    // 1. Find or create Year folder
    let yearFolderId = null;
    try {
      yearFolderId = await findOrCreate(yearFolderName, PARENT_FOLDER_ID || null);
    } catch (yearErr: any) {
      if (PARENT_FOLDER_ID && yearErr.response?.status === 403) {
        console.warn("Could not create year folder inside PARENT_FOLDER_ID. Trying root.");
        yearFolderId = await findOrCreate(yearFolderName, null);
      } else {
        throw yearErr;
      }
    }

    // 2. Find or create Month folder inside Year folder
    if (yearFolderId) {
      const monthFolderId = await findOrCreate(monthFolderName, yearFolderId);
      return monthFolderId;
    }
    
    // Fallback if yearFolderId is somehow null
    return await findOrCreate(monthFolderName, null);
  } catch (error) {
    console.warn("Could not access or create subfolder. Falling back to root directory.", error);
    return null;
  }
};

export const uploadFile = async (accessToken: string, file: File) => {
  const folderId = await getOrCreateSubfolder(accessToken);

  const metadata: any = {
    name: file.name,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  formData.append('file', file);

  try {
    const response = await axios.post(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      formData,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const fileId = response.data.id;

    // 3. Make the uploaded file accessible to anyone with the link
    try {
      await axios.post(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        { role: 'reader', type: 'anyone' },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (permError) {
      console.error("Could not set file permissions to public:", permError);
    }

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.error("Google Drive 403 Forbidden: Ensure Drive API is enabled in Cloud Console and scopes are correct.", error.response.data);
    }
    throw error;
  }
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
