import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import Cropper from 'cropperjs';

export interface ImageCropperSetting {
    width: number;
    height: number;
}

export interface ImageCropperResult {
    imageData: Cropper.ImageData;
    cropData: Cropper.CropBoxData;
    blob?: Blob;
    dataUrl?: string;
}

@Component({
    selector: 'angular-cropper',
    templateUrl: './cropper.component.html',
    styleUrls: ['./cropper.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class CropperComponent implements OnInit {

    @ViewChild('image') image: ElementRef;

    @Input() imageUrl: any;
    @Input() settings: ImageCropperSetting;
    @Input() cropbox: Cropper.CropBoxData;
    @Input() loadImageErrorText: string;
    @Input() cropperOptions: any = {};

    @Output() export = new EventEmitter<ImageCropperResult>();
    @Output() ready = new EventEmitter();

    public isLoading: boolean = true;
    public cropper: Cropper;
    public imageElement: HTMLImageElement;
    public loadError: any;

    constructor() { }

    ngOnInit() {
        // console.log(this.cropperOptions);
        // console.log(this.cropbox);
        
        this.cropbox.width = this.cropperOptions.width;
        this.cropbox.height = this.cropperOptions.height;
        // console.log(this.cropbox);
    }

    /**
     * Image loaded
     * @param ev
     */
    imageLoaded(ev: Event) {

        // console.log(ev);
        
        //
        // Unset load error state
        this.loadError = false;

        //
        // Setup image element
        const image = ev.target as HTMLImageElement;
        this.imageElement = image;
        // console.log(image.width);

        //
        // Add crossOrigin?
        if (this.cropperOptions.checkCrossOrigin) image.crossOrigin = 'anonymous';

        //
        // Image on ready event
        image.addEventListener('ready', () => {
            //
            // Emit ready
            this.ready.emit(true);

            //
            // Unset loading state
            this.isLoading = false;

            //
            // Validate cropbox existance
            if (this.cropbox) {
                // console.log(this.cropbox);

                //
                // Set cropbox data

                // this.cropbox.left =500-(this.cropper.getCanvasData().width - 500)/2 ;
                // this.cropbox.top = (this.cropper.getCanvasData().height - this.cropbox.height)/2;

                this.cropbox.left = (this.cropper.getContainerData().width - image.width)/2 +  (image.width - this.cropbox.width)/2;
                this.cropbox.top = (this.cropper.getContainerData().height - image.height)/2 +  (image.height - this.cropbox.height)/2;

                // console.log(this.cropbox);
                this.cropper.setCropBoxData(this.cropbox);
            }
        });

        //
        // Setup aspect ratio according to settings
        let aspectRatio = NaN;
        if (this.settings) {
            const { width, height } = this.settings;
            aspectRatio = width / height;
        }

        //
        // Set crop options
        // extend default with custom config
        this.cropperOptions = Object.assign({
            aspectRatio,
            movable: true,
            scalable: true,
            zoomable: true,
            viewMode: 1,
            checkCrossOrigin: true
        }, this.cropperOptions);

        //
        // Set cropperjs
        this.cropper = new Cropper(image, this.cropperOptions);
    }

    /**
     * Image load error
     * @param event
     */
    imageLoadError(event: any) {

        //
        // Set load error state
        this.loadError = true;

        //
        // Unset loading state
        this.isLoading = false;
    }

    /**
     * Export canvas
     * @param base64
     */
    exportCanvas(base64?: any) {

        //
        // Get and set image, crop and canvas data
        const imageData = this.cropper.getImageData(); 
        const cropData = this.cropper.getCropBoxData();
        const canvas = this.cropper.getCroppedCanvas();
        // canvas.width = 100;
        // canvas.height = 100;
        // console.log(canvas);
        const data = { imageData, cropData };

        //
        // Create promise to resolve canvas data
        const promise = new Promise(resolve => {

            //
            // Validate base64
            if (base64) {
                
                
                //
                // Resolve promise with dataUrl
                return resolve({
                    dataUrl: canvas.toDataURL('image/png')
                });
            }
            canvas.toBlob(blob => resolve({ blob }));
        });
        // console.log(canvas.toDataURL('image/png'));
        //
        // Emit export data when promise is ready
        promise.then(res => {
            this.export.emit(Object.assign(data, res));
        });
    }
}
