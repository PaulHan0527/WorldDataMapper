import React from 'react';

import { WModal, WMHeader, WMMain, WButton, WCol, WRow } from 'wt-frontend';

const Delete = (props) => {
    const handleDelete = async () => {
        props.deleteRootRegion(props._id);
        props.reloadRegions();
        props.setShowDelete(false);
        props.setActiveRegion({});
    }

    return (
        <WModal className="update-modal" visible={true} cover={true} animation="slide-fade-top">

            <div className="modal-header" onClose={() => props.setShowDelete(false)}>
                <WMHeader onClose={() => props.setShowDelete(false)}>
                    Delete Region?
                </WMHeader>
            </div>


            <WMMain className='modal-main'>
                <h2>You will delete ALL of its subregions, too.</h2>
                
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

export default Delete;