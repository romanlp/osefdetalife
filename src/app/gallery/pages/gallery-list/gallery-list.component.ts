import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { collection, getDocs } from 'firebase/firestore';
import { Firebase } from '../../../common/firebase';

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
        collection(this.firebase.firestore, 'galleries'),
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
