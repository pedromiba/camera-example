import { Filesystem } from '@capacitor/filesystem';
import { Photo, Camera, CameraSource, CameraResultType, GalleryPhotos, GalleryPhoto, CameraPermissionType, CameraPermissionState, CameraPluginPermissions } from '@capacitor/camera';
import { PhotoType } from "../types/PhotoType";

export function usePhotoLibrary() {
    const getMimeTypeFromBase64 = (base64: string): [string, string] => {
        const signatures: { [key: string]: string } = {
            '/9j/': 'image/jpeg',
            R0lGODdh: 'image/gif',
            R0lGODlh: 'image/gif',
            iVBORw0KGgo: 'image/png',
            JVBERi0: 'application/pdf',
        };

        // Try to match signature with the start of the Base64
        for (let signature in signatures) {
            if (base64.indexOf(signature) === 0) {
                return [signatures[signature], signatures[signature].split('/')[1]];
            }
        }

        return ['', ''];
    };

    const getPhoto = (base64: string): PhotoType | undefined => {
        const [mimeType, format] = getMimeTypeFromBase64(base64);

        return mimeType !== '' && format !== ''
            ? {
                  base64: base64,
                  fileName:
                      // Generate a file name.
                      new Date()
                          .toLocaleString('nl-NL')
                          .substring(0, 16)
                          .replace(/t|:|\s/gi, '_') + `.${format}`,
                  webViewPath: `data:${mimeType};base64,${base64}`,
              }
            : undefined;
    };

    const getPhotoFromPath = async (path: string): Promise<PhotoType | undefined> => {
        const contents = await Filesystem.readFile({
            path: path,
        });

        return getPhoto(contents.data);
    };

    const selectPhoto = async (): Promise<PhotoType | undefined> => {
        try {
            const photo: Photo = await Camera.getPhoto({
                quality: 60,
                width: 1920,
                source: CameraSource.Photos,
                resultType: CameraResultType.Base64,
            });

            return photo.base64String ? getPhoto(photo.base64String): undefined;
        } catch (error) {
            console.log('selectPhoto[ERROR]:', error);
        }
    };

    const getLimitedLibraryPhotos = async (): Promise<GalleryPhoto[]> => {
        try {
            const limitedLibraryPhotos: GalleryPhotos = await Camera.getLimitedLibraryPhotos();

            return limitedLibraryPhotos.photos;
        } catch (error: any) {
            console.log('getLimitedLibraryPhotos[ERROR]:', error.message);
        }

        return [];
    };

    const pickLimitedLibraryPhotos = async (): Promise<GalleryPhoto[]> => {
        try {
            const photos: GalleryPhotos = await Camera.pickLimitedLibraryPhotos();

            console.log('photos:', photos);

            return photos.photos;
        } catch (error: any) {
            console.log('pickPhotosForLimitedLibrary[ERROR]:', error.message);
        }

        return [];
    };

    const getPermissions = async (permission: CameraPermissionType): Promise<CameraPermissionState> => {
        const permissions = await Camera.checkPermissions();

        if (permission === 'photos') {
            return permissions.photos;
        }

        return permissions.camera;
    };

    const requestPermissions = async (permission: CameraPermissionType): Promise<CameraPermissionState> => {
        const permissionsRequest: CameraPluginPermissions = {
            permissions: [permission]
        };
        const permissions = await Camera.requestPermissions(permissionsRequest);

        if (permission === 'photos') {
            return permissions.photos;
        }

        return permissions.camera;
    };

    return {
        selectPhoto,
        getPermissions,
        getPhotoFromPath,
        requestPermissions,
        getLimitedLibraryPhotos,
        pickLimitedLibraryPhotos,
    }
};