import React, { useState } from 'react';
import { Table, Container, Button, Form, Dropdown, DropdownButton, InputGroup, ButtonGroup, Badge, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AddTaskModal from '../../Components/AddTaskModal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { format } from 'date-fns';
import './tasks.css';

const Tasks = ({ setAuthenticated }) => {
    const navigate = useNavigate();
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [userId, setUserId] = useState(localStorage.getItem('user_id'));
    const [tasksCount, setTasksCount] = useState(0);
    const [isLoading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');
    const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
    const [filterOption, setFilterOption] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTasksFromServer = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/tasks', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const result = await response.json();

        if (response.ok) {
            setTasksCount(result.tasks.length);
            return result;
        } else {
            showToast('danger', `Error fetching tasks: ${result.message}`);
            return { tasks: [] };
        }
    };

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setAuthenticated(false);
                navigate('http://localhost:5173/login');
                return;
            }
            try {
                // Fetch tasks from the server
                const response = await fetch('http://localhost:8000/tasks', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const result = await response.json();
                if (response.ok) {
                    setTasksCount(result.tasks.length);
                    setTasks(result.tasks);
                } else if (response.status === 401) {
                    // Token expired or invalid
                    setAuthenticated(false);
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    setShowToast(true);
                    setToastVariant('danger');
                    setToastMessage(`Error fetching tasks: ${result.message}`);
                }
            } catch (error) {
                setShowToast(true);
                setToastVariant('danger');
                setToastMessage(`Error fetching tasks: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [navigate, setAuthenticated]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        setAuthenticated(false);
        navigate('/login');
    };

    const handleCheckboxChange = (taskId) => {
        setSelectedTasks(prevTasks => {
            if (prevTasks.includes(taskId)) {
                return prevTasks.filter(id => id !== taskId);
            } else {
                return [...prevTasks, taskId];
            }
        });
    };

    const handleThreeDotClick = (taskId) => {
        setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
    };

    const handleEdit = (taskId) => {
        const selectedTask = tasks.find((task) => task.id === taskId);
        setSelectedTaskDetails(selectedTask);
        setModalShow(true);
    };

    const handleDelete = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const tasksResponse = await fetchTasksFromServer();
                setTasks(tasksResponse.tasks);
                setShowToast(true); // Use setShowToast to set the showToast state
                setToastVariant('success');
                setToastMessage('Task deleted successfully!');
            } else {
                setShowToast(true); // Use setShowToast to set the showToast state
                setToastVariant('danger');
                setToastMessage(`Error deleting task: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            setShowToast(true); // Use setShowToast to set the showToast state
            setToastVariant('danger');
            setToastMessage(`Error deleting task: ${error.message}`);
        }
    };

    const handleTaskAddition = async (newTask) => {
        if (!newTask.deadline) {
            newTask.deadline = new Date(); // Set deadline to today's date
        }
        if (!newTask.priority) {
            newTask.priority = 'No Priority';
        }
        if (!newTask.progress) {
            newTask.progress = 'Not Started';
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/tasks', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTask),
            });

            const result = await response.json();

            if (response.ok) {
                // Update the tasks state with the new task
                setTasks(prevTasks => [...prevTasks, result.task]); // Assuming the server returns the added task
                setModalShow(false);
                // Clear the input fields in the modal
                setSelectedTaskDetails(null);
                // Show success toast
                setShowToast(true);
                setToastVariant('success');
                setToastMessage('Task added successfully!');
                setSelectedTasks(prevTasks => prevTasks.filter(id => id !== newTask.id));
            } else {
                console.error('Error adding task:', result.message);
                // Show error toast
                setShowToast(true);
                setToastVariant('danger');
                setToastMessage(`Error adding task: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding task:', error.message);
            // Show error toast
            setShowToast(true);
            setToastVariant('danger');
            setToastMessage(`Error adding task: ${error.message}`);
        }
    };



    const handleTaskUpdate = async (updatedTask) => {
        if (!updatedTask.deadline) {
            updatedTask.deadline = new Date(); // Set deadline to today's date
        }
        if (!updatedTask.priority) {
            updatedTask.priority = 'No Priority';
        }
        if (!updatedTask.progress) {
            updatedTask.progress = 'Not Started';
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/tasks/${updatedTask.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask),
            });
            const result = await response.json();
            if (response.ok) {
                const updatedTasks = tasks.map((task) => (task.id === updatedTask.id ? result.task : task));
                setTasks(updatedTasks);
                setShowToast(true);
                setToastVariant('success');
                setToastMessage('Task updated successfully!');
                setModalShow(false);
            } else {
                setShowToast(true);
                setToastVariant('danger');
                setToastMessage(`Error updating task: ${result.message}`);
            }
        } catch (error) {
            setShowToast(true);
            setToastVariant('danger');
            setToastMessage(`Error updating task: ${error.message}`);
        }
    };

    const formatDaysLeft = (deadline) => {
        const now = new Date();
        const dueDate = new Date(deadline);
        // Set both dates to UTC to ensure consistent comparison
        const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        const dueDateUTC = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        // Calculate the difference in days
        const daysDifference = Math.floor((dueDateUTC - nowUTC) / (1000 * 60 * 60 * 24));
        if (daysDifference > 1) {
            return `${daysDifference} days left`;
        } else if (daysDifference === 1) {
            return 'Tomorrow';
        } else if (daysDifference === 0) {
            return 'Today';
        } else {
            const daysAgo = Math.abs(daysDifference);
            const daysAgoText = daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
            return <span style={{ color: 'red', fontWeight: 'bold' }}>Due {daysAgoText}</span>;
        }
    };

    const filteredTasks = tasks.filter(task => {
        // Filter based on search query
        if (searchQuery.trim() !== '') {
            if (!task.task_name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
        }
        // Filter based on selected status
        if (filterOption && task.progress_id !== filterOption) {
            return false;
        }
        return true;
    });
    return (
        <>
            <div
                onClick={handleLogout}
                className="logout bi bi-box-arrow-right">
                <span className='ms-2 fw-bold text-decoration-none'>
                    Logout
                </span>
            </div>
            <Container className='add-task my-4 d-flex flex-column' >
                <h2 type="button" className="d-flex">
                    <i className="bi bi-inboxes mx-2"></i>
                    <Button variant='link' size='lg' className='p-0 position-relative text-decoration-none text-dark fw-bold fs-3'>Inbox
                        {tasksCount > 0 && (
                            <Badge bg="light" text="danger" id='badge' className="start-100 position-absolute translate-top badge rounded-pill">
                                {filteredTasks.length}
                                <span className="visually-hidden">task displayed</span>
                            </Badge>
                        )}
                    </Button>
                </h2>
                <hr className='my-1 mx-2  border border-danger border-1 opacity-50' />
                <div>
                    <Button
                        variant='link'
                        className="me-auto text-dark text-decoration-none btn-lg"
                        onClick={() => setModalShow(true)}
                    >
                        <i className="mx-2 bi bi-check2-square"></i>
                        Add Task
                    </Button>
                    <AddTaskModal
                        show={modalShow}
                        onHide={() => setModalShow(false)}
                        handleTaskAction={selectedTaskDetails ? handleTaskUpdate : handleTaskAddition}
                        userId={userId}
                        taskDetails={selectedTaskDetails}
                    />
                </div>
            </Container >
            <Container className="table-container my-3 py-5 border border-success p-2 border-opacity-10 rounded">
                <div className='hstack gap-3 px-5'>
                    <h3>{isLoading ? <Skeleton width={150} /> : 'My Tasks'}</h3>
                    {isLoading ? <Skeleton width={350} height={33} /> :
                        <InputGroup size='' className='w-50 ms-auto'>
                            <InputGroup.Text>
                                <i className="bi bi-search"></i>
                            </InputGroup.Text>
                            <Form.Control aria-label="Small"
                                aria-describedby="inputGroup-sizing-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder='search' id="task-search-input" />
                        </InputGroup>}
                    {isLoading ? <Skeleton width={50} height={33} /> :
                        <DropdownButton
                            as={ButtonGroup}
                            align={{ lg: 'end' }}
                            title="Filter"
                            variant='outline-success'
                            className='dd-filter btn-outline-secondary'
                            id="filter-dropdown"
                        >
                            <Dropdown.Item onClick={() => setFilterOption(null)}>All Tasks</Dropdown.Item>
                            <Dropdown.Item onClick={() => setFilterOption('Not Started')}>Not Started</Dropdown.Item>
                            <Dropdown.Item onClick={() => setFilterOption('In Progress')}>In Progress</Dropdown.Item>
                            <Dropdown.Item onClick={() => setFilterOption('Completed')}>Completed</Dropdown.Item>
                        </DropdownButton>}
                    {isLoading ? <Skeleton width={50} height={33} /> :
                        <Button
                            variant='outline-success'
                            className='three-dot'
                            onClick={() => handleThreeDotClick(selectedTaskId)}
                        >
                            <i className="bi bi-three-dots-vertical"></i>
                        </Button>
                    }
                </div>
                <Container className='mt-5 px-5'>
                    {isLoading ?
                        (<Table striped hover responsive className='border border-light-subtle rounded-3 overflow-hidden'>
                            <thead id='table-header'>
                                <tr>
                                    <th>{isLoading ? <Skeleton width={100} /> : 'sample'}</th>
                                    <th>{isLoading ? <Skeleton width={100} /> : 'sample'}</th>
                                    <th>{isLoading ? <Skeleton width={100} /> : 'sample'}</th>
                                    <th>{isLoading ? <Skeleton width={100} /> : 'sample'}</th>
                                    <th>{isLoading ? <Skeleton width={100} /> : 'sample'}</th>
                                    <th>{isLoading ? <Skeleton width={100} /> : 'sample'}</th>
                                    <th>{isLoading ? <Skeleton width={100} /> : 'sample'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, index) => (
                                    <tr key={index}>
                                        <td>{isLoading ? <Skeleton width={100} /> : 'sample'}</td>
                                        <td>{isLoading ? <Skeleton width={100} /> : 'sample'}</td>
                                        <td>{isLoading ? <Skeleton width={100} /> : 'sample'}</td>
                                        <td>{isLoading ? <Skeleton width={50} /> : 'sample'}</td>
                                        <td>{isLoading ? <Skeleton width={50} /> : 'sample'}</td>
                                        <td>{isLoading ? <Skeleton width={50} /> : 'sample'}</td>
                                        <td>{isLoading ? <Skeleton width={50} /> : 'sample'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>) : (
                            <Table striped hover responsive className='border border-light-subtle rounded-3 overflow-hidden'>
                                <thead id='table-header'>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                onChange={() => {
                                                    const allTaskIds = tasks.map((task) => task.id);
                                                    setSelectedTasks(selectedTasks.length === allTaskIds.length ? [] : allTaskIds);
                                                }}
                                                checked={selectedTasks.length === tasks.length}
                                            />
                                        </th>
                                        <th>Task name</th>
                                        <th>Notes</th>
                                        <th>Deadline</th>
                                        <th>Priority</th>
                                        <th>Labels</th>
                                        <th>Days Left</th>
                                        <th>Progress</th>
                                        {selectedTasks.length > 0 && (
                                            <th>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.length > 0 ? (
                                        filteredTasks.map((task) => (
                                            <tr key={`task_${task.id}`}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleCheckboxChange(task.id)}
                                                        checked={selectedTasks.includes(task.id)}
                                                    />
                                                </td>
                                                <td>{task.task_name}</td>
                                                <td>{task.subtask}</td>
                                                <td>{task.deadline ? format(new Date(task.deadline), 'MMMM, dd, yyyy') : 'No Deadline'}</td>
                                                <td>
                                                    <div className='text-center text-light bg-primary rounded-pill px-0'>
                                                        {task.priority_id}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className='text-center text-light bg-success rounded-pill px-1'>{task.label_id}
                                                    </div>
                                                </td>
                                                <td>{task.deadline ? formatDaysLeft(task.deadline) : 'No Deadline'}</td>
                                                <td>
                                                    <div className='text-center text-light bg-warning rounded-pill px-1'>
                                                        {task.progress_id}
                                                    </div>
                                                </td>
                                                {selectedTasks.includes(task.id) && (
                                                    <td>
                                                        <Button
                                                            variant='outline-info'
                                                            className='mx-1'
                                                            size='sm'
                                                            onClick={() => handleEdit(task.id)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant='outline-danger'
                                                            className='mx-1'
                                                            size='sm'
                                                            onClick={() => handleDelete(task.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className='no-task '>
                                            <td colSpan="9" className="text-center">
                                                <div className='justify-center-center mt-sm-5'>
                                                    <div className=''>
                                                        <div> No Tasks Found</div>
                                                        <div>
                                                            <Button className='py-0' variant='link' onClick={() => setModalShow(true)}>create</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        )}
                </Container>
            </Container>
            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={5000}
                autohide
                variant={toastVariant}
                style={{ position: 'fixed', bottom: 10, right: 10 }}
            >
                <Toast.Header>
                    <strong className="me-auto">{toastVariant === 'success' ? 'Success' : 'Error'}</strong>
                </Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </>
    );
};

export default Tasks;
