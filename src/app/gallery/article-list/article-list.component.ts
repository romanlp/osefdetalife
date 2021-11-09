import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule, OnInit } from '@angular/core';
import { getFirestore, collection } from '@angular/fire/firestore';
import { Storage, getStorage, ref, getDownloadURL } from '@angular/fire/storage';
import { MatDialog } from '@angular/material/dialog';
import { DialogImageComponent } from '../../shared/dialog-image/dialog-image.component';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleListComponent implements OnInit {

  public images$: Promise<string>[] = [];
  public posts: any;
  public folder = 'dprk';

  constructor(private storage: Storage,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    for (let i = 1; i <= 9; i++) {
      this.images$.push(getDownloadURL(ref(this.storage, `${this.folder}/thumbs/${this.folder}-${i}.jpg`)));
    }
    this.posts = collection(getFirestore(), 'posts');
  }

  public openImage(index: number) {
    this.dialog.open(DialogImageComponent, { data: { folder: this.folder, image: this.folder + '-' + index } });
  }

}

@NgModule({
  imports: [CommonModule],
  declarations: [ArticleListComponent],
  exports: [ArticleListComponent]
})
export class ArticleListModule {
}
