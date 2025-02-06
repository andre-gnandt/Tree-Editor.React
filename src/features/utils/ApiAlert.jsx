import '../nodes/DetailsList.css';
import { Audio } from 'react-loader-spinner';
import React, {memo} from 'react';

const ApiAlert = memo(({hidden = true, id, message, graphic = true, color = null }) => {
    return (
        <div hidden = {hidden}  id = {id} className = {graphic ? 'alert-load transparent' : 'alert-load '+color}>
            { (graphic) && 
                (
                    <div className='alert-load-spinner center-text'>
                        <Audio
                            height="100%"
                            width="100%"
                            radius="100%"
                            color="black"
                            wrapperClass = 'loading-graphic'
                        />
                    </div>
                )
            }
            <div className = {graphic? 'center-text' : 'center-text alert-load-text' }>
                {message}
            </div>
        </div>
    );
});
export default ApiAlert 