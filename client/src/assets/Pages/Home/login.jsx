import { Form, Button, InputGroup, Alert, Col, Spinner } from 'react-bootstrap';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import CreateAccountModal from '../../Components/Modal';

const Login = ({ setAuthenticated }) => {
    const [modalShow, setModalShow] = useState(false);
    const [user_email, setUser_email] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const navigate = useNavigate();
    const timerRef = useRef(null);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);

        // If the timer is already running, clear it
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Set a timer to revert password visibility after 2 seconds
        timerRef.current = setTimeout(() => {
            setShowPassword(false);
        }, 2000);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_email, password }),
            });

            if (response.ok) {
                const { token, user_id } = await response.json();

                // Save the token and user_id in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user_id', user_id);

                setAuthenticated(true);  // Set authentication state in the parent component
                navigate('/tasks');
            } else {
                const errorResponse = await response.json();
                setShowError(true);
                console.error('Login failed:', errorResponse.message);
            }
        } catch (error) {
            console.error('Login failed - Unexpected error:', error);
            setShowError(true);
        } finally {
            setLoading(false);
            setPassword('');
        }
    };

    return (
        <div className='home-style'>
            <Form onSubmit={handleLogin} className='form mt-3'>
                {showError && (
                    <Alert variant='danger' onClose={() => setShowError(false)} dismissible>
                        Invalid credentials. Please try again.
                    </Alert>
                )}
                <Form.Group className="mb-3" controlId="formGroupEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        autoComplete='user_email'
                        value={user_email}
                        onChange={(e) => setUser_email(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <InputGroup className="mb-3">
                        <Form.Control
                            autoComplete='current-password'
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            aria-label="password"
                            aria-describedby="basic-addon"
                            name="password"
                            required
                        />
                        <InputGroup.Text id="basic-addon2">
                            {showPassword ? (
                                <i
                                    className="bi bi-eye"
                                    onClick={togglePasswordVisibility}
                                    style={{ cursor: 'pointer' }}
                                />
                            ) : (
                                <i
                                    className="bi bi-eye-slash"
                                    onClick={togglePasswordVisibility}
                                    style={{ cursor: 'pointer' }}
                                />
                            )}
                        </InputGroup.Text>
                    </InputGroup>
                    <Col className='mb-3'>
                        <Form.Check id='remember-me' label="Remember me" />
                    </Col>
                </Form.Group>
                <div className="d-grid gap-2">
                    <Button variant="secondary" size="lg" type='submit' disabled={isLoading}>
                        {isLoading ? <Spinner animation="border" size="sm" /> : 'LOGIN'}
                    </Button>
                </div>
                <div className='forgot-pass'>
                    <Button className='mt-2' variant='link' href='/'>
                        Forgot Password?
                    </Button>
                </div>
                <hr />
                <div className='create'>
                    <Button
                        className="create-account mb-3"
                        variant="warning"
                        onClick={() => setModalShow(true)}
                        size="lg"
                    >
                        CREATE NEW ACCOUNT
                    </Button>
                    <CreateAccountModal
                        show={modalShow}
                        onHide={() => setModalShow(false)} />
                </div>
                <div className='guest'>
                    <Button
                        href='/tasks'
                        variant='link'
                        className='link-body-emphasis link-offset-2 link-underline-opacity-25 link-underline-opacity-75-hover'
                        size="lg"
                        disabled={isLoading}
                        onClick={!isLoading ? handleLogin : null}
                    >
                        {isLoading ? 'Loading…' : 'CONTINUE AS GUEST USER'}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default Login;
