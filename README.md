# Word-like Text Editor

A comprehensive, production-ready Word-like text editor built with Next.js and Node.js. This application provides a rich text editing experience similar to Microsoft Word, with features like formatting, tables, images, comments, and document export.

## 🚀 Features

### Core Editing Features
- **Rich Text Formatting**: Bold, italic, underline, strikethrough, superscript, subscript
- **Text Styling**: Font family, font size, text color, highlight color
- **Paragraph Formatting**: Alignment (left, center, right, justify), line spacing, indentation
- **Lists**: Bulleted lists, numbered lists, nested lists
- **Tables**: Create, edit, and format tables with borders, cell shading, and merging
- **Images**: Insert, resize, and wrap text around images
- **Links**: Insert and edit hyperlinks
- **Shapes**: Draw and insert shapes
- **Comments**: Add, reply to, and manage comments
- **Find & Replace**: Search and replace text in documents
- **Spell Check**: Real-time spell checking
- **Read Aloud**: Text-to-speech functionality
- **Word Count**: Real-time word and character count

### Document Management
- **Save/Load**: Save documents to database or localStorage
- **Export**: Export documents to PDF and DOCX (Word) formats
- **Document Protection**: Password protection for documents
- **Page Breaks**: Insert page breaks for printing
- **Page Design**: Customize page colors, borders, fonts, and spacing

### Advanced Features
- **Ribbon Toolbar**: Microsoft Word-style ribbon interface
- **Rulers**: Horizontal and vertical rulers for precise formatting
- **Context Menus**: Right-click context menus for tables and images
- **Drag & Drop**: Drag and drop images and content
- **Auto-save**: Automatic document saving
- **Undo/Redo**: Full history support

## 📁 Project Structure

```
word-text-editor/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Configuration files
│   │   └── database.js     # MongoDB connection
│   ├── controllers/        # Request handlers
│   │   ├── documentController.js  # Document CRUD operations
│   │   └── exportController.js   # PDF/DOCX export
│   ├── middleware/         # Express middleware
│   │   └── auth.js         # Authentication & validation
│   ├── models/             # Database models
│   │   └── Document.js     # Document schema
│   ├── routes/             # API routes
│   │   ├── documents.js    # Document endpoints
│   │   └── export.js       # Export endpoints
│   ├── utils/              # Utility functions
│   │   └── logger.js       # Winston logger
│   ├── logs/               # Log files (auto-generated)
│   ├── server.js           # Express server entry point
│   ├── package.json        # Backend dependencies
│   └── env.example         # Environment variables template
│
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js app directory
│   │   ├── page.js         # Main editor page
│   │   ├── layout.js       # Root layout
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── WordEditor.jsx  # Main editor component
│   │   ├── Toolbar.jsx     # Formatting toolbar
│   │   ├── RibbonToolbar.jsx  # Ribbon interface
│   │   ├── TableManager.jsx    # Table management
│   │   ├── ImageManager.jsx    # Image management
│   │   └── ...             # Other components
│   ├── lib/                # Library files & extensions
│   │   ├── editor.js       # Editor configuration
│   │   ├── fontSizeExtension.js
│   │   ├── tableCellWithAttrs.js
│   │   └── ...             # TipTap extensions
│   ├── package.json        # Frontend dependencies
│   └── next.config.js      # Next.js configuration
│
├── .gitignore             # Git ignore rules
├── package.json            # Root package.json (scripts)
└── README.md              # This file
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework
- **TipTap** - Rich text editor framework
- **Tailwind CSS** - Styling
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database (optional)
- **Mongoose** - ODM for MongoDB
- **Puppeteer** - PDF generation
- **docx** - DOCX file generation
- **Winston** - Logging

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (optional - for document storage)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd word-text-editor
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```
   This installs dependencies for root, frontend, and backend.

3. **Configure environment variables**

   **Backend** (`backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/word-editor
   JWT_SECRET=your-secret-key-here
   ```

   Copy `backend/env.example` to `backend/.env` and update values.

4. **Start development servers**
   ```bash
   npm run dev
   ```
   This starts both frontend (port 3000) and backend (port 5000).

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Build
```bash
# Build frontend
npm run build

# Start production servers
npm start
```

### Individual Services
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

## 📝 API Endpoints

### Documents
- `GET /api/documents` - Get all documents (with pagination)
- `GET /api/documents/:id` - Get a specific document
- `POST /api/documents` - Create a new document
- `PUT /api/documents/:id` - Update a document
- `DELETE /api/documents/:id` - Delete a document
- `GET /api/documents/search?q=query` - Search documents

### Export
- `POST /api/export/pdf` - Export HTML to PDF
  ```json
  {
    "htmlContent": "<p>Document content</p>",
    "title": "Document Title"
  }
  ```
- `POST /api/export/docx` - Export HTML to DOCX
  ```json
  {
    "htmlContent": "<p>Document content</p>",
    "title": "Document Title"
  }
  ```

### Health Check
- `GET /api/health` - Server health status

## 🔧 Configuration

### Backend Configuration
The backend can run without MongoDB. Export features (PDF/DOCX) work independently. Document save/load features require MongoDB connection.

### Frontend Configuration
The frontend is configured to proxy API requests to the backend. Update `frontend/next.config.js` if backend URL changes.

## 📚 Key Files Explained

### Backend

- **`server.js`**: Main Express server setup with middleware and routes
- **`controllers/documentController.js`**: Handles document CRUD operations
- **`controllers/exportController.js`**: Handles PDF and DOCX export
- **`models/Document.js`**: MongoDB document schema
- **`routes/documents.js`**: Document API route definitions
- **`routes/export.js`**: Export API route definitions
- **`config/database.js`**: MongoDB connection handler
- **`middleware/auth.js`**: Authentication and validation middleware
- **`utils/logger.js`**: Winston logger configuration

### Frontend

- **`app/page.js`**: Main editor page with all features
- **`components/WordEditor.jsx`**: Core editor component
- **`components/Toolbar.jsx`**: Formatting toolbar
- **`lib/editor.js`**: TipTap editor configuration
- **`lib/*Extension.js`**: Custom TipTap extensions for features

## 🧪 Development Notes

- The application works without MongoDB for export features
- Document save/load requires MongoDB connection
- All features are production-ready and fully functional
- Code is well-commented for easy understanding

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows existing patterns
- Comments are added for complex logic
- Features are tested before submitting

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ using Next.js and Node.js**
