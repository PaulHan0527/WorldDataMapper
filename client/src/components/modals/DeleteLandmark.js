import React from 'react';

import { WModal, WMHeader, WMMain, WButton, WCol, WRow } from 'wt-frontend';

const DeleteLandmark = (props) => {


    const handleDelete = async () => {
        props.deleteLandmark(props.activeRegionViewer, props.landmark);
        props.setShowDelete(false);
    }

    return (
        <WModal className="update-modal" visible={true} cover={true} animation="slide-fade-top">

            <div className="modal-header" onClose={() => props.setShowDelete(false)}>
                <WMHeader onClose={() => props.setShowDelete(false)}>
                    Delete Landmark?
                </WMHeader>
            </div>


            <WMMain className='modal-main'>
                <h2>Will you delete the landmark : {props.landmark} ?</h2>
                
                <h2>Are You Sure?</h2>
                <div className="modal-spacer">&nbsp;</div>

                <WRow className="modal-buttons-row">
                    <WCol size='1'></WCol>
                    <WCol size='4'>
                    <WButton className="modal-button" onClick={handleDelete} clickAnimation="ripple-light" hoverAnimation="darken" shape="rounded" color="danger">
                            Delete
				    </WButton>
                        
                    </WCol>

                    <WCol size='2'></WCol>
                    <WCol size='4'>
                    <WButton className="modal-button cancel-button" onClick={() => props.setShowDelete(false)} clickAnimation="ripple-light" hoverAnimation="darken" shape="rounded">
                            Cancel
				        </WButton>
                    </WCol>
                    <WCol size='1'></WCol>
                </WRow>

            </WMMain>


        </WModal>
    );
}

export default DeleteLandmark;