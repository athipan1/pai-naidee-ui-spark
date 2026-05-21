const { GoogleSpreadsheet } = require('google-spreadsheet');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const stream = require('stream');

/**
 * Utility to interact with Google Sheets and Google Drive
 */
class GoogleService {
  constructor() {
    // Use provided IDs as defaults
    this.sheetId = process.env.GOOGLE_SHEET_ID || '11vWarJAWiQZRAFIlSF1AK__5XTIKLJ64edAbqVJz7xg';
    this.driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1Tllbbyi3SI7zFs-_7_1Wv5hqsVflMS7M';
    this.clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    this.privateKey = process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null;

    this.auth = null;
    this.doc = null;
    this.drive = null;
  }

  /**
   * Initialize Google API clients
   */
  async init() {
    if (this.auth) return;

    if (!this.clientEmail || !this.privateKey) {
      console.warn('⚠️ Google Service Account credentials missing. Google integration will be disabled.');
      return false;
    }

    try {
      this.auth = new JWT({
        email: this.clientEmail,
        key: this.privateKey,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });

      this.doc = new GoogleSpreadsheet(this.sheetId, this.auth);
      await this.doc.loadInfo();

      this.drive = google.drive({ version: 'v3', auth: this.auth });

      console.log('✅ Google Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Service:', error.message);
      return false;
    }
  }

  /**
   * Get a sheet by title, or create it if it doesn't exist
   */
  async getOrCreateSheet(title, headers) {
    let sheet = this.doc.sheetsByTitle[title];
    if (!sheet) {
      sheet = await this.doc.addSheet({ title, headerValues: headers });
    }
    return sheet;
  }

  /**
   * Add a row to a sheet
   */
  async addRow(sheetTitle, data, headers) {
    if (!await this.init()) return null;
    try {
      const sheet = await this.getOrCreateSheet(sheetTitle, headers);
      return await sheet.addRow(data);
    } catch (error) {
      console.error(`Error adding row to ${sheetTitle}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all rows from a sheet
   */
  async getRows(sheetTitle, headers) {
    if (!await this.init()) return [];
    try {
      const sheet = await this.getOrCreateSheet(sheetTitle, headers);
      return await sheet.getRows();
    } catch (error) {
      console.error(`Error getting rows from ${sheetTitle}:`, error.message);
      return [];
    }
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(fileBuffer, fileName, mimeType) {
    if (!await this.init()) return null;
    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [this.driveFolderId],
        },
        media: {
          mimeType: mimeType,
          body: bufferStream,
        },
        fields: 'id, webViewLink, webContentLink',
      });

      // Set permission to anyone with link
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Google Drive direct link format
      const directUrl = `https://lh3.googleusercontent.com/d/${response.data.id}`;

      return {
        id: response.data.id,
        url: directUrl,
        webViewLink: response.data.webViewLink
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error.message);
      throw error;
    }
  }

  /**
   * Delete a file from Google Drive
   */
  async deleteFile(fileId) {
    if (!await this.init()) return false;
    try {
      await this.drive.files.delete({ fileId });
      return true;
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error.message);
      return false;
    }
  }
}

module.exports = new GoogleService();
