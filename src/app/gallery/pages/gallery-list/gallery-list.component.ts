import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { Firebase } from '../../../common/firebase';
import { getApp } from 'firebase/app';

@Component({
  selector: 'osef-gallery-list',
  templateUrl: './gallery-list.component.html',
  styleUrls: ['./gallery-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
})
export class GalleryListComponent {
  private firebase = inject(Firebase);

  public userResource = resource({
    loader: async () => {
      const request = await getDocs(
        collection(getFirestore(getApp()), 'galleries'),
      );
      return request.docs.map((doc) => ({
        id: doc.id,
        name: doc.data()['name'],
        ...doc.data(),
      }));
    },
  });

  public docs = computed(() => this.userResource.value() ?? []);
}
