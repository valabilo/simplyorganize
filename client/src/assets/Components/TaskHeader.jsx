import logo from "/images/SOlogo.png"
import { Image, Container } from "react-bootstrap"
import "./TaskHeader.css"
const Header = () => {
    return (
        <Container className="logo mt-4">
            <Image src={logo} alt="logo" />
        </Container>
    )
}
export default Header