import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TreesMenu from "./features/trees/TreesMenu";
import Tree from "./Tree";


const App = () => {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<TreesMenu />} />
          <Route path="tree" element={<Tree />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
