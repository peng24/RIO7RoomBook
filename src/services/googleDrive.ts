import axios from 'axios';

const PARENT_FOLDER_ID = import.meta.env.VITE_DRIVE_PARENT_FOLDER_ID;

export const getOrCreateSubfolder = async (accessToken: string) => {
  const now = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const folderName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  try {
    // 1. Search for folder
    let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    let searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
    
    if (PARENT_FOLDER_ID) {
      const parentQuery = `${query} and '${PARENT_FOLDER_ID}' in parents`;
      const parentSearchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(parentQuery)}`;
      
      try {
        const searchResponse = await axios.get(parentSearchUrl, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (searchResponse.data.files && searchResponse.data.files.length > 0) {
          return searchResponse.data.files[0].id;
        }
      } catch (parentErr) {
        console.warn("Cannot search in PARENT_FOLDER_ID, likely no access. Falling back to general search.", parentErr);
      }
    }

    const searchResponse = await axios.get(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      return searchResponse.data.files[0].id;
    }

    // 2. Create folder if not found
    const metadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    
    // Only add parent if we think we have access (or if we want to try anyway)
    if (PARENT_FOLDER_ID) {
      metadata.parents = [PARENT_FOLDER_ID];
    }

    try {
      const createResponse = await axios.post(
        'https://www.googleapis.com/drive/v3/files',
        metadata,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return createResponse.data.id;
    } catch (createErr: any) {
      if (PARENT_FOLDER_ID && createErr.response?.status === 403) {
        console.warn("Could not create folder inside PARENT_FOLDER_ID. Trying to create in root.");
        delete metadata.parents;
        const rootCreateResponse = await axios.post(
          'https://www.googleapis.com/drive/v3/files',
          metadata,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return rootCreateResponse.data.id;
      }
      throw createErr;
    }
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
