// src/components/NoteHistory.js

import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';

const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.toDate) {
        const date = timestamp.toDate();
        return date.toLocaleString(); // Adjust format as needed
    }
    return 'Invalid Date';
};

const NoteHistory = ({ history, onRevert }) => {
    return (
        <ListGroup className="mt-3">
            {history.map((version, index) => (
                <ListGroup.Item key={index}>
                    <div>{version.content}</div>
                    <small className="text-muted">
                        Modified on: {formatTimestamp(version.timestamp)}<br />
                        Modified by: {version.modifierEmail}
                    </small>
                    <Button variant="info" onClick={() => onRevert(version)} className="mt-2">
                        Revert to this version
                    </Button>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

export default NoteHistory;
