# Collaborative Note-Taking App
## Eviatar Davidyan - eviatarda@edu.hac.ac.il
## Overview

The Collaborative Note-Taking App is a React-based application integrated with Firebase, designed for real-time note-taking and collaboration. Users can create, edit, manage, and categorize notes. The app also supports version history, allowing users to view and revert to previous versions of notes.

## Features

- **User Authentication:** Secure login and registration using Firebase Authentication.
- **Real-Time Collaboration:** Notes are updated in real-time for all users via Firebase Firestore.
- **Note Management:** Create, edit, and delete notes with real-time updates.
- **Category Management:** Assign categories to notes and filter notes by category.
- **Note History:** View and revert to previous versions of notes with version history tracking.

## Technologies

- **Frontend:** React.js, React Bootstrap
- **Backend:** Firebase (Firestore for the database, Authentication for user management)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- Firebase account with a configured project


### Firebase Integration

This project leverages Firebase for both backend and authentication services, providing a scalable and secure infrastructure for the Collaborative Note-Taking App.

#### Firestore Database

Firestore is used as the NoSQL database for storing notes and categories. It provides real-time data synchronization, which ensures that any changes made to the notes are immediately reflected across all connected clients. This feature is crucial for enabling real-time collaboration.

- **Collections:**
    - `notes`: Stores individual notes with fields like `content`, `timestamp`, `history`, `category`, and `creatorEmail`.
    - `categories`: Stores the list of categories available for notes.

- **Real-Time Updates:**
    - The `onSnapshot` method is used to listen for real-time updates in Firestore. This allows the app to update the UI immediately whenever there are changes to the notes or categories.

#### Firebase Authentication

Firebase Authentication is used to handle user authentication, providing a secure way to manage user sign-up and login processes. It supports various authentication methods, including email/password.

- **User Management:**
    - Users can register and log in to the app using their email and password.
    - User state is managed using Firebase Authentication, ensuring that only authenticated users can create, edit, or delete notes.

#### Firebase Configuration

To integrate Firebase with the app, the following configuration steps are required:

1. **Set Up Firebase Project:**
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Click on "Add Project" and follow the setup instructions.
    - Enable Firestore and Firebase Authentication in your project.

2. **Add Firebase SDK:**
    - Install Firebase SDK in your project:

      ```bash
      npm install firebase
      ```

3. **Create Firebase Configuration File:**
    - Create a `firebase-config.js` file in the `src` directory with your Firebase project configuration:

      ```javascript
      import { initializeApp } from 'firebase/app';
      import { getAuth } from 'firebase/auth';
      import { getFirestore } from 'firebase/firestore';
 
      const firebaseConfig = {
        apiKey: 'YOUR_API_KEY',
        authDomain: 'YOUR_AUTH_DOMAIN',
        projectId: 'YOUR_PROJECT_ID',
        storageBucket: 'YOUR_STORAGE_BUCKET',
        messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
        appId: 'YOUR_APP_ID'
      };
 
      const app = initializeApp(firebaseConfig);
      export const auth = getAuth(app);
      export const db = getFirestore(app);
      ```

4. **Initialize Firebase in Your App:**
    - Ensure that Firebase is initialized in your app and the necessary services (Firestore and Authentication) are properly configured.

5. **Firestore Security Rules:**
    - Configure Firestore security rules to ensure that only authenticated users can read and write data. Example rules:

      ```plaintext
      service cloud.firestore {
        match /databases/{database}/documents {
          match /notes/{document=**} {
            allow read, write: if request.auth != null;
          }
          match /categories/{document=**} {
            allow read, write: if request.auth != null;
          }
        }
      }
      ```

By integrating Firebase, the Collaborative Note-Taking App benefits from scalable and secure backend services, real-time data synchronization, and robust user authentication.
