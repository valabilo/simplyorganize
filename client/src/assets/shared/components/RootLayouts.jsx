import Header from '../../Components/TaskHeader'
import { ThemeProvider } from "react-bootstrap"

const RootLayouts = ({ children }) => {
    return (
        <ThemeProvider
            breakpoints={['xxl', 'xxl', 'xl', 'lg', 'md', 'sm', 'xs', 'xxs']}
            minBreakpoint="xxs"
        >
            <Header />
            {children}
        </ThemeProvider>
    );
}
export default RootLayouts;