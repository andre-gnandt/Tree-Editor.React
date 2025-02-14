import React, { useState, useRef, memo, useMemo } from "react";
import { useDispatch } from "react-redux";
import { uploadThumbnail, removeThumbnail } from "../nodes/nodeSlice";
import '../nodes/DetailsList.css';
import 'primeicons/primeicons.css';

const UploadThumbnail = memo(({thumbnail, fileChangeCallBack, inputNode}) => {
  const dispatch = useDispatch();
  const uploadName = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(thumbnail && thumbnail.base64 ? thumbnail : null);
  const reader = new FileReader();

  const node = {...inputNode};
  node.files = inputNode.files? [...inputNode.files] : [];

  useMemo(() => {
    setThumbnailFile(thumbnail && thumbnail.base64 ? thumbnail : null);
    setSelectedImage(null);
  }, [thumbnail]);

  useMemo(() => {
    if(selectedImage)
    {
      reader.onload = GetFileData;
      reader.readAsDataURL(selectedImage);
    }
  }, [selectedImage]);
    
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
        data: reader.result,
        base64: reader.result, // 
      };
          
      fileChangeCallBack(true);
      node['thumbnailId'] = uploadName.current;
      //node.files.push(file);  --to be added back once file gallery is created
      node.files = [file]; //to be removed once file gallery is created
      setThumbnailFile(file);
      dispatch(uploadThumbnail({files: node.files, name: file.name}));  
    }
  }

  function RemoveImage()
  {
    if(inputNode.thumbnailId) 
    {
      fileChangeCallBack(true);
    }
    else
    {
      fileChangeCallBack(false);
    }

    document.getElementById('file-upload-button').value = null;
    node.thumbnailId = null;
    setThumbnailFile(null);
    dispatch(removeThumbnail()); //change to only remove the thumbnailId once file gallery is added
    setSelectedImage(null);
  }

  return (
  <>
    <div id = 'thumbnail-uploader' style = {{height: '100%', width: '100%'}}>
        <div style = {{height: '75%', width: '100%'}} className="title-container" /*onMouseOver={() => {FitThumbnailImage(false);}} onMouseOut = {() => {FitThumbnailImage(true);}}*/>
          { (thumbnailFile || selectedImage) ? (
                <>
                  <div id = 'thumbnail-expander' className="thumbnail-expanded">
                    <img
                        alt="not found"
                        className = 'image'
                        src={thumbnailFile ? thumbnailFile.base64 : URL.createObjectURL(selectedImage)}
                    />
                  </div>
                </>
            )
            :
            (
              <>
                <div className = 'thumbnail-placeholder' /*style = {{fontSize: mobile ? '3vw' : '3vh'}}*/  onClick = {() => {document.getElementById('file-upload-button').click();}}>           
                  <div className="empty-thumbnail-container" >
                    <i className='pi pi-upload thumbnail-icon' /*style = {{ position: 'relative',  fontSize: 'min(5rem, 14vw)'}} /*style = {{position: 'relative', top: '50%', fontSize: '5rem', height: '11vh', width: '11vh'}} *//>   
                  </div>
                  <div className="upload-thumbnail">
                    Upload Image!
                  </div> 
                </div>
              </>
            )          
          }
        </div>
        <div style = {{height: '25%', width: '100%'}}>
            {/*9.9vw under image, width is 29.7 vw*/}
            {(thumbnailFile || selectedImage) ? (
              <>              
                <div className="text-overflow dialog-header thumbnail-title">{thumbnailFile ? thumbnailFile.name : selectedImage.name}</div>
                <div className="thumbnail-buttons-container" >
                  <button className="button thumbnail-button" style = {{marginRight: '4%'}} onClick={() => { document.getElementById('file-upload-button').click()}}>+Upload</button>
                  <button className="button thumbnail-button" onClick={() => {RemoveImage();}}>Remove</button>
                </div>
              </>
            ) : 
            (
              <>
                <div className="text-overflow dialog-header thumbnail-title">No Thumbnail</div>
                <button className="button thumbnail-button" style = {{height: '50%'}} onClick={() => { document.getElementById('file-upload-button').click()}}>+Upload</button>
              </>
            )}  

            <input
                type="file"
                id = 'file-upload-button'
                accept="image/png, image/gif, image/jpeg"
                style = {{visibility: 'hidden'}}
                onChange={(event) => 
                {
                    let fileName = event.target.files[0].name;
                    let originalName = fileName;
                    let matchingIndex = -2
                    let i = 0
                
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
                    setSelectedImage(event.target.files[0]); 
                }}
            />
        </div>
    </div>
  </>
  );
});

export default UploadThumbnail;