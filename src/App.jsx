import { BrowserRouter, Routes, Route } from "react-router-dom";
import Tree from "./Tree";
import history from './history';
import TreesMenuPage from "./TreesMenuPage";
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';

const App = () => {
  
  return (
    <BrowserRouter>
      <Routes history={history}>
        <Route path="/">
          <Route index element={<TreesMenuPage />} />
          <Route path="tree/:id" element=
          {
              <Tree />
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
