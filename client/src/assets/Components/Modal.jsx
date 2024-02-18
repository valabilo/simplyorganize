import { Modal, Form, Row, Col, FloatingLabel, Button, Alert } from "react-bootstrap"
import { useState } from "react";
import * as formik from 'formik';
import * as yup from 'yup';


function CreateAccountModal(props) {
    const [showAlert, setShowAlert] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission
    const { Formik } = formik;
    const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

    const gender = [
        {
            key: "0",
            value: ""
        },
        {
            key: "1",
            value: "Male"
        },
        {
            key: "2",
            value: "Female"
        },
        {
            key: "3",
            value: "Prefer not to say"
        }
    ]
    const [formValues, setFormValues] = useState({
        // Initial form values
        first_name: '',
        last_name: '',
        user_email: '',
        password: '',
        confirmPassword: '',
        birthDate: '',
        gender: '',
        terms: false,
    });

    const schema = yup.object().shape({
        first_name: yup
            .string()
            .required(),
        last_name: yup
            .string()
            .required(),
        user_email: yup
            .string()
            .email()
            .required(),
        password: yup
            .string()
            .min(5)
            .matches(passwordRules, { messsage: "Please create a stronger password" }).required("Required"),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref("password"), null], "Password must match")
            .required("Required"),
        birthDate: yup
            .date()
            .required(),
        gender: yup
            .string()
            .required(),
        terms: yup
            .bool()
            .required()
            .oneOf([true], 'Terms must be accepted')
    });

    const onSubmit = async (values, { setSubmitting }) => {
        try {
            setIsSubmitting(true); // Set isSubmitting to true when form is being submitted

            const response = await fetch('http://localhost:8000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                // Handle successful signup
                console.log('Signup successful');
                setShowAlert(true); // Set showAlert to true here
                setFormValues({
                    first_name: '',
                    last_name: '',
                    user_email: '',
                    password: '',
                    confirmPassword: '',
                    birthDate: '',
                    gender: '',
                    terms: false,
                });
            } else {
                // Handle signup failure
                console.error('Signup failed');
            }
        } catch (error) {
            // Handle network errors or other exceptions
            console.error('Signup failed:', error);
        } finally {
            setIsSubmitting(false); // Reset isSubmitting when form submission is completed
            setSubmitting(false);
        }
    };
    const handleClose = () => {
        if (!showAlert) {
            setFormValues({
                first_name: '',
                last_name: '',
                user_email: '',
                password: '',
                confirmPassword: '',
                birthDate: '',
                gender: '',
                terms: false,
            });
        }
        props.onHide();
    };
    return (

        <Modal
            {...props}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton className="pb-2">
                <Modal.Title
                    className="px-3" id="contained-modal-title-vcenter">
                    <h2 className="mb-0 fw-bold">Sign Up</h2>
                    <span className="mb-0 fs-6 text-secondary">Quick and Easy</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4">
                <Formik
                    validationSchema={schema}
                    onSubmit={onSubmit}
                    initialValues={formValues}
                >
                    {({ handleSubmit, handleChange, values, touched, errors }) => (
                        <Form
                            noValidate
                            onSubmit={handleSubmit}
                            action="/"
                            method="post"
                        >
                            {/* Alert for successful signup */}
                            {showAlert && (
                                <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
                                    You successfully created an account.
                                </Alert>
                            )}
                            <Row className="">
                                {/*  -----------FIRST NAME------------- */}
                                <Form.Group className="mb-3" as={Col} >
                                    <FloatingLabel
                                        id='firstname'
                                        label="First Name"
                                    >
                                        <Form.Control
                                            autoComplete="first name"
                                            type="text"
                                            name="first_name"
                                            placeholder="first name"
                                            value={values.first_name}
                                            onChange={handleChange}
                                            isValid={touched.first_name && !errors.first_name}
                                            isInvalid={!!errors.first_name}
                                        />
                                    </FloatingLabel>
                                </Form.Group>
                                {/*  -----------LAST NAME------------- */}
                                <Form.Group as={Col} >
                                    <FloatingLabel
                                        id="lastname"
                                        label="Last Name"
                                    >
                                        <Form.Control
                                            autoComplete="last name"
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            placeholder="last name"
                                            value={values.last_name}
                                            onChange={handleChange}
                                            isValid={touched.last_name && !errors.last_name}
                                            isInvalid={!!errors.last_name}
                                        />
                                    </FloatingLabel>
                                </Form.Group>
                            </Row>
                            {/*  -----------EMAIL------------- */}
                            <Form.Group className="mb-3" >
                                <FloatingLabel
                                    label="Email address"
                                >
                                    <Form.Control
                                        autoComplete="new-email"
                                        value={values.user_email}
                                        onChange={handleChange}
                                        name="user_email"
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                        isValid={touched.user_email && !errors.user_email}
                                        isInvalid={!!errors.user_email}
                                    />
                                </FloatingLabel>
                            </Form.Group>
                            {/*  -----------PASSWORD------------- */}
                            <Form.Group
                                // onInput={up2.setCustomValidity(up2.value != up.value ? "Passwords do not match." : "")}
                                className="mb-3"
                            >
                                <FloatingLabel
                                    label="Password"
                                    name="up"
                                >
                                    <Form.Control
                                        autoComplete="new-password"
                                        name="password"
                                        type="password"
                                        placeholder="password"
                                        onChange={handleChange}
                                        isValid={touched.password && !errors.password}
                                        isInvalid={!!errors.password}
                                    />
                                </FloatingLabel>
                            </Form.Group>
                            {/*  -----------CONFIRM PASSWORD------------- */}
                            <Form.Group className="mb-3" name="up2" >
                                <FloatingLabel
                                    name="up2"
                                    label="Confirm Password"
                                >
                                    <Form.Control
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="confirm password"
                                        onChange={handleChange}
                                        isValid={touched.confirmPassword && !errors.confirmPassword}
                                        isInvalid={!!errors.confirmPassword}
                                    />
                                </FloatingLabel>
                            </Form.Group>
                            <Row className="mb-3">
                                <h6>Birthday</h6>
                                {/*  -----------BIRTHDATE------------- */}
                                <Form.Group as={Col} >
                                    <FloatingLabel
                                        label="Date"
                                    >
                                        <Form.Control
                                            name="birthDate"
                                            type="date"
                                            placeholder="birthDate"
                                            onChange={handleChange}
                                            isValid={touched.birthDate && !errors.birthDate}
                                            isInvalid={!!errors.birthDate}
                                        />
                                    </FloatingLabel>
                                </Form.Group>
                                {/*  -----------GENDER------------- */}
                                <Form.Group as={Col} >
                                    <FloatingLabel
                                        label="Gender">
                                        <Form.Control
                                            as="select"
                                            name="gender"
                                            placeholder="selectGender"
                                            onChange={handleChange}
                                            isValid={touched.gender && !errors.gender}
                                            isInvalid={!!errors.gender}
                                            value={values.gender}
                                        >
                                            {
                                                gender.map(drop => {
                                                    return (
                                                        <option key={drop.key}>
                                                            {drop.value}
                                                        </option>
                                                    )
                                                }
                                                )
                                            }
                                        </Form.Control>
                                    </FloatingLabel>
                                </Form.Group>
                            </Row>
                            {/*  -----------TERMS & CONDITIONS------------- */}
                            <Form.Group className="mb-3">
                                <Form.Check
                                    required
                                    name="terms"
                                    label="Agree to terms and conditions"
                                    onChange={handleChange}
                                    isInvalid={!!errors.terms}
                                    feedback={errors.terms}
                                    feedbackType="invalid"
                                    id="validationFormik0"
                                />
                            </Form.Group>
                            <div className="d-grid gap-2 mb-3">
                                {showAlert ? (
                                    <Button className="btn btn-lg btn-warning" onClick={handleClose}>
                                        SIGN IN
                                    </Button>
                                ) : (
                                    <Button className="btn btn-lg btn-warning" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Creating Account...' : 'SUBMIT'}
                                    </Button>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik >
            </Modal.Body>
        </Modal >
    );
}
export default CreateAccountModal;
