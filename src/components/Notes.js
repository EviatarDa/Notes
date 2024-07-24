// src/components/Notes.js

import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Button, Form, ListGroup, Container, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import NoteHistory from './NoteHistory';

const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.toDate) {
        const date = timestamp.toDate();
        return date.toLocaleString(); // Adjust format as needed!!!!!
    }
    return 'Invalid Date';
};

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [historyVisible, setHistoryVisible] = useState(null);
    const [reverting, setReverting] = useState(false);
    const user = useAuth();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'notes'), (snapshot) => {
            const notesList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNotes(notesList);
        });

        return () => unsubscribe();
    }, []);

    const handleSaveNote = async (e) => {
        e.preventDefault();
        if (newNote.trim() === '') return;

        try {
            if (!user) throw new Error('User not authenticated');

            if (selectedNote) {
                // Update existing note with new history entry
                const noteRef = doc(db, 'notes', selectedNote.id);

                // Save the current state of the note as part of its history
                const updatedHistory = [
                    ...selectedNote.history,
                    {
                        content: selectedNote.content, // Store old content
                        timestamp: selectedNote.timestamp, // Store old timestamp
                        modifierEmail: user.email // Current user as the modifier
                    }
                ];

                await updateDoc(noteRef, {
                    content: newNote,
                    timestamp: new Date(),
                    history: updatedHistory,
                    creatorEmail: selectedNote.creatorEmail // Preserve the email of the note creator
                });
            } else {
                // Add new note
                await addDoc(collection(db, 'notes'), {
                    content: newNote,
                    timestamp: new Date(),
                    history: [], // Initial history is empty
                    creatorEmail: user.email // Store the email of the note creator
                });
            }
            setNewNote('');
            setSelectedNote(null);
            setEditing(false);
            setError('');
        } catch (err) {
            setError(`Failed to save note: ${err.message}`);
            console.error('Error saving note:', err);
        }
    };

    const handleEditNote = (note) => {
        setNewNote(note.content);
        setSelectedNote(note);
        setEditing(true);
        setReverting(false);
    };

    const handleDeleteNote = async (id) => {
        try {
            await deleteDoc(doc(db, 'notes', id));
        } catch (err) {
            setError(`Failed to delete note: ${err.message}`);
            console.error('Error deleting note:', err);
        }
    };

    const toggleHistory = (noteId) => {
        setHistoryVisible(historyVisible === noteId ? null : noteId);
    };

    const handleRevertVersion = async (noteId, version) => {
        try {
            const noteRef = doc(db, 'notes', noteId);

            // Find the current note to prepare for history update
            const currentNote = notes.find(note => note.id === noteId);
            if (!currentNote) throw new Error('Note not found');

            // Prepare new history entries
            const newHistory = [
                ...currentNote.history,
                {
                    content: currentNote.content, // Save the current content before reverting
                    timestamp: currentNote.timestamp, // Current timestamp
                    modifierEmail: user.email // User who is performing the revert
                }
            ];

            // Update the note in Firestore with the new content and history
            await updateDoc(noteRef, {
                content: version.content,
                timestamp: new Date(), // Timestamp of the revert
                history: newHistory // Updated history
            });

            // Update local state
            setNotes(prevNotes => prevNotes.map(note =>
                note.id === noteId
                    ? { ...note, content: version.content, timestamp: new Date(), history: newHistory }
                    : note
            ));

            setReverting(true);
        } catch (err) {
            setError(`Failed to revert note: ${err.message}`);
            console.error('Error reverting note:', err);
        }
    };

    return (
        <Container className="mt-5">
            <h2>Notes</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {user && (
                <Form onSubmit={handleSaveNote}>
                    <Form.Group controlId="formNewNote">
                        <Form.Label>{editing ? 'Edit Note' : 'New Note'}</Form.Label>
                        <Form.Control
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="mt-3">
                        {editing ? 'Save' : 'Add'} Note
                    </Button>
                </Form>

            )}
            <ListGroup className="mt-3">
                {notes.map((note) => (
                    <ListGroup.Item key={note.id}>
                        <Row>
                            <Col>
                                <div>{note.content}</div>
                                <small className="text-muted">
                                    Created by: {note.creatorEmail}<br />
                                    Created on: {formatTimestamp(note.timestamp)}<br />
                                    {note.history.length > 0 && (
                                        <div>
                                            Last modified by: {note.history[note.history.length - 1].modifierEmail}<br />
                                            Last modified on: {formatTimestamp(note.history[note.history.length - 1].timestamp)}
                                        </div>
                                    )}
                                </small>
                            </Col>
                            {user && (
                                <Col xs="auto">
                                    <Button variant="warning" onClick={() => handleEditNote(note)}>
                                        Edit
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDeleteNote(note.id)} className="ms-2">
                                        Delete
                                    </Button>
                                    <Button variant="info" onClick={() => toggleHistory(note.id)} className="ms-2">
                                        {historyVisible === note.id ? 'Hide History' : 'View History'}
                                    </Button>
                                </Col>
                            )}
                        </Row>
                        {historyVisible === note.id && (
                            <NoteHistory
                                history={note.history}
                                onRevert={(version) => handleRevertVersion(note.id, version)}
                            />
                        )}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            {reverting && <Alert variant="success" className="mt-3">Note reverted successfully!</Alert>}
        </Container>
    );
};

export default Notes;
