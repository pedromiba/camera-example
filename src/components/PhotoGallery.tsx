import {
    IonRow,
    IonCol,
    IonImg,
    IonGrid,
    IonModal,
    IonLabel,
    IonButton,
    IonHeader,
    IonToolbar,
    IonContent,
    IonSpinner,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { CameraPermissionState, GalleryPhoto } from '@capacitor/camera';
import { usePhotoLibrary } from '../hooks/usePhotoLibrary';
import { PhotoType } from "../types/PhotoType";

interface PhotoGalleryProps {
    show: boolean;
    setShow: (value: boolean) => void;
    onSelect: (value: PhotoType) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ show, setShow, onSelect }) => {
    const { selectPhoto, getPermissions, getPhotoFromPath, getLimitedLibraryPhotos, pickLimitedLibraryPhotos, requestPermissions } =
        usePhotoLibrary();

    const [permission, setPermission] = useState<CameraPermissionState>();
    const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
    const [showLimitedLibrary, setShowLimitedLibrary] = useState<boolean>(false);

    const loadPhotoGalleryPermissions = async (): Promise<void> => {
        const photoPermission: CameraPermissionState = await getPermissions('photos');

        setPermission(photoPermission);
    };

    const selectPhotoFromLibrary = async (): Promise<void> => {
        const selectedPhoto: PhotoType | undefined = await selectPhoto();

        console.log('[PhotoGallery::selectPhotoFromLibrary] - selectedPhoto:', selectedPhoto);

        internalSelect(selectedPhoto);
    };

    const selectPhotoFromGallery = async (path?: string): Promise<void> => {
        if (path) {
            const selectedPhoto: PhotoType | undefined = await getPhotoFromPath(path);

            internalSelect(selectedPhoto);
        }
    };

    const internalSelect = (photo?: PhotoType): void => {
        if (photo) {
            onSelect(photo);
        }

        setShowLimitedLibrary(false);
        setShow(false);
    };

    const getLibraryPhotos = async (): Promise<void> => {
        const limitedLibraryPhotos: GalleryPhoto[] = await getLimitedLibraryPhotos();

        setGalleryPhotos(limitedLibraryPhotos);
    };

    const modalDismissed = (): void => {
        setShowLimitedLibrary(false);
        setShow(false);
    };

    const handleManage = async (): Promise<void> => {
        const photos = await pickLimitedLibraryPhotos();

        console.log('new photos length:', photos.length);
    };

    const promptForPermissions = async (): Promise<void> => {
        const photoPermission: CameraPermissionState = await requestPermissions('photos');

        setPermission(photoPermission);
    };

    useEffect(() => {
        if (show) {
            switch (permission) {
                case 'denied':
                    return;

                case 'limited':
                    getLibraryPhotos();
                    setShowLimitedLibrary(true);
                    return;

                case 'granted':
                    selectPhotoFromLibrary();
                    return;

                case 'prompt':
                case 'prompt-with-rationale':
                    promptForPermissions();
                    return;
            }
        }
    }, [show, permission]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        loadPhotoGalleryPermissions();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <IonModal
            initialBreakpoint={0.5}
            breakpoints={[0, 0.5, 0.8]}
            isOpen={showLimitedLibrary}
            onDidDismiss={() => modalDismissed()}
        >
            <IonHeader>
                <IonToolbar>
                    <IonGrid>
                        <IonRow>
                            <IonCol size="8">
                                <IonLabel>You've given access to a select number of photos</IonLabel>
                            </IonCol>
                            <IonCol size="4">
                                <IonButton
                                    size="small"
                                    fill="solid"
                                    color="light"
                                    shape="round"
                                    title="Manage"
                                    onClick={handleManage}
                                >
                                    Manage
                                </IonButton>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" fullscreen>
                <IonGrid>
                    {galleryPhotos.length === 0 && <IonSpinner name="crescent" color="primary" />}

                    {Array.from(Array(Math.ceil(galleryPhotos.length / 4)).keys()).map((i) => {
                        const galleryPhotosSlice = galleryPhotos.slice(i * 4, (i + 1) * 4);

                        return (
                            <IonRow>
                                {galleryPhotosSlice.map((photo) => (
                                    <IonCol size="3" key={photo.webPath}>
                                        <IonImg
                                            src={photo.webPath}
                                            onClick={() => selectPhotoFromGallery(photo.path)}
                                        />
                                    </IonCol>
                                ))}
                            </IonRow>
                        );
                    })}
                </IonGrid>
            </IonContent>
        </IonModal>
    );
};

export default PhotoGallery;
