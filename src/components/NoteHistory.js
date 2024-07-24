// src/components/NoteHistory.js
import React from 'react';
import { ListGroup } from 'react-bootstrap';

const NoteHistory = ({ history = [] }) => {
    return (
        <div className="mt-4">
            <h4>Note History</h4>
            <ListGroup>
                {history.length === 0 ? (
                    <ListGroup.Item>No history available</ListGroup.Item>
                ) : (
                    history.map((version, index) => (
                        <ListGroup.Item key={index}>
                            <p><strong>Content:</strong> {version.content}</p>
                            <p><strong>Timestamp:</strong> {new Date(version.timestamp).toLocaleString()}</p>
                            <p><strong>Changed by:</strong> {version.email}</p>
                        </ListGroup.Item>
                    ))
                )}
            </ListGroup>
        </div>
    );
};

export default NoteHistory;
