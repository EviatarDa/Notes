// src/components/NoteHistory.js
import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';

const NoteHistory = ({ history = [], onRevert }) => {
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
                            <p><strong>Modified by:</strong> {version.modifierEmail}</p>
                            <Button
                                variant="success"
                                onClick={() => onRevert(version)}
                                className="mt-2"
                            >
                                Revert to this version
                            </Button>
                        </ListGroup.Item>
                    ))
                )}
            </ListGroup>
        </div>
    );
};

export default NoteHistory;
