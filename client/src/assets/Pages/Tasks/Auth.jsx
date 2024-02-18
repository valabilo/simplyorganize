import { Navigate } from 'react-router-dom';

const Auth = ({ authenticated, children }) => {
    console.log('Authenticated:', authenticated);

    if (!authenticated) {
        console.log('Redirecting to login');
        return <Navigate to="/login" />;
    }

    return children;
};

export default Auth;