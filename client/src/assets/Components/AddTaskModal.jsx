// AddTaskModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, FloatingLabel, Col, Row, Button, Alert } from 'react-bootstrap';
import './AddTaskModal.css';

const AddTaskModal = ({ show, onHide, handleTaskAction, taskDetails, userId }) => {
    const [initialTaskData] = useState({
        task_name: '',
        notes: '',
        deadline: '',
        priority: '',
        label: '',
        progress: '',
    });
    const [taskData, setTaskData] = useState(initialTaskData);

    useEffect(() => {
        if (show) {
            // Reset the taskData state when the modal is shown
            setTaskData(initialTaskData);
        }
    }, [show]);

    useEffect(() => {
        if (taskDetails) {
            setTaskData({
                ...taskDetails,
                // Format deadline if provided
                deadline: taskDetails.deadline ? taskDetails.deadline.split('T')[0] : ''
            });
        }
    }, [taskDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const editedTask = {
            ...taskDetails,
            ...taskData,
            user_id: userId,
        };
        handleTaskAction(editedTask);
    };

    return (
        <Modal show={show} onHide={onHide} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <h4 className="mb-0 fw-bold">
                        <i className="mx-2 bi bi-check2-square"></i>Add Task
                    </h4>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleFormSubmit}>
                    <Form.Group className="mb-3">
                        <FloatingLabel label="Task Name" controlId="floatingTextarea1">
                            <Form.Control
                                type="text"
                                name='task_name'
                                placeholder="Enter task name"
                                value={taskData.task_name}
                                onChange={handleChange}
                            />
                        </FloatingLabel>
                    </Form.Group>
                    <Col className="mb-3">
                        <FloatingLabel controlId="floatingTextarea2" label="Notes">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name='notes'
                                placeholder="Enter notes"
                                value={taskData.notes}
                                onChange={handleChange}
                            />
                        </FloatingLabel>
                    </Col>
                    <Row className="mb-3">
                        <Col>
                            <Form.Group>
                                <FloatingLabel label="Deadline">
                                    <Form.Control
                                        name="deadline"
                                        type="date"
                                        placeholder="deadline"
                                        value={taskData.deadline}
                                        onChange={handleChange}
                                    />
                                </FloatingLabel>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group as={Col}>
                                <FloatingLabel label="Priority">
                                    <Form.Control
                                        as="select"
                                        name="priority"
                                        placeholder="priority"
                                        value={taskData.priority}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Priority</option> {/* Add an empty option */}
                                        <option value="No Priority">No Priority</option> {/* Example options */}
                                        <option value="Low Priority">Low Priority</option>
                                        <option value="Medium Priority">Medium Priority</option>
                                        <option value="High Priority">High Priority</option>
                                    </Form.Control>
                                </FloatingLabel>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <Form.Group>
                                <FloatingLabel label="Label">
                                    <Form.Control
                                        as="select"
                                        name="label"
                                        placeholder="label"
                                        value={taskData.label}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Label</option> {/* Add an empty option */}
                                        <option value="Personal">Personal</option> {/* Example options */}
                                        <option value="Family">Family</option>
                                        <option value="Home">Home</option>
                                        <option value="Work">Work</option>
                                    </Form.Control>
                                </FloatingLabel>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <FloatingLabel label="Progress">
                                    <Form.Control
                                        as="select"
                                        name="progress"
                                        placeholder="progress"
                                        value={taskData.progress}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Progress</option> {/* Add an empty option */}
                                        <option value="Not Started">Not Started</option> {/* Example options */}
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </Form.Control>
                                </FloatingLabel>
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="d-grid gap-2 mb-3">
                        <Button variant="primary" type="submit">
                            {taskDetails ? 'Update Task' : 'Add Task'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddTaskModal;