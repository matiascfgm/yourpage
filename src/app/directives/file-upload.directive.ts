import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {UploadFile} from '../class/uploadFile';
import {MatDialog} from '@angular/material';
import {MatSnackBar} from '@angular/material/snack-bar';

@Directive({
  selector: '[appFileUpload]'
})
export class FileUploadDirective {

  @Input() files: UploadFile[] = [];
  @Output() customMouseOver: EventEmitter<boolean> = new EventEmitter();

  constructor(private snackBar: MatSnackBar) {
  }

  @HostListener('dragover', ['$event'])
  public onDragEnter(event: any) {
    this.customMouseOver.emit(true);
    this._preventAndStop(event);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: any) {
    this.customMouseOver.emit(false);
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: any) {
    const transfer = this._getTransfer(event);
    if (!transfer) {
      return;
    }

    this._getFiles(transfer.files);

    this._preventAndStop(event);
    this.customMouseOver.emit(false);

  }

  private _getTransfer(event: any) {
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTranser;
  }

  private _getFiles(filesList: FileList) {
    if (filesList.length > 1) {
      this.snackBar.open('The limit is one file', '', {
        duration: 5000
      });
      return;
    }
    // tslint:disable-next-line:forin
    for (const property in Object.getOwnPropertyNames(filesList)) {
      const tempFile = filesList[property];

      if (this._canUpload(tempFile)) {
        const newFile = new UploadFile(tempFile);
        this.files.push(newFile);
      }
    }
  }

  private _canUpload(file: File): boolean {
    if (!this._fileDropped(file.name) && this._isImage(file.type)) {
      return true;
    } else {
      this.snackBar.open('Drop files of type image only');
      return false;
    }
  }

  private _preventAndStop(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  private _fileDropped(fileName: string): boolean {
    for (const file of this.files) {
      if (file.fileName === fileName) {
        console.log('exists');
        return true;
      }
    }
  }

  private _isImage(fileType: string): boolean {
    return (fileType === '' || fileType === undefined) ? false : fileType.startsWith('image');
  }

}