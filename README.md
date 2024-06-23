# Criminal Detection App

## Introduction

This application utilizes the Segment Anything Model (SAM) from Meta AI Research to identify criminals from images or videos. It features a robust frontend built with Vite, TypeScript, and React, and a backend powered by FastAPI, Python, and PyTorch, designed to handle image processing and criminal record management efficiently.

## Getting Started

### Prerequisites

Before installation, ensure you have Docker, Docker Compose, Pipenv, Node.js, and npm installed on your system.

### Setup Using Docker Compose

1. Clone the repository:

   ```bash
   git clone https://github.com/criminal-ai-detection/object-detection-app
   ```

2. Navigate to the project directory:

   ```bash
   cd object-detection-app
   ```

3. Start the application using Docker Compose:

   ```bash
   docker-compose up
   ```

### Manual Setup

You probabbly only want the manual setup if your developing or you really want to save space on docker images. You'll need two terminals to run the frontend and backend. Or you can use scripts like `concurrently` or the `&` operator to run both at once (out of scope).

#### Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies with Pipenv:

   ```bash
   pipenv install
   ```

3. Activate the Pipenv shell:

   ```bash
   pipenv shell
   ```

4. Start the FastAPI server:

   ```bash
   uvicorn app:app --reload
   ```

   This will serve the application at `http://localhost:8000`.

#### Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install npm packages:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   This will serve the application at `http://localhost:5178`.

## Design / Architecture

### Frontend Server

The frontend is developed using React and TypeScript, bundled and served by Vite. It is structured to clearly separate UI components, utility functions, and API interactions, enhancing manageability and scalability.

### Backend Server

Built with FastAPI and PyTorch, the backend handles image uploads and manages data related to criminal records. It processes images using the SAM model to generate embeddings and manage criminal data efficiently.

## Under the Hood

### Key Features

- **Criminal Management**: Create, delete, edit, and list criminal records with associated images.
- **Image Processing**: Images are processed using the SAM model to extract embeddings.

### Code Organization

```
$ tree . -I node_modules -I .venv
.
├── backend
│   ├── notebooks
│   │   └── testing_model.ipynb
│   ├── Pipfile
│   ├── Pipfile.lock
│   └── sam_server
│       ├── app.py
│       └── custom_sam.py
├── criminal_data
│   ├── Bellingham
│   │   ├── pic1.png
│   │   ├── pic2.jpg
│   │   └── pic3.jpg
│   ├── Mbappé
│   │   ├── pic1.jpeg
│   │   └── pic2.jpg
│   └── Vinicius
│       ├── pic1.jpg
│       └── pic2.jpg
├── frontend
│   ├── default-README.md
│   ├── index.html
│   ├── jest.config.mjs
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── ProgressBar.css
│   │   │   └── ProgressBar.tsx
│   │   ├── lib
│   │   │   └── detect
│   │   │       ├── detection.ts
│   │   │       ├── detect.skiptest.ts
│   │   │       ├── detect.ts
│   │   │       ├── embeddings.ts
│   │   │       └── imageUtils.ts
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── app
│   │   │   │   ├── App.css
│   │   │   │   └── App.tsx
│   │   │   ├── CreateCriminal
│   │   │   │   ├── CreateCriminal.tsx
│   │   │   │   └── page.test.tsx
│   │   │   ├── DeleteCriminal
│   │   │   │   └── DeleteCriminal.tsx
│   │   │   ├── EditCriminal
│   │   │   │   └── EditCriminal.tsx
│   │   │   └── Home
│   │   │       └── Home.tsx
│   │   ├── styles
│   │   │   └── index.css
│   │   ├── types
│   │   │   ├── criminal.ts
│   │   │   ├── detectedCriminal.ts
│   │   │   └── image.ts
│   │   ├── utils
│   │   │   └── imageConversion.ts
│   │   └── vite-env.d.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── tsconfig.spec.json
│   └── vite.config.ts
└── README.md

23 directories, 45 files
```

### Frontend Directory Structure

The frontend directory is organized as follows:

- **[src](frontend/src)**: Contains all the source code for the frontend.
  - **[assets](frontend/src/assets)**: Stores static assets like images used in the application.
  - **[components](frontend/src/components)**: Reusable UI components.
    - `ProgressBar.tsx`: A component to display the progress of image processing.
  - **[lib](frontend/src/lib)**: Contains libraries and helpers for specific functionalities.
    - **[detect](frontend/src/lib/detect)**: Functions related to the detection process, including API calls for processing images and handling embeddings.
  - **[pages](frontend/src/pages)**: Components representing entire pages within the application.
    - **[app](frontend/src/pages/app)**: The main application component that sets up routing and global styles.
    - **[CreateCriminal](frontend/src/pages/CreateCriminal)**: Page to create a new criminal record.
    - **[DeleteCriminal](frontend/src/pages/DeleteCriminal)**: Page to delete an existing criminal record.
    - **[EditCriminal](frontend/src/pages/EditCriminal)**: Page to edit an existing criminal record.
    - **[Home](frontend/src/pages/Home)**: The homepage that provides the main interface for uploading images and displaying detected criminals.
  - **[styles](frontend/src/styles)**: Contains global CSS files.
  - **[types](frontend/src/types)**: TypeScript interfaces and types to ensure type safety across the application.
  - **[utils](frontend/src/utils)**: Utility functions, such as those for converting images.

- **[public](frontend/public)**: Contains public assets like icons used in the HTML template.
- **[`main.tsx`](frontend/src/main.tsx)**: The entry HTML file that references the built JavaScript files and includes the root div for React rendering.

### API Endpoints

- **POST `/process-image/`**: Processes an uploaded image and returns its embeddings.
- **POST `/create-criminal/`**: Creates a new criminal record with associated images.
- **POST `/delete-criminal/`**: Deletes a criminal record.
- **POST `/edit-criminal/`**: Edits an existing criminal record by adding or updating images.
- **GET `/list-criminals/`**: Lists all criminals and their associated images.

## General Usage

Once the application is running, navigate to `http://localhost:5173` to access the user interface. From here, users can upload images or videos, and manage criminal records through an intuitive interface.

## Contributing

Contributions are welcome. Please adhere to the existing code style and include unit tests for new or modified functionality.

## License

Copyright (c) 2024, Pablo Cobo Perez, Jacob Valdez, Amal Sony, David Baiye

This project is proprietary. ALL RIGHTS RESERVED.

## Additional Resources

For more information on the Segment Anything Model (SAM), visit the [Segment Anything GitHub repository](https://github.com/facebookresearch/segment-anything).

## Acknowledgments

This project is made possible by the dedication of engineers in Spain, Texas, and San Francisco.

This refined structure provides a clear and comprehensive guide to understanding, setting up, and contributing to the Criminal Detection App.
