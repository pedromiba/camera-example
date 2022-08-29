import { IonButton, IonImg } from '@ionic/react';
import { useState } from 'react';
import { usePhotoLibrary } from '../hooks/usePhotoLibrary';
import { PhotoType } from '../types/PhotoType';

import './ExploreContainer.css';
import PhotoGallery from './PhotoGallery';

const ExploreContainer: React.FC = () => {
    const [showPhotoGallery, setShowPhotoGallery] = useState<boolean>(false);
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoType|undefined>();

    const handleSelectedPhoto = (selectedPhoto: PhotoType): void => {
        setSelectedPhoto(selectedPhoto);
    };

    return (
        <div className="container">
            {selectedPhoto && (
                <IonImg src={selectedPhoto.webViewPath} />
            )}
            <IonButton onClick={() => setShowPhotoGallery(true)}>Pick photo from library</IonButton>
            <PhotoGallery show={showPhotoGallery} setShow={setShowPhotoGallery} onSelect={handleSelectedPhoto} />
        </div>
    );
};

export default ExploreContainer;
