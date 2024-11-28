import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setStateProperty } from "../nodes/nodeSlice";
import '../nodes/detailsList.css';
import 'primeicons/primeicons.css';

const UploadFile = (props) => {
  //const stateNode = useSelector(state => state.node);
  const dispatch = useDispatch();
  const thumbnailUpload =  true;
  const node = {...props.node};
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
        isDeleted: 0
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
    document.getElementById('file-upload-button').value = null;
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
    if(selectedImage || defaultFile)
    {
      if(fitToContainer) document.getElementById("thumbnail-expander").className = "thumbnail-expanded";
      if(!fitToContainer) document.getElementById("thumbnail-expander").className = "thumbnail-fit";
    }
  }

  return (
  <>
    <div id = 'thumbnail-uploader' style = {{height: '100%', width: '100%'}}>
        <div style = {{height: '33vh', width: '100%'}} className="title-container" onMouseOver={() => {FitThumbnailImage(false);}} onMouseOut = {() => {FitThumbnailImage(true);}}>
          { (selectedImage || defaultFile ) ? (
                <>
                  <div id = 'thumbnail-expander' className="thumbnail-expanded">
                    <img
                        alt="not found"
                        className = 'image'
                        src={selectedImage ? URL.createObjectURL(selectedImage) : defaultFile.base64 }
                    />
                  </div>
                </>
            )
            :
            (
              <>
                <div className = 'thumbnail-placeholder' onClick = {() => {document.getElementById('file-upload-button').click();}}>
                  <i className='pi pi-upload' style = {{position: 'relative', top: '8vh', fontSize: '11vh', height: '11vh', width: '11vh'}}/>
                  <div style = {{position: 'relative', top: '10vh'}}>
                    Upload Image!
                  </div>
                </div>
              </>
            )          
          }
        </div>
        <div style = {{}}>

            {(selectedImage || defaultFile) ? (
              <>
                <div className="text-overflow dialog-header" style = {{fontSize: '3vh', height: '5vh', width: '100%'}}>{selectedImage ? selectedImage.name : defaultFile.name}</div>
                <div style = {{height: '6vh', display: 'flex'}}>
                  <button className="button text-overflow" style = {{fontSize: '3vh', width: '16vh', height: '6vh', marginRight: '1vh'}} onClick={() => { document.getElementById('file-upload-button').click()}}>+Upload</button>
                  <button className="button text-overflow" style = {{fontSize: '3vh', width: '16vh', height: '6vh'}} onClick={() => {RemoveImage();}}>Remove</button>
                </div>
              </>
            ) : 
            (
              <>
                <div style = {{height: '4vh', width: '100%'}}></div>
                <button className="button text-overflow" style = {{fontSize: '3vh', width: '16vh', height: '6vh'}} onClick={() => { document.getElementById('file-upload-button').click()}}>+Upload</button>
              </>
            )}  

            <input
                type="file"
                id = 'file-upload-button'
                accept="image/png, image/gif, image/jpeg"
                style = {{visibility: 'hidden'}}
                onChange={(event) => 
                {
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