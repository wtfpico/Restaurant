import './App.css';
import KitchenPanel from "./staff-portal/KitchenPanel/KitchenPanel";
import DeliveryPanel from "./staff-portal/DeliveryPanel/DeliveryPanel";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import 'antd/dist/reset.css'; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/staff/kitchen" element={<KitchenPanel />} />
        <Route path="/staff/delivery" element={<DeliveryPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
