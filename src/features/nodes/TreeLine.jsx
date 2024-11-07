import { useState, useEffect, useRef } from 'react';
import LineTo from 'react-lineto';

const TreeLine = (onMount, from, to) => {

  const [value, setValue] = useState(0);
  console.log("onMount");
  console.log(onMount);
  console.log("from");
  console.log(from);
  console.log("to");
  console.log(to);

  useEffect(() => {
    onMount([value, setValue]);
  }, [onMount, value]);

  return (
    <>
      
    </> 
  );
};

export default TreeLine