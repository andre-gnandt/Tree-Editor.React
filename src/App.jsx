import ReactDOM from "react-dom/client";
import { BrowserRouter, Router, Routes, Route } from "react-router-dom";
import TreesMenu from "./features/trees/TreesMenu";
import Tree from "./Tree";
import history from './history';


const App = () => {
  
  return (
    <BrowserRouter>
      <Routes history={history}>
        <Route path="/">
          <Route index element={<TreesMenu />} />
          <Route path="tree/:id" element={<Tree />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
