import { Component, OnInit, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogImageComponent } from '../../shared/dialog-image/dialog-image.component';
import { MatDialog } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit {

  public images$: Observable<string>[];
  public posts: any;
  public folder = 'dprk';

  constructor(private firestore: AngularFirestore,
              private storage: AngularFireStorage,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.images$ = [];
    for (let i = 1; i <= 9; i++) {
      this.images$.push(this.storage.ref(`${this.folder}/thumbs/${this.folder}-${i}.jpg`).getDownloadURL());
    }
    this.posts = this.firestore.collection('posts').valueChanges();
  }

  public openImage(index: string) {
    this.dialog.open(DialogImageComponent, { data: { folder: this.folder, image: this.folder + '-' + index}});
  }

}

@NgModule({
  imports: [CommonModule],
  declarations: [ArticleListComponent],
  exports: [ArticleListComponent]
})
export class ArticleListModule {
}
