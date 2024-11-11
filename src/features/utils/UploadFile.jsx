import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateNode } from '/LocalTreeData.React/src/api/nodes/nodesApi';
import { setStateProperty } from "../nodes/nodeSlice";
import { FileUpload } from 'primereact/fileupload';
import '../nodes/detailsList.css';

// Define a functional component named UploadAndDisplayImage
const UploadFile = (props) => {
  if(props.files == null){ return <></>;}
  //const stateNode = useSelector(state => state.node);
  const dispatch = useDispatch();
  const thumbnailUpload =  true;
  const node = {...props.node};
  const create = props.create;
  const fileChangeCallBack = props.fileChangeCallBack;
  const firstRender = useRef(true);
  const uploadName = useRef(null);
  const newUpload = useRef(false);
  const nodeFiles = props.node.files;
  const reader = new FileReader();
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [defaultFile, setDefaultFile] = useState(node.thumbnailId ? GetImageSource() : null);
  if(props.reset.reset)
  {
    props.reset.reset = false;
    setDefaultFile(node.thumbnailId ? GetImageSource() : null);
    setSelectedImage(null);
  }

  function GetImageSource()
    {
        var index = nodeFiles.findIndex((object) => object.id.toLowerCase() === node.thumbnailId.toLowerCase());
        if(index != -1)
        {
            return nodeFiles[index];
        }

        var file = nodeFiles.find((object) => object.name === node.thumbnailId);
        return file;
    }

  console.log("RE RENDER File Uploader");

  node.files = nodeFiles? [...nodeFiles] : [];

  const SetStateThumbnail = (value) => {
      firstRender.current = false;
      dispatch(setStateProperty({key: 'thumbnailId', value: value}));
  }

  const SetStateFiles = (value) => {
    firstRender.current = false;
    dispatch(setStateProperty({key: 'files', value: value}));
  }

  if(selectedImage && newUpload.current)
  {

    newUpload.current = false;
    console.log(selectedImage);
    console.log(uploadName.current);
    reader.onload = GetFileData;
    reader.readAsArrayBuffer(selectedImage);
  }

  function GetFileData(event)
  { 
    if(selectedImage)
    {   
      const file = 
      {
        id: "00000000-0000-0000-0000-000000000000",
        nodeid: node.id,
        name: uploadName.current,
        size: String(selectedImage.size),
        type: selectedImage.type,
        data: Array.from(new Uint8Array(event.target.result, 0)),
        base64: URL.createObjectURL(selectedImage), // only used here to render image in tree without making any api calls (not base64 in this unique case)
        isDeleted: false
      };
      if(thumbnailUpload)
      {
          node['thumbnailId'] = uploadName.current;
          SetStateThumbnail(uploadName.current);
      }

      //node.files.push(file);  --to be added back once file gallery is created
      node.files = [file]; //to be removed once file gallery is created
      SetStateFiles(node.files);
      fileChangeCallBack(true);
    }
  }

  function RemoveImage()
  {
    node.thumbnailId = null;
    SetStateThumbnail(null);
    setDefaultFile(null); 
    setSelectedImage(null);
    SetStateFiles([]); //to be removed when file gallery is created
      
    if(props.node.thumbnailId) 
    {
      fileChangeCallBack(true);
    }
    else
    {
      fileChangeCallBack(false);
    }
  }

  function FitThumbnailImage(fitToContainer)
  {
    if(fitToContainer) document.getElementById("thumbnail-expander").className = "thumbnail-expanded";
    if(!fitToContainer) document.getElementById("thumbnail-expander").className = "thumbnail-fit";
  }

  // Return the JSX for rendering
  return (
  <>
    <div id = 'thumbnail-uploader' style = {{height: '100%', width: '100%'}}>
        <div style = {{height: '33vh', width: '100%'}} className="title-container" onMouseOver={() => {FitThumbnailImage(false);}} onMouseOut = {() => {FitThumbnailImage(true);}}>
            {(selectedImage || defaultFile )&& (
                <>
                  <div id = 'thumbnail-expander' className="thumbnail-expanded">
                    <img
                        alt="not found"
                        className = 'image'
                        src={selectedImage ? URL.createObjectURL(selectedImage) : defaultFile.base64 }
                    />
                  </div>
                </>
            )}
        </div>
        <div style = {{}}>

            {(selectedImage || defaultFile) ? (
              <>
                <div className="text-overflow" style = {{height: '4vh', width: '100%'}}>{selectedImage ? selectedImage.name : defaultFile.name}</div>
                <div style = {{display: 'flex'}}>
                  <button className="button" style = {{width: '15vh', height: '5vh', marginRight: '2vh'}} onClick={() => { document.getElementById('file-upload-button').click()}}>+Upload</button>
                  <button className="button" style = {{width: '15vh', height: '5vh'}} onClick={() => {RemoveImage();}}>Remove</button>
                </div>
              </>
            ) : 
            (
              <>
                <div style = {{height: '4vh', width: '100%'}}></div>
                <button className="button" style = {{width: '15vh', height: '5vh'}} onClick={() => { document.getElementById('file-upload-button').click()}}>+Upload</button>
              </>
            )}  

                 
            <input
                type="file"
                id = 'file-upload-button'
                accept="image/png, image/gif, image/jpeg"
                style = {{visibility: 'hidden'}}
                //style = {{height: '7vh', width: '17vh'}}
                //className="button"
                onChange={(event) => {
                var fileName = event.target.files[0].name;
                var originalName = fileName;
                var matchingIndex = -2
                var i = 0
            
                while(matchingIndex !== -1)
                {
                    if(matchingIndex > -1)
                    {
                    fileName = originalName+"-"+String(i);
                    }
                    matchingIndex = node.files.findIndex((object) => object.name == fileName);
                    i++;
                }

                uploadName.current = fileName;
                newUpload.current = true;
                setSelectedImage(event.target.files[0]); 
                }}
            />
            {///<label for="img" className="button">Upload</label>
            }
        </div>
    </div>
  </>
  );
};

// Export the UploadAndDisplayImage component as default
export default UploadFile;