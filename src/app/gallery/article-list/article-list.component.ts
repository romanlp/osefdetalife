import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs';
import {DialogImageComponent} from '../../shared/dialog-image/dialog-image.component';
import {MatDialog} from '@angular/material';
import {AngularFireStorage} from 'angularfire2/storage';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit {

  public images$: Observable<string>[];
  public posts: any;

  constructor(private firestore: AngularFirestore,
              private storage: AngularFireStorage,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.images$ = [];
    for (let i = 1; i <= 9; i++) {
      this.images$.push(this.storage.ref(`dprk/thumbs/dprk-${i}.jpg`).getDownloadURL());
    }
    this.posts = this.firestore.collection('posts').valueChanges();
  }

  public openImage(image: string) {
    this.dialog.open(DialogImageComponent, {data: image});
  }

}
