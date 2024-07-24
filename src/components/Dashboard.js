// src/components/Dashboard.js
import React from 'react';
import Notes from './Notes';
import { Container } from 'react-bootstrap';

const Dashboard = () => {
    return (
        <Container className="mt-5">
            <Notes />
        </Container>
    );
};

export default Dashboard;
