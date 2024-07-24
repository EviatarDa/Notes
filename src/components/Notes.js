// src/components/Notes.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Button, Form, ListGroup, Container, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import NoteHistory from './NoteHistory';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [historyVisible, setHistoryVisible] = useState(null);
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
                // Update existing note with history
                const noteRef = doc(db, 'notes', selectedNote.id);
                await updateDoc(noteRef, {
                    content: newNote,
                    timestamp: new Date(),
                    history: [
                        ...selectedNote.history,
                        { content: selectedNote.content, timestamp: new Date().toISOString(), email: user.email }
                    ],
                    email: user.email // Update the email of the note creator
                });
            } else {
                // Add new note
                await addDoc(collection(db, 'notes'), {
                    content: newNote,
                    timestamp: new Date(),
                    history: [], // Initial history is empty
                    email: user.email // Store the email of the note creator
                });
            }
            setNewNote('');
            setSelectedNote(null);
            setEditing(false);
            setError('');
        } catch (err) {
            setError('Failed to save note');
            console.error(err);
        }
    };

    const handleEditNote = (note) => {
        setNewNote(note.content);
        setSelectedNote(note);
        setEditing(true);
    };

    const handleDeleteNote = async (id) => {
        try {
            await deleteDoc(doc(db, 'notes', id));
        } catch (err) {
            setError('Failed to delete note');
            console.error(err);
        }
    };

    const toggleHistory = (noteId) => {
        setHistoryVisible(historyVisible === noteId ? null : noteId);
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
                                <small className="text-muted">Created by: {note.email}</small>
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
                            <NoteHistory history={note.history} />
                        )}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default Notes;
