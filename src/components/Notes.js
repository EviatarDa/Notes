import React, { useState, useEffect } from 'react';
import { db } from './firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { Button, Form, ListGroup, Container, Alert, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import NoteHistory from './NoteHistory';

const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.toDate) {
        const date = timestamp.toDate();
        return date.toLocaleString(); // Adjust format as needed
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
    const [categories, setCategories] = useState([]);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [noteCategoryInput, setNoteCategoryInput] = useState('');
    const user = useAuth();

    useEffect(() => {
        // Load categories from Firestore
        const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
            const categoriesList = snapshot.docs.map((doc) => doc.data().name);
            setCategories(categoriesList);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Load notes from Firestore with optional category filter
        const fetchNotes = async () => {
            try {
                const notesCollection = collection(db, 'notes');
                const notesQuery = selectedCategoryFilter
                    ? query(notesCollection, where('category', '==', selectedCategoryFilter))
                    : notesCollection;

                const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
                    const notesList = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setNotes(notesList);
                });

                return () => unsubscribe();
            } catch (err) {
                setError(`Failed to fetch notes: ${err.message}`);
                console.error('Error fetching notes:', err);
            }
        };

        fetchNotes();
    }, [selectedCategoryFilter]);

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
                        content: selectedNote.content,
                        timestamp: selectedNote.timestamp,
                        modifierEmail: user.email
                    }
                ];

                await updateDoc(noteRef, {
                    content: newNote,
                    timestamp: new Date(),
                    history: updatedHistory,
                    category: noteCategoryInput,
                    creatorEmail: selectedNote.creatorEmail
                });
            } else {
                // Add new note
                await addDoc(collection(db, 'notes'), {
                    content: newNote,
                    timestamp: new Date(),
                    history: [],
                    category: noteCategoryInput,
                    creatorEmail: user.email
                });
            }
            setNewNote('');
            setSelectedNote(null);
            setEditing(false);
            setNoteCategoryInput('');
            setError('');
        } catch (err) {
            setError(`Failed to save note: ${err.message}`);
            console.error('Error saving note:', err);
        }
    };

    const handleEditNote = (note) => {
        setNewNote(note.content);
        setSelectedNote(note);
        setNoteCategoryInput(note.category || ''); // Load note's category
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
                    content: currentNote.content,
                    timestamp: currentNote.timestamp,
                    modifierEmail: user.email
                }
            ];

            // Update the note in Firestore with the new content and history
            await updateDoc(noteRef, {
                content: version.content,
                timestamp: new Date(),
                history: newHistory
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

    const handleAddCategory = async () => {
        if (newCategoryInput.trim() === '') return;

        try {
            const categoryRef = collection(db, 'categories');
            await addDoc(categoryRef, { name: newCategoryInput.trim() });
            setNewCategoryInput('');
        } catch (err) {
            setError(`Failed to add category: ${err.message}`);
            console.error('Error adding category:', err);
        }
    };

    return (
        <Container className="mt-5">
            <h2 className="mb-4">Notes</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {user && (
                <>
                    <Card className="mb-4">
                        <Card.Header>{editing ? 'Edit Note' : 'New Note'}</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSaveNote}>
                                <Form.Group controlId="formNewNote" className="mb-3">
                                    <Form.Label>Note Content</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group controlId="formNoteCategory" className="mb-3">
                                    <Form.Label>Note Category</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={noteCategoryInput}
                                        onChange={(e) => setNoteCategoryInput(e.target.value)}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat, index) => (
                                            <option key={index} value={cat}>{cat}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    {editing ? 'Save' : 'Add'} Note
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header>Add New Category</Card.Header>
                        <Card.Body>
                            <Form.Group controlId="formNewCategory" className="mb-3">
                                <Form.Label>New Category Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newCategoryInput}
                                    onChange={(e) => setNewCategoryInput(e.target.value)}
                                />
                            </Form.Group>
                            <Button variant="secondary" onClick={handleAddCategory}>
                                Add Category
                            </Button>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header>Filter Notes by Category</Card.Header>
                        <Card.Body>
                            <Form.Group controlId="formCategoryFilter" className="mb-3">
                                <Form.Control
                                    as="select"
                                    value={selectedCategoryFilter}
                                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((cat, index) => (
                                        <option key={index} value={cat}>{cat}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </>
            )}

            <ListGroup className="mt-4">
                {notes.map((note) => (
                    <ListGroup.Item key={note.id} className="mb-2">
                        <Row>
                            <Col>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{note.content}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">
                                            Category: {note.category || 'None'}
                                        </Card.Subtitle>
                                        <Card.Text>
                                            Created by: {note.creatorEmail}<br />
                                            Created on: {formatTimestamp(note.timestamp)}
                                        </Card.Text>
                                        {note.history.length > 0 && (
                                            <Card.Text>
                                                Last modified by: {note.history[note.history.length - 1].modifierEmail}<br />
                                                Last modified on: {formatTimestamp(note.history[note.history.length - 1].timestamp)}
                                            </Card.Text>
                                        )}
                                    </Card.Body>
                                    {user && (
                                        <Card.Footer>
                                            <Button variant="warning" onClick={() => handleEditNote(note)} className="me-2">
                                                Edit
                                            </Button>
                                            <Button variant="danger" onClick={() => handleDeleteNote(note.id)} className="me-2">
                                                Delete
                                            </Button>
                                            <Button variant="info" onClick={() => toggleHistory(note.id)}>
                                                {historyVisible === note.id ? 'Hide History' : 'View History'}
                                            </Button>
                                        </Card.Footer>
                                    )}
                                </Card>
                            </Col>
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
