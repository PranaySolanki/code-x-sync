import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomeScreen } from "./screen/homescreen";
import { PlaygroundScreen } from "./screen/playgroundscreen";
import { LoginScreen } from "./screen/loginscreen";  // Make sure this matches the export
// import LandingPage from './screen/LandingPage/LandingPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/playground" element={<PlaygroundScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                {/* <Route path="/home" element={<LandingPage />} /> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
