import { Component, OnInit } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { DocumentSnapshot } from '@firebase/firestore-types';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isAuthenticated: boolean;
  slug: string;
  content: string;
  created: number;
  modified: number;

  subs: Subscription;

  constructor(private oktaAuth: OktaAuthService,
              private db: AngularFirestore,
              private route: ActivatedRoute) {
  }

  async ngOnInit() {
	this.route.paramMap.subscribe(params => {
      this.loadPage(params.get('slug') || 'home');
    });

    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
    this.oktaAuth.$authenticationState.subscribe(
      (isAuthenticated: boolean)  => this.isAuthenticated = isAuthenticated
    );
  }

  loadPage(slug) {
    if (this.subs) {
      this.subs.unsubscribe();
    }

    const doc = this.db.collection('pages').doc(slug).get();
    this.subs = doc.subscribe((snapshot) => {
      const page = snapshot.data();
      if (!page) {
        this.content = '### This page does not exist';
        this.slug = undefined;
      } else {
        this.slug = slug;
        this.content = page.content;
        this.created = page.created;
        this.modified = page.modified;
        console.log(page);
      }
    });
  }
}
