import { BrowserRouter, Routes, Route } from "react-router-dom";
import history from './history';
import TreesMenuPage from "./pages/trees/TreesMenuPage";
import TreePage from "./pages/trees/TreePage";

const App = () => {
  
  return (
    <BrowserRouter>
      <Routes history={history}>
        <Route path="/">
          <Route index element={<TreesMenuPage />} />
          <Route path="tree/:id" element={<TreePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
