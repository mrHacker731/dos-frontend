import Editor from "./components/Editor";
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import Home from "./components/Home";


function App() {


  return (
    <>
      <BrowserRouter>
       <Routes>
          <Route path='/' element={<Home/>}>
           
          </Route>
          <Route path='/document/:id' element={<Editor/>}/>
       </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
